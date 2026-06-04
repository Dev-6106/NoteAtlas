/**
 * generateStudyGuide.ts  — OPTIMISED
 * ─────────────────────────────────────────────────────────────────────────────
 * Map-reduce study-guide pipeline built on LangGraph.
 *
 * Same optimisation story as generateSummary.ts; study-guide specific changes:
 *  • Map prompt: produce COMPACT structured notes (≤200 words per chunk)
 *    to reduce collapse-round counts
 *  • Reduce prompt: outputs a professionally formatted guide with H2 sections
 *  • Parallel collapse identical to the summary pipeline
 */

import "dotenv/config";

import { Annotation, Send, StateGraph } from "@langchain/langgraph";
import { Document }                     from "@langchain/core/documents";
import { ChatPromptTemplate }           from "@langchain/core/prompts";
import { Runnable }                     from "@langchain/core/runnables";

import {
  lengthFunction,
  splitListOfDocs,
  deduplicateDocs,
  pLimit,
  cachedInvoke,
} from "./pipelineUtils";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const MAX_TOKENS      = 32_000;
/**
 * Gemini free tier: 15 RPM. With the 4s throttle gap in pipelineUtils,
 * sequential processing (1 worker) stays safely within limits.
 * Gemini's 1M TPM means tokens are never the bottleneck.
 */
const MAP_CONCURRENCY = 1;

// ─────────────────────────────────────────────────────────────────────────────
// PROMPTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Map prompt: dense, compact study notes per chunk.
 * Hard word-count cap keeps each output small so the reduce layer
 * needs fewer passes.
 */
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

/**
 * Reduce prompt: merge into a clean, readable study guide.
 */
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
// MAIN EXPORT
// ─────────────────────────────────────────────────────────────────────────────

export async function generateStudyGuide<T extends Runnable>(
  llm: T,
  rawDocs: Document[],
): Promise<string> {

  if (!rawDocs.length) throw new Error("[generateStudyGuide] No documents provided.");

  const splitDocs = deduplicateDocs(rawDocs);

  // ─────────────────────────────────────────────────────────────────────────
  // STATE
  // ─────────────────────────────────────────────────────────────────────────

  const OverallState = Annotation.Root({
    contents: Annotation<string[]>({
      reducer: (s, u) => s.concat(u),
      default: () => [],
    }),
    studyGuides: Annotation<string[]>({
      reducer: (s, u) => s.concat(u),
      default: () => [],
    }),
    collapsedStudyGuides: Annotation<Document[]>({
      reducer: (_, u) => u,
      default: () => [],
    }),
    finalStudyGuide: Annotation<string>({
      reducer: (_, u) => u,
      default: () => "",
    }),
  });

  interface StudyGuideState { content: string }

  // ─────────────────────────────────────────────────────────────────────────
  // NODES
  // ─────────────────────────────────────────────────────────────────────────

  /** MAP: extract study notes from one chunk */
  async function generateStudyGuideChunk(
    state: StudyGuideState,
  ): Promise<{ studyGuides: string[] }> {
    const prompt = await mapPrompt.invoke({ context: state.content });
    const text   = await cachedInvoke(llm, prompt);
    return { studyGuides: [text] };
  }

  /** Fan-out */
  const mapStudyGuides = (state: typeof OverallState.State) =>
    state.contents.map((content) =>
      new Send("generateStudyGuideChunk", { content }),
    );

  /** Collect per-chunk guides into Documents */
  async function collectStudyGuides(state: typeof OverallState.State) {
    return {
      collapsedStudyGuides: state.studyGuides.map(
        (g) => new Document({ pageContent: g }),
      ),
    };
  }

  /** Reduce a list of Documents → single guide string */
  async function reduceStudyGuides(docs: Document[]): Promise<string> {
    const docsText = docs.map((d) => d.pageContent).join("\n\n");
    const prompt   = await reducePrompt.invoke({ docs: docsText });
    return cachedInvoke(llm, prompt);
  }

  /**
   * COLLAPSE: all groups run in parallel.
   */
  async function collapseStudyGuides(state: typeof OverallState.State) {
    const docLists = splitListOfDocs(state.collapsedStudyGuides, MAX_TOKENS);

    const tasks = docLists.map(
      (group) => async () =>
        new Document({ pageContent: await reduceStudyGuides(group) }),
    );

    const results = await pLimit(tasks, MAP_CONCURRENCY);
    return { collapsedStudyGuides: results };
  }

  /** Route */
  function shouldCollapse(state: typeof OverallState.State): string {
    return lengthFunction(state.collapsedStudyGuides) > MAX_TOKENS
      ? "collapseStudyGuides"
      : "generateFinalStudyGuide";
  }

  /** Final reduce */
  async function generateFinalStudyGuide(state: typeof OverallState.State) {
    return { finalStudyGuide: await reduceStudyGuides(state.collapsedStudyGuides) };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // GRAPH
  // ─────────────────────────────────────────────────────────────────────────

  const graph = new StateGraph(OverallState)
    .addNode("generateStudyGuideChunk",  generateStudyGuideChunk)
    .addNode("collectStudyGuides",       collectStudyGuides)
    .addNode("collapseStudyGuides",      collapseStudyGuides)
    .addNode("generateFinalStudyGuide",  generateFinalStudyGuide)

    .addConditionalEdges("__start__",              mapStudyGuides,  ["generateStudyGuideChunk"])
    .addEdge(            "generateStudyGuideChunk", "collectStudyGuides")
    .addConditionalEdges("collectStudyGuides",      shouldCollapse,  ["collapseStudyGuides", "generateFinalStudyGuide"])
    .addConditionalEdges("collapseStudyGuides",     shouldCollapse,  ["collapseStudyGuides", "generateFinalStudyGuide"])
    .addEdge(            "generateFinalStudyGuide", "__end__");

  const app = graph.compile();

  // ─────────────────────────────────────────────────────────────────────────
  // RUN
  // ─────────────────────────────────────────────────────────────────────────

  let finalStudyGuide = "";

  for await (const step of await app.stream(
    { contents: splitDocs.map((d) => d.pageContent) },
    {
      recursionLimit: 100,
      configurable: { maxConcurrency: MAP_CONCURRENCY }, // matches pLimit above
    },
  )) {
    if (step.generateFinalStudyGuide?.finalStudyGuide) {
      finalStudyGuide = step.generateFinalStudyGuide.finalStudyGuide;
    }
  }

  if (!finalStudyGuide) {
    throw new Error("[generateStudyGuide] Pipeline completed but produced no output.");
  }

  return finalStudyGuide;
}