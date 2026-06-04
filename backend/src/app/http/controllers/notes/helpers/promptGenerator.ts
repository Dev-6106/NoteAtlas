import { SystemMessage, HumanMessage, AIMessage } from "langchain";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";

import { invokeWithRetry } from "@/util/invokeWithRetry";

export async function generatePrompt<T extends Runnable>(llm: T, title: string): Promise<string> {
  const prompt_image_generator = PromptTemplate.fromTemplate(`
      You are an expert prompt engineer for an AI image generator. your task is to take the user's input, which is a document title, and create a single, concise prompt to generate a logo for it.
      
      The prompt you create must instruct the image generator to produce:
      - A **minimalist and modern vector icon** that visually represents the title.
      - The style should be **flat design** with clean, simple lines.
      - The final image must be **only the logo with a transparent background**.

      You MUST return your response as a valid JSON object containing exactly one key "prompt" with the generated prompt string.

      Here is the user's input: **{input}**
    `);

    const chain = prompt_image_generator.pipe(llm);
    const chainResult = await invokeWithRetry(() => chain.invoke({
      input: title
    },{
      response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
          z.object({
            prompt: z.string()
          })
        )
      }
    } as any));

    let rawContent = (chainResult as any).content as string;
    rawContent = rawContent.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();

    if (!rawContent.startsWith('{')) {
        const match = rawContent.match(/\{[\s\S]*\}/);
        if (match) {
            rawContent = match[0];
        }
    }

    const result = JSON.parse(rawContent);
    return result.prompt;
};


