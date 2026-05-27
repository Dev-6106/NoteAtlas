import "dotenv/config";

import { Annotation, Send, StateGraph } from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { Runnable } from "@langchain/core/runnables";


// -------------------- LOAD DOCS --------------------

const loader = new CheerioWebBaseLoader(
  "https://en.wikipedia.org/wiki/Ramayana"
);

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
export async function generateStudyGuide<T extends Runnable>(llm: T, splitDocs: Document[]) {
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

    studyGuides: Annotation<string[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    collapsedStudyGuides: Annotation<Document[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    finalStudyGuide: Annotation<string>({
      reducer: (_, update) => update,
      default: () => "",
    }),
  });

  interface StudyGuideState {
    content: string;
  }


  // -------------------- PROMPTS --------------------

  const mapPrompt =
    ChatPromptTemplate.fromMessages([
      [
        "user",
        `
Create structured study notes for the following text.

Include:
- Key concepts
- Definitions
- Important points
- Examples or illustrations
- Bullet point explanations

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
The following are study guide sections.

Combine them into one well-structured final study guide.

CONTENT:
{docs}
      `,
      ],
    ]);


  // -------------------- NODES --------------------

  // Generate study guide for one chunk
  async function generateStudyGuideChunk(
    state: StudyGuideState
  ): Promise<{ studyGuides: string[] }> {
    const prompt = await mapPrompt.invoke({
      context: state.content,
    });

    const response =
      await invokeWithRetry<any>(() =>
        llm.invoke(prompt)
      );

    return {
      studyGuides: [
        String(response.content),
      ],
    };
  }


  // Map logic
  const mapStudyGuides = (
    state: typeof OverallState.State
  ) => {
    return state.contents.map(
      (content) =>
        new Send(
          "generateStudyGuideChunk",
          { content }
        )
    );
  };


  // Collect generated guides
  async function collectStudyGuides(
    state: typeof OverallState.State
  ) {
    return {
      collapsedStudyGuides:
        state.studyGuides.map(
          (guide) =>
            new Document({
              pageContent: guide,
            })
        ),
    };
  }


  // Reduce helper
  async function reduceStudyGuides(
    docs: Document[]
  ): Promise<string> {
    const docsText = docs
      .map((doc) => doc.pageContent)
      .join("\n\n");

    const prompt = await reducePrompt.invoke({
      docs: docsText,
    });

    const response =
      await invokeWithRetry<any>(() =>
        llm.invoke(prompt)
      );

    return String(response.content);
  }


  // Collapse summaries recursively
  async function collapseStudyGuides(
    state: typeof OverallState.State
  ) {
    const docLists = await splitListOfDocs(
      state.collapsedStudyGuides,
      lengthFunction,
      MAX_TOKENS
    );

    const results: Document[] = [];

    for (const docList of docLists) {
      const collapsed =
        await collapseDocs(
          docList,
          reduceStudyGuides
        );

      results.push(collapsed);
    }

    return {
      collapsedStudyGuides: results,
    };
  }


  // Decide whether more collapsing needed
  async function shouldCollapse(
    state: typeof OverallState.State
  ) {
    const numTokens = lengthFunction(
      state.collapsedStudyGuides
    );

    if (numTokens > MAX_TOKENS) {
      return "collapseStudyGuides";
    }

    return "generateFinalStudyGuide";
  }


  // Final guide
  async function generateFinalStudyGuide(
    state: typeof OverallState.State
  ) {
    const response =
      await reduceStudyGuides(
        state.collapsedStudyGuides
      );

    return {
      finalStudyGuide: response,
    };
  }


  // -------------------- GRAPH --------------------

  const graph = new StateGraph(
    OverallState
  )
    .addNode(
      "generateStudyGuideChunk",
      generateStudyGuideChunk
    )

    .addNode(
      "collectStudyGuides",
      collectStudyGuides
    )

    .addNode(
      "collapseStudyGuides",
      collapseStudyGuides
    )

    .addNode(
      "generateFinalStudyGuide",
      generateFinalStudyGuide
    )

    .addConditionalEdges(
      "__start__",
      mapStudyGuides,
      ["generateStudyGuideChunk"]
    )

    .addEdge(
      "generateStudyGuideChunk",
      "collectStudyGuides"
    )

    .addConditionalEdges(
      "collectStudyGuides",
      shouldCollapse,
      [
        "collapseStudyGuides",
        "generateFinalStudyGuide",
      ]
    )

    .addConditionalEdges(
      "collapseStudyGuides",
      shouldCollapse,
      [
        "collapseStudyGuides",
        "generateFinalStudyGuide",
      ]
    )

    .addEdge(
      "generateFinalStudyGuide",
      "__end__"
    );

  const app = graph.compile();


  // -------------------- RUN --------------------

  let finalStudyGuide: any = null;

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

    if (step.generateFinalStudyGuide) {
      finalStudyGuide = step.generateFinalStudyGuide.finalStudyGuide;
    }
  }

  // console.log(
  //   "\nFINAL STUDY GUIDE:\n",
  //   finalStudyGuide
  // );

  return finalStudyGuide;
}