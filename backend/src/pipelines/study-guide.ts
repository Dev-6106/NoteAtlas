/**
 * generateStudyGuide.ts  — SEQUENTIAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Map-reduce study-guide pipeline.
 *
 * Replaces the LangGraph Send-based fan-out with a simple sequential loop
 * so that only ONE LLM request is in-flight at a time.
 *
 * Flow:
 *   1. MAP   — extract study notes from each chunk one-by-one
 *   2. COLLAPSE — if combined notes exceed MAX_TOKENS, merge groups
 *   3. REDUCE — produce the final study guide
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
    `Extract study notes from the passage below in ≤200 words.
Use this exact format — omit sections that don't apply:

**Key Concepts**: bullet list
**Definitions**: term – definition
**Important Facts**: bullet list (names, dates, numbers)
**Examples**: one-line illustrations

Be dense and factual.  No filler.

PASSAGE:
{context}`,
  ],
]);

const reducePrompt = ChatPromptTemplate.fromMessages([
  [
    "user",
    `The following are structured study-note sections from a larger document.

Merge them into a single, well-organised study guide.

Requirements:
- Use clear headings (## Overview, ## Key Concepts, ## Definitions, ## Important Facts, ## Examples)
- Eliminate duplicate entries
- Keep factual accuracy; do not invent content
- Target length: 500–800 words

SECTIONS:
{docs}`,
  ],
]);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function reduceStudyGuides<T extends Runnable>(
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

export async function generateStudyGuide<T extends Runnable>(
  llm: T,
  rawDocs: Document[],
): Promise<string> {

  if (!rawDocs.length) throw new Error("[generateStudyGuide] No documents provided.");

  const splitDocs = deduplicateDocs(rawDocs);

  // ── MAP: extract study notes ONE AT A TIME ───────────────────────────────
  console.log(`[study-guide] MAP phase: ${splitDocs.length} chunks (sequential)…`);
  const studyGuides: string[] = [];

  for (let i = 0; i < splitDocs.length; i++) {
    console.log(`[study-guide]   chunk ${i + 1}/${splitDocs.length}…`);
    const prompt = await mapPrompt.invoke({ context: splitDocs[i].pageContent });
    const text   = await cachedInvoke(llm, prompt);
    studyGuides.push(text);
  }

  // ── COLLAPSE: merge groups until they fit in MAX_TOKENS ──────────────────
  let collapsedDocs = studyGuides.map((s) => new Document({ pageContent: s }));

  let collapseRound = 0;
  while (lengthFunction(collapsedDocs) > MAX_TOKENS) {
    collapseRound++;
    const groups = splitListOfDocs(collapsedDocs, MAX_TOKENS);
    console.log(`[study-guide] COLLAPSE round ${collapseRound}: ${groups.length} group(s)…`);

    const newDocs: Document[] = [];
    for (let i = 0; i < groups.length; i++) {
      console.log(`[study-guide]   group ${i + 1}/${groups.length}…`);
      const text = await reduceStudyGuides(llm, groups[i]);
      newDocs.push(new Document({ pageContent: text }));
    }
    collapsedDocs = newDocs;
  }

  // ── REDUCE: final study guide ────────────────────────────────────────────
  console.log("[study-guide] REDUCE phase…");
  const finalStudyGuide = await reduceStudyGuides(llm, collapsedDocs);

  if (!finalStudyGuide) {
    throw new Error("[generateStudyGuide] Pipeline completed but produced no output.");
  }

  console.log("[study-guide] Done.");
  return finalStudyGuide;
}