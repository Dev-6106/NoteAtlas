import {
  END,
  START,
  StateGraph,
  Annotation,
  MessagesAnnotation,
} from "@langchain/langgraph";
import { Document } from "@langchain/core/documents";
import { extractMessage } from "./util/index.js";
import { PromptTemplate } from "@langchain/core/prompts";
import { z } from "zod";

import { queryVectorDB } from "./retreiver.js";
import { reciprocalRankFusion } from "./RRF.js";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import {
  answerPrompt,
  generate_question_prompt,
  grade_doc_prompt,
  transform_query_prompt,
} from "./prompt/prompts.js";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { TavilySearch } from "@langchain/tavily";
import { title } from "node:process";
import { AIMessage, HumanMessage } from "@langchain/core/messages";

const llm = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-v4-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.CHATFIREWORK_API_KEY,
});

const StateAnnotation = Annotation.Root({
  ...MessagesAnnotation.spec,
  nextNode: Annotation<string>({
    reducer: (previousVal, nextVal) => previousVal ?? nextVal ?? "",
  }),
  newQuery: Annotation<string>({
    reducer: (previousVal, nextVal) => previousVal ?? nextVal ?? "",
  }),
  retrievedDoc: Annotation<Document[]>({
    default: () => [],
    reducer: (previousVal, nextVal) => previousVal.concat(nextVal),
  }),
  filteredDoc: Annotation<Document[]>({
    default: () => [],
    reducer: (previousVal, nextVal) => previousVal.concat(nextVal),
  }),
});

// Create the graph
const RetreiverNode = async (state: typeof StateAnnotation.State) => {
  const lastMessage = extractMessage(state, "human");
  const query = lastMessage?.content as string;
  const generateQuestionPrompt = await generate_question_prompt.invoke({
    question: query,
  });

  const schema = z.object({
    questions: z.array(z.string()),
  });
  const structuredLlm = llm.withStructuredOutput(schema);

  const questionGenerator = await structuredLlm.invoke([
    {
      role: "user",
      content: generateQuestionPrompt.value,
    },
  ]);
  const questions = questionGenerator.questions;

  const allRetrievedDocs: Document[][] = [];

  for (const question of questions) {
    const result = await queryVectorDB(question);

    allRetrievedDocs.push(result);
  }

  const fusedDocs = reciprocalRankFusion(allRetrievedDocs) as Document[];
  return {
    retrievedDoc: fusedDocs,
  };
};
const gradeDocNode = async (state: typeof StateAnnotation.State) => {
  const lastMessage = extractMessage(state, "human");
  const allRetrievedDocs = state.retrievedDoc;

  const schema = z.object({
    binaryScore: z
      .enum(["yes", "no"])
      .describe("Relevance score 'yes' or 'no'"),
  });
  const structuredLlm = llm.withStructuredOutput(schema);
  const chain = grade_doc_prompt.pipe(structuredLlm);
  const allFilteredDoc = [] as Document[];

  for (const doc of allRetrievedDocs) {
    const result = await chain.invoke({
      question: lastMessage?.content,
      context: doc?.pageContent,
    });

    if (result.binaryScore === "yes") {
      allFilteredDoc.push(new Document({ pageContent: doc?.pageContent }));
    }
  }
  return {
    filteredDoc: allFilteredDoc,
  };
};

const transformQuery = async (state: typeof StateAnnotation.State) => {
  const lastMessage = extractMessage(state, "human");

  const schema = z.object({
    newQuestion: z
      .string()
      .describe(
        "The improved question optimized for semantic search retrieval",
      ),
  });
  const structuredLlm = llm.withStructuredOutput(schema);
  const chain = transform_query_prompt.pipe(structuredLlm);

  const result = await chain.invoke({
    question: lastMessage?.content,
  });

  return {
    newQuery: result.newQuestion,
  };
};
const webSearch = async (state: typeof StateAnnotation.State) => {
  console.log("STATE:", state);
  console.log("NEW QUERY:", state.newQuery);

  const tool = new TavilySearch({
    tavilyApiKey: process.env.TAVILY_API_KEY,
  });

  const docs = await tool.invoke({
    query: state.newQuery,
  });

  const webResult = docs?.results.map(
    (doc: any) =>
      new Document({
        pageContent: doc?.content,
        metadata: {
          title: doc?.title,
          url: doc?.url,
        },
      }),
  );

  return {
    retrievedDoc: webResult,
  };
};

const generate = async (state: typeof StateAnnotation.State) => {
  const docsToUse =
    state.filteredDoc.length > 0 ? state.filteredDoc : state.retrievedDoc;
  const docToString = docsToUse.map((doc) => doc.pageContent).join("\n\n");

  const lastMessage = extractMessage(state, "human");

  const questionPrompt = await generate_question_prompt.invoke({
    question: lastMessage?.content,
  });

  const structuredLlm = llm.withStructuredOutput(
    z.object({
      questions: z.array(z.string()),
    }),
  );

  const generatedQuestions = await structuredLlm.invoke([
    {
      role: "user",
      content: questionPrompt.toString(),
    },
  ]);

  const generatorResPrompt = await answerPrompt.invoke({
    query: lastMessage?.content,
    questions: generatedQuestions.questions.join(", "),
    retrieved_docs: docToString,
  });

  const schema = z.object({
    reasoning: z.string(),
    answer: z.string(),
  });

  const structuredAnswerLlm = llm.withStructuredOutput(schema);
  const llmResult = await structuredAnswerLlm.invoke([
    {
      role: "user",
      content: generatorResPrompt.toString(),
    },
  ]);

  return {
    messages: [new AIMessage(llmResult.answer)],
  };
};

const router = (state: typeof StateAnnotation.State) => {
  const filteredDoc = state.filteredDoc;
  if (filteredDoc.length === 0) return "transformQuery";
  return "generate";
};

const builder = new StateGraph(StateAnnotation)
  .addNode("RetreiverNode", RetreiverNode)
  .addNode("gradeDocNode", gradeDocNode)
  .addNode("generate", generate)
  .addNode("transformQuery", transformQuery)
  .addNode("webSearch", webSearch)

  .addEdge(START, "RetreiverNode")
  .addEdge("RetreiverNode", "gradeDocNode")
  .addConditionalEdges("gradeDocNode", router)
  .addEdge("transformQuery", "webSearch")
  .addEdge("webSearch", "generate")
  .addEdge("generate", END);

const app = builder.compile();

const result = await app.invoke({
  messages: [new HumanMessage({ content: "When was the ramayan writter?" })],
});

console.log("Result :::: ", result);
