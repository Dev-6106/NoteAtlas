import "dotenv/config";

import { Annotation, Send, StateGraph } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { Runnable } from "@langchain/core/runnables";
import { invokeWithRetry } from "@/util/invokeWithRetry";


// -------------------- LOAD DOCS --------------------


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
export async function generateBriefingDoc<T extends Runnable>(llm: T, splitDocs: Document[]) {



  // -------------------- TOKEN UTILS --------------------

  const MAX_TOKENS = 10000;

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

    briefingChunks: Annotation<string[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    collapsedBriefings: Annotation<Document[]>({
      reducer: (_, update) => update,
      default: () => [],
    }),

    finalBriefing: Annotation<string>({
      reducer: (_, update) => update,
      default: () => "",
    }),
  });

  interface BriefingState {
    content: string;
  }


  // -------------------- PROMPTS --------------------

  const mapPrompt =
    ChatPromptTemplate.fromMessages([
      [
        "user",
        `
Create a professional briefing document for the following text.

Include:
- Summary of main ideas
- Key takeaways
- Important insights
- Actionable recommendations (if applicable)

Format as concise, clear paragraphs.

TEXT:
{context}
      `,
      ],
    ]);

  const reducePrompt =
    ChatPromptTemplate.fromMessages([
      [
        "user",
        `
The following are sections of a briefing document.

Combine them into one polished professional briefing document.

CONTENT:
{docs}
      `,
      ],
    ]);


  // -------------------- NODES --------------------

  // Generate briefing for one chunk
  async function generateBriefingChunk(
    state: BriefingState
  ): Promise<{ briefingChunks: string[] }> {
    const prompt = await mapPrompt.invoke({
      context: state.content,
    });

    const response =
      await invokeWithRetry(() =>
        llm.invoke(prompt)
      );

    return {
      briefingChunks: [
        String(response.content),
      ],
    };
  }


  // Map logic
  const mapBriefingChunks = (
    state: typeof OverallState.State
  ) => {
    return state.contents.map(
      (content) =>
        new Send(
          "generateBriefingChunk",
          { content }
        )
    );
  };


  // Collect briefing chunks
  async function collectBriefingChunks(
    state: typeof OverallState.State
  ) {
    return {
      collapsedBriefings:
        state.briefingChunks.map(
          (briefing) =>
            new Document({
              pageContent: briefing,
            })
        ),
    };
  }


  // Reduce helper
  async function reduceBriefings(
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


  // Collapse recursively
  async function collapseBriefings(
    state: typeof OverallState.State
  ) {
    const docLists = await splitListOfDocs(
      state.collapsedBriefings,
      lengthFunction,
      MAX_TOKENS
    );

    const results: Document[] = [];

    for (const docList of docLists) {
      const collapsed =
        await collapseDocs(
          docList,
          reduceBriefings
        );

      results.push(collapsed);
    }

    return {
      collapsedBriefings: results,
    };
  }


  // Decide whether to collapse more
  async function shouldCollapse(
    state: typeof OverallState.State
  ) {
    const numTokens = lengthFunction(
      state.collapsedBriefings
    );

    if (numTokens > MAX_TOKENS) {
      return "collapseBriefings";
    }

    return "generateFinalBriefing";
  }


  // Final briefing generation
  async function generateFinalBriefing(
    state: typeof OverallState.State
  ) {
    const response =
      await reduceBriefings(
        state.collapsedBriefings
      );

    return {
      finalBriefing: response,
    };
  }


  // -------------------- GRAPH --------------------

  const graph = new StateGraph(
    OverallState
  )
    .addNode(
      "generateBriefingChunk",
      generateBriefingChunk
    )

    .addNode(
      "collectBriefingChunks",
      collectBriefingChunks
    )

    .addNode(
      "collapseBriefings",
      collapseBriefings
    )

    .addNode(
      "generateFinalBriefing",
      generateFinalBriefing
    )

    .addConditionalEdges(
      "__start__",
      mapBriefingChunks,
      ["generateBriefingChunk"]
    )

    .addEdge(
      "generateBriefingChunk",
      "collectBriefingChunks"
    )

    .addConditionalEdges(
      "collectBriefingChunks",
      shouldCollapse,
      [
        "collapseBriefings",
        "generateFinalBriefing",
      ]
    )

    .addConditionalEdges(
      "collapseBriefings",
      shouldCollapse,
      [
        "collapseBriefings",
        "generateFinalBriefing",
      ]
    )

    .addEdge(
      "generateFinalBriefing",
      "__end__"
    );

  const app = graph.compile();


  // -------------------- RUN --------------------

  let finalBriefing: any = null;

  for await (const step of await app.stream(
    {
      contents: splitDocs.map(
        (doc) => doc.pageContent
      ),
    },
    {
      recursionLimit: 100,

      configurable: {
        maxConcurrency: 2,
      },
    }
  )) {
    console.log(Object.keys(step));

    if (step.generateFinalBriefing) {
      finalBriefing = step.generateFinalBriefing.finalBriefing;
    }
  }

  // console.log("\nFINAL BRIEFING DOCUMENT:\n",finalBriefing);
  return finalBriefing
}