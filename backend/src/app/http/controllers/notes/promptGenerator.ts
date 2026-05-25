import { SystemMessage, HumanMessage, AIMessage } from "langchain";
import { PromptTemplate, ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import "dotenv/config";
import { ChatFireWorks } from "@langchain/community/chat_models/fireworks";

export async function generatePrompt<T extends Runnable>(llm: T, title: string): Promise<string> {
  const prompt_image_generator = PromptTemplate.fromTemplate(`
      You are an expert prompt engieer for an AI image generator. your task is to take the user's input, which is a document title, and create a single,  concise prompt to generate a logo for it.
      
      The prompt you create must instruct the image generator to produce:
      - A **minimalist and modern vector icon** that visually represents the title.
      - The style should be **flat design** with clean, simple lines.
      - The final image must be **only the logo with a transparent background**.

      Your output should be the prompt itself, and nothing more.

      Here is the user's input: **{input}**
    `);

    const chain = prompt_image_generator.pipe(llm);
    const chainResult = await chain.invoke({
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
    } as any);

    const result = JSON.parse((chainResult as any).content as string);
    return result.prompt;
};


