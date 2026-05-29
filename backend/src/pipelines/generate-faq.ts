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
export async function generateFAQ<T extends Runnable>(llm: T, splitDocs: Document[]) {



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

    faqChunks: Annotation<string[]>({
      reducer: (state, update) =>
        state.concat(update),
      default: () => [],
    }),

    collapsedFaqs: Annotation<Document[]>({
      reducer: (_, update) => update,
      default: () => [],
    }),

    finalFAQ: Annotation<string>({
      reducer: (_, update) => update,
      default: () => "",
    }),
  });

  interface FAQState {
    content: string;
  }


  // -------------------- PROMPTS --------------------

  const mapPrompt =
    ChatPromptTemplate.fromMessages([
      [
        "user",
        `
Create a set of FAQs (questions and answers) from the following text.

Each FAQ should include:
- A clear question
- A concise, accurate answer

Format as a list of Q&A.

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
The following are FAQ sections generated from different parts of a document.

Combine them into one clean, non-redundant FAQ document.

CONTENT:
{docs}
      `,
      ],
    ]);


  // -------------------- NODES --------------------

  // Generate FAQ for one chunk
  async function generateFAQChunk(
    state: FAQState
  ): Promise<{ faqChunks: string[] }> {
    const prompt = await mapPrompt.invoke({
      context: state.content,
    });

    const response =
      await invokeWithRetry<any>(() =>
        llm.invoke(prompt)
      );

    return {
      faqChunks: [
        String(response.content),
      ],
    };
  }


  // Map logic
  const mapFAQChunks = (
    state: typeof OverallState.State
  ) => {
    return state.contents.map(
      (content) =>
        new Send(
          "generateFAQChunk",
          { content }
        )
    );
  };


  // Collect generated FAQ chunks
  async function collectFAQChunks(
    state: typeof OverallState.State
  ) {
    return {
      collapsedFaqs:
        state.faqChunks.map(
          (faq) =>
            new Document({
              pageContent: faq,
            })
        ),
    };
  }


  // Reduce helper
  async function reduceFAQs(
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


  // Collapse recursively
  async function collapseFAQs(
    state: typeof OverallState.State
  ) {
    const docLists = await splitListOfDocs(
      state.collapsedFaqs,
      lengthFunction,
      MAX_TOKENS
    );

    const results: Document[] = [];

    for (const docList of docLists) {
      const collapsed =
        await collapseDocs(
          docList,
          reduceFAQs
        );

      results.push(collapsed);
    }

    return {
      collapsedFaqs: results,
    };
  }


  // Decide whether to collapse more
  async function shouldCollapse(
    state: typeof OverallState.State
  ) {
    const numTokens = lengthFunction(
      state.collapsedFaqs
    );

    if (numTokens > MAX_TOKENS) {
      return "collapseFAQs";
    }

    return "generateFinalFAQ";
  }


  // Generate final FAQ document
  async function generateFinalFAQ(
    state: typeof OverallState.State
  ) {
    const response =
      await reduceFAQs(
        state.collapsedFaqs
      );

    return {
      finalFAQ: response,
    };
  }


  // -------------------- GRAPH --------------------

  const graph = new StateGraph(
    OverallState
  )
    .addNode(
      "generateFAQChunk",
      generateFAQChunk
    )

    .addNode(
      "collectFAQChunks",
      collectFAQChunks
    )

    .addNode(
      "collapseFAQs",
      collapseFAQs
    )

    .addNode(
      "generateFinalFAQ",
      generateFinalFAQ
    )

    .addConditionalEdges(
      "__start__",
      mapFAQChunks,
      ["generateFAQChunk"]
    )

    .addEdge(
      "generateFAQChunk",
      "collectFAQChunks"
    )

    .addConditionalEdges(
      "collectFAQChunks",
      shouldCollapse,
      [
        "collapseFAQs",
        "generateFinalFAQ",
      ]
    )

    .addConditionalEdges(
      "collapseFAQs",
      shouldCollapse,
      [
        "collapseFAQs",
        "generateFinalFAQ",
      ]
    )

    .addEdge(
      "generateFinalFAQ",
      "__end__"
    );

  const app = graph.compile();


  // -------------------- RUN --------------------

  let finalFAQ: any = null;

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

    if (
      step.hasOwnProperty(
        "generateFinalFAQ"
      )
    ) {
      finalFAQ =
        step.generateFinalFAQ?.finalFAQ;
    }
  }

  // console.log("\nFINAL FAQ DOCUMENT:\n",finalFAQ);
  return finalFAQ
}