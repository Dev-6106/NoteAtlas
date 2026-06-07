/**
 * generateBriefingDoc.ts  — SEQUENTIAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Map-reduce briefing-doc pipeline.
 *
 * Replaces the LangGraph Send-based fan-out with a simple sequential loop
 * so that only ONE LLM request is in-flight at a time.
 *
 * Flow:
 *   1. MAP   — generate briefing sections from each chunk one-by-one
 *   2. COLLAPSE — if combined sections exceed MAX_TOKENS, merge groups
 *   3. REDUCE — produce the final briefing document
 */

import "dotenv/config";

import { Document }           from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable }           from "@langchain/core/runnables";

import {
  lengthFunction,
  splitListOfDocs,
  deduplicateDocs,
  cachedInvoke,
} from "./pipelineUtils";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TOKENS = 32_000;

// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

const mapPrompt = ChatPromptTemplate.fromMessages([
  [
    "user",
    `Create a professional briefing document for the following text.

Include:
- Summary of main ideas
- Key takeaways
- Important insights
- Actionable recommendations (if applicable)

Format as concise, clear paragraphs.

TEXT:
{context}`,
  ],
]);

const reducePrompt = ChatPromptTemplate.fromMessages([
  [
    "user",
    `The following are sections of a briefing document.

Combine them into one polished professional briefing document.

CONTENT:
{docs}`,
  ],
]);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function reduceBriefings<T extends Runnable>(
  llm: T,
  docs: Document[],
): Promise<string> {
  const docsText = docs.map((d) => d.pageContent).join("\n\n");
  const prompt   = await reducePrompt.invoke({ docs: docsText });
  return cachedInvoke(llm, prompt);
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function generateBriefingDoc<T extends Runnable>(
  llm: T,
  splitDocs: Document[],
): Promise<string> {

  if (!splitDocs.length) throw new Error("[generateBriefingDoc] No documents provided.");

  const dedupedDocs = deduplicateDocs(splitDocs);

  // ── MAP: generate briefing sections ONE AT A TIME ────────────────────────
  console.log(`[briefing] MAP phase: ${dedupedDocs.length} chunks (sequential)…`);
  const briefingChunks: string[] = [];

  for (let i = 0; i < dedupedDocs.length; i++) {
    console.log(`[briefing]   chunk ${i + 1}/${dedupedDocs.length}…`);
    const prompt = await mapPrompt.invoke({ context: dedupedDocs[i].pageContent });
    const text   = await cachedInvoke(llm, prompt);
    briefingChunks.push(text);
  }

  // ── COLLAPSE: merge groups until they fit in MAX_TOKENS ──────────────────
  let collapsedDocs = briefingChunks.map((s) => new Document({ pageContent: s }));

  let collapseRound = 0;
  while (lengthFunction(collapsedDocs) > MAX_TOKENS) {
    collapseRound++;
    const groups = splitListOfDocs(collapsedDocs, MAX_TOKENS);
    console.log(`[briefing] COLLAPSE round ${collapseRound}: ${groups.length} group(s)…`);

    const newDocs: Document[] = [];
    for (let i = 0; i < groups.length; i++) {
      console.log(`[briefing]   group ${i + 1}/${groups.length}…`);
      const text = await reduceBriefings(llm, groups[i]);
      newDocs.push(new Document({ pageContent: text }));
    }
    collapsedDocs = newDocs;
  }

  // ── REDUCE: final briefing ───────────────────────────────────────────────
  console.log("[briefing] REDUCE phase…");
  const finalBriefing = await reduceBriefings(llm, collapsedDocs);

  if (!finalBriefing) {
    throw new Error("[generateBriefingDoc] Pipeline completed but produced no output.");
  }

  console.log("[briefing] Done.");
  return finalBriefing;
}