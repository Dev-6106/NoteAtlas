/**
 * generateSummary.ts  — SEQUENTIAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Map-reduce summarisation pipeline.
 *
 * Replaces the LangGraph Send-based fan-out with a simple sequential loop
 * so that only ONE LLM request is in-flight at a time.  This is slower but
 * completely eliminates rate-limit avalanches on free-tier APIs.
 *
 * Flow:
 *   1. MAP   — summarise each chunk one-by-one (sequential)
 *   2. COLLAPSE — if combined summaries exceed MAX_TOKENS, merge groups
 *   3. REDUCE — produce the final summary
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
    `Summarise the following passage in ≤150 words.
Be concise, factual, and preserve key names, dates, and events.
Do NOT pad with filler phrases.

PASSAGE:
{context}`,
  ],
]);

const reducePrompt = ChatPromptTemplate.fromMessages([
  [
    "user",
    `Below are summaries of different sections of a document.
Merge them into ONE cohesive, well-structured summary (≤400 words).
Eliminate redundancy.  Preserve the most important facts, names, and events.
Write in flowing prose.

SUMMARIES:
{docs}`,
  ],
]);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function reduceDocs<T extends Runnable>(
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

export async function generateSummary<T extends Runnable>(
  llm: T,
  rawDocs: Document[],
): Promise<string> {

  if (!rawDocs.length) throw new Error("[generateSummary] No documents provided.");

  const splitDocs = deduplicateDocs(rawDocs);

  // ── MAP: summarise each chunk ONE AT A TIME ──────────────────────────────
  console.log(`[summary] MAP phase: ${splitDocs.length} chunks (sequential)…`);
  const summaries: string[] = [];

  for (let i = 0; i < splitDocs.length; i++) {
    console.log(`[summary]   chunk ${i + 1}/${splitDocs.length}…`);
    const prompt = await mapPrompt.invoke({ context: splitDocs[i].pageContent });
    const text   = await cachedInvoke(llm, prompt);
    summaries.push(text);
  }

  // ── COLLAPSE: merge groups until they fit in MAX_TOKENS ──────────────────
  let collapsedDocs = summaries.map((s) => new Document({ pageContent: s }));

  let collapseRound = 0;
  while (lengthFunction(collapsedDocs) > MAX_TOKENS) {
    collapseRound++;
    const groups = splitListOfDocs(collapsedDocs, MAX_TOKENS);
    console.log(`[summary] COLLAPSE round ${collapseRound}: ${groups.length} group(s)…`);

    const newDocs: Document[] = [];
    for (let i = 0; i < groups.length; i++) {
      console.log(`[summary]   group ${i + 1}/${groups.length}…`);
      const text = await reduceDocs(llm, groups[i]);
      newDocs.push(new Document({ pageContent: text }));
    }
    collapsedDocs = newDocs;
  }

  // ── REDUCE: final summary ────────────────────────────────────────────────
  console.log("[summary] REDUCE phase…");
  const finalSummary = await reduceDocs(llm, collapsedDocs);

  if (!finalSummary) {
    throw new Error("[generateSummary] Pipeline completed but produced no output.");
  }

  console.log("[summary] Done.");
  return finalSummary;
}