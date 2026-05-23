import { PromptTemplate } from "@langchain/core/prompts";
import { Document } from "@langchain/core/documents";
import { z } from "zod";

import { queryVectorDB } from "./retreiver.js";
import { reciprocalRankFusion } from "./RRF.js";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { answerPrompt } from "./prompts.js";

const llm = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-v4-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.CHATFIREWORK_API_KEY,
});

const generate_question_prompt = PromptTemplate.fromTemplate(`
You are an AI search assistant.

The user asked: {question}

Step back and consider this question more broadly:

1. Reframe it in general terms.
2. Identify the main themes involved.
3. Generate 5 diverse search queries exploring different perspectives.

Return ONLY valid JSON.
`);

const query = "Who was the writer of Ramayana?";

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

console.log("Generated Questions:");
console.log(questions);

const allRetrievedDocs: Document[][] = [];

for (const question of questions) {
  const result = await queryVectorDB(question);

  allRetrievedDocs.push(result);
}

const fusedDocs = reciprocalRankFusion(allRetrievedDocs) as Document[];

const docToString = fusedDocs
  .map((doc) => doc.pageContent)
  .join("\n\n");

const generatorResPrompt = await answerPrompt.invoke({
  query: query,
  questions: questions.join(", "),
  retrieved_docs: docToString,
});

const llmResult = await llm.invoke([
  {
    role: "user",
    content: generatorResPrompt.value,
  },
]);

console.log(llmResult.content);

