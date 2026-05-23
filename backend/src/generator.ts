import {
  AIMessage,
  SystemMessage,
  HumanMessage,
} from "@langchain/core/messages";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";
import { queryVectorDB } from "./retreiver.js";

import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

const llm = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-v4-pro",
  temperature: 0,
  maxTokens: undefined,
  timeout: undefined,
  maxRetries: 2,
  apiKey: process.env.CHATFIREWORK_API_KEY,
});

const generate_question_prompt = PromptTemplate.fromTemplate(`
   You are an AI search assistant.

   The user asked:{question}

   Step back and consider this question more broadly:
   1. Reframe it in general terms.
   2. Identify the main themes or dimensions involved.
   3. Generate 5 diverse search queries that cover these dimensions, ensuring each query explores a different perspective or phrasing.    
`);

const prompt = PromptTemplate.fromTemplate(`
   You are an assitant for question-answering tasks. Use the following pieces of information to answer the question. If you don't know the answer, just say that you don't know. Use three setences maximum and keep the answer precise.
   
   Question: {question}
   Context: {context}

   Answer:
`);

const query = "Who was the write of Ramayana?";


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

const parsedResult = JSON.parse(questionGenerator?.content as any)
const questions = parsedResult?.questions as string[];

const allRetreivedDocs = []
for(const question in questions){
    const result = await queryVectorDB(query);
    allRetreivedDocs.push(result);
}

const promptVal = await prompt.invoke({
  question: query,
  context: result[0].pageContent,
});

const llmResult = await llm.invoke([
  {
    role: "user",
    content: promptVal.value,
  },
]);

console.log(llmResult);
