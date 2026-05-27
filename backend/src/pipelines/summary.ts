import "dotenv/config";

import { Annotation, Send, StateGraph } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { Runnable } from "@langchain/core/runnables";


// -------------------- LOAD DOCS --------------------

// const loader = new CheerioWebBaseLoader(
//   "https://en.wikipedia.org/wiki/Ramayana"
// );

// const docs = await loader.load();

// const textSplitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 3000,
//   chunkOverlap: 200,
// });

// const splitDocs = await textSplitter.splitDocuments(docs);


// // -------------------- LLM --------------------

// const llm = new ChatFireworks({
//   model:
//     "accounts/fireworks/models/deepseek-v4-pro",
//   temperature: 0,
//   maxRetries: 5,
//   apiKey: process.env.CHATFIREWORK_API_KEY,
// });


// -------------------- RETRY UTILITY --------------------

export async function generateSummary<T extends Runnable>(llm: T, splitDocs: Document[]) {
  async function invokeWithRetry<T>(
    fn: () => Promise<T>,
    retries = 5
  ): Promise<T> {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err: any) {
        if (
          err?.status === 429 ||
          err?.code === "RATE_LIMIT_EXCEEDED"
        ) {
          const wait = Math.pow(2, i) * 1000;

          console.log(
            `Rate limited. Retrying in ${wait}ms...`
          );

          await new Promise((resolve) =>
            setTimeout(resolve, wait)
          );
        } else {
          throw err;
        }
      }
    }

    throw new Error("Max retries exceeded");
  }


  // -------------------- TOKEN UTILS --------------------

  const MAX_TOKENS = 1000;

  function approximateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  function lengthFunction(
    documents: Document[]
  ): number {
    return documents.reduce(
      (sum, doc) =>
        sum + approximateTokens(doc.pageContent),
      0
    );
  }


  // -------------------- CUSTOM HELPERS --------------------

  async function splitListOfDocs(
    docs: Document[],
    lengthFunction: (docs: Document[]) => number,
    tokenMax: number
  ): Promise<Document[][]> {
    const chunks: Document[][] = [];

    let currentChunk: Document[] = [];

    for (const doc of docs) {
      const testChunk = [...currentChunk, doc];

      if (lengthFunction(testChunk) > tokenMax) {
        if (currentChunk.length > 0) {
          chunks.push(currentChunk);
        }

        currentChunk = [doc];
      } else {
        currentChunk = testChunk;
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  async function collapseDocs(
    docs: Document[],
    reducer: (
      docs: Document[]
    ) => Promise<string>
  ): Promise<Document> {
    const reduced = await reducer(docs);

    return new Document({
      pageContent: reduced,
    });
  }


  // -------------------- STATE --------------------

  const OverallState = Annotation.Root({
    contents: Annotation<string[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    summaries: Annotation<string[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    collapsedSummaries: Annotation<Document[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    finalSummary: Annotation<string>({
      reducer: (_, update) => update,
      default: () => "",
    }),
  });

  interface SummaryState {
    content: string;
  }


  // -------------------- PROMPTS --------------------

  const mapPrompt =
    ChatPromptTemplate.fromMessages([
      [
        "user",
        "Write a concise summary of the following:\n\n{context}",
      ],
    ]);

  const reducePrompt =
    ChatPromptTemplate.fromMessages([
      [
        "user",
        "The following is a set of summaries:\n\n{docs}\n\nCreate a final consolidated summary.",
      ],
    ]);


  // -------------------- NODES --------------------

  async function generateSummary(
    state: SummaryState
  ): Promise<{ summaries: string[] }> {
    const prompt = await mapPrompt.invoke({
      context: state.content,
    });

    const result = await invokeWithRetry(() =>
      llm.invoke(prompt)
    );

    return {
      summaries: [String(result.content)],
    };
  }

  const mapSummaries = (
    state: typeof OverallState.State
  ) => {
    return state.contents.map(
      (content) =>
        new Send("generateSummary", {
          content,
        })
    );
  };

  async function collectSummaries(
    state: typeof OverallState.State
  ) {
    return {
      collapsedSummaries:
        state.summaries.map(
          (summary) =>
            new Document({
              pageContent: summary,
            })
        ),
    };
  }

  async function reduceDocs(
    docs: Document[]
  ): Promise<string> {
    const docsText = docs
      .map((doc) => doc.pageContent)
      .join("\n\n");

    const prompt = await reducePrompt.invoke({
      docs: docsText,
    });

    const response =
      await invokeWithRetry(() =>
        llm.invoke(prompt)
      );

    return String(response.content);
  }

  async function collapseSummaries(
    state: typeof OverallState.State
  ) {
    const docLists = await splitListOfDocs(
      state.collapsedSummaries,
      lengthFunction,
      MAX_TOKENS
    );

    const results: Document[] = [];

    for (const docList of docLists) {
      const collapsed = await collapseDocs(
        docList,
        reduceDocs
      );

      results.push(collapsed);
    }

    return {
      collapsedSummaries: results,
    };
  }

  async function shouldCollapse(
    state: typeof OverallState.State
  ) {
    const numTokens = lengthFunction(
      state.collapsedSummaries
    );

    if (numTokens > MAX_TOKENS) {
      return "collapseSummaries";
    }

    return "generateFinalSummary";
  }

  async function generateFinalSummary(
    state: typeof OverallState.State
  ) {
    const response = await reduceDocs(
      state.collapsedSummaries
    );

    return {
      finalSummary: response,
    };
  }


  // -------------------- GRAPH --------------------

  const graph = new StateGraph(OverallState)
    .addNode(
      "generateSummary",
      generateSummary
    )
    .addNode(
      "collectSummaries",
      collectSummaries
    )
    .addNode(
      "collapseSummaries",
      collapseSummaries
    )
    .addNode(
      "generateFinalSummary",
      generateFinalSummary
    )

    .addConditionalEdges(
      "__start__",
      mapSummaries,
      ["generateSummary"]
    )

    .addEdge(
      "generateSummary",
      "collectSummaries"
    )

    .addConditionalEdges(
      "collectSummaries",
      shouldCollapse,
      [
        "collapseSummaries",
        "generateFinalSummary",
      ]
    )

    .addConditionalEdges(
      "collapseSummaries",
      shouldCollapse,
      [
        "collapseSummaries",
        "generateFinalSummary",
      ]
    )

    .addEdge(
      "generateFinalSummary",
      "__end__"
    );

  const app = graph.compile();


  // -------------------- RUN --------------------

  // const finalSummary = await app.invoke({contents: splitDocs.map((doc)=> doc.pageContent)},{recursionLimit:10})

  let finalSummary: any = null;

  for await (const step of await app.stream(
    {
      contents: splitDocs.map(
        (doc) => doc.pageContent
      ),
    },
    {
      recursionLimit: 10,

      configurable: {
        maxConcurrency: 2,
      },
    }
  )) {
    console.log(Object.keys(step));

    if (step.generateFinalSummary) {
      finalSummary = step.generateFinalSummary.finalSummary;
    }
  }

  return finalSummary;
}