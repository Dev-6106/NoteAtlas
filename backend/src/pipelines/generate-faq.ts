/**
 * generateFAQ.ts  — SEQUENTIAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Map-reduce FAQ pipeline.
 *
 * Replaces the LangGraph Send-based fan-out with a simple sequential loop
 * so that only ONE LLM request is in-flight at a time.
 *
 * Flow:
 *   1. MAP   — generate FAQs from each chunk one-by-one
 *   2. COLLAPSE — if combined FAQs exceed MAX_TOKENS, merge groups
 *   3. REDUCE — produce the final FAQ document
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
    `Create a set of FAQs (questions and answers) from the following text.

Each FAQ should include:
- A clear question
- A concise, accurate answer

Format as a list of Q&A.

TEXT:
{context}`,
  ],
]);

const reducePrompt = ChatPromptTemplate.fromMessages([
  [
    "user",
    `The following are FAQ sections generated from different parts of a document.

Combine them into one clean, non-redundant FAQ document.

CONTENT:
{docs}`,
  ],
]);

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function reduceFAQs<T extends Runnable>(
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

export async function generateFAQ<T extends Runnable>(
  llm: T,
  splitDocs: Document[],
): Promise<string> {

  if (!splitDocs.length) throw new Error("[generateFAQ] No documents provided.");

  const dedupedDocs = deduplicateDocs(splitDocs);

  // ── MAP: generate FAQs ONE AT A TIME ─────────────────────────────────────
  console.log(`[faq] MAP phase: ${dedupedDocs.length} chunks (sequential)…`);
  const faqChunks: string[] = [];

  for (let i = 0; i < dedupedDocs.length; i++) {
    console.log(`[faq]   chunk ${i + 1}/${dedupedDocs.length}…`);
    const prompt = await mapPrompt.invoke({ context: dedupedDocs[i].pageContent });
    const text   = await cachedInvoke(llm, prompt);
    faqChunks.push(text);
  }

  // ── COLLAPSE: merge groups until they fit in MAX_TOKENS ──────────────────
  let collapsedDocs = faqChunks.map((s) => new Document({ pageContent: s }));

  let collapseRound = 0;
  while (lengthFunction(collapsedDocs) > MAX_TOKENS) {
    collapseRound++;
    const groups = splitListOfDocs(collapsedDocs, MAX_TOKENS);
    console.log(`[faq] COLLAPSE round ${collapseRound}: ${groups.length} group(s)…`);

    const newDocs: Document[] = [];
    for (let i = 0; i < groups.length; i++) {
      console.log(`[faq]   group ${i + 1}/${groups.length}…`);
      const text = await reduceFAQs(llm, groups[i]);
      newDocs.push(new Document({ pageContent: text }));
    }
    collapsedDocs = newDocs;
  }

  // ── REDUCE: final FAQ ────────────────────────────────────────────────────
  console.log("[faq] REDUCE phase…");
  const finalFAQ = await reduceFAQs(llm, collapsedDocs);

  if (!finalFAQ) {
    throw new Error("[generateFAQ] Pipeline completed but produced no output.");
  }

  console.log("[faq] Done.");
  return finalFAQ;
}