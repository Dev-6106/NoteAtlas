import { PromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";

import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const generate_title_prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant that generates concise and clear titles.

Based on the following document content, create a single title (maximum 10 words) that captures the main theme or subject of the document.
You MUST return your response as a valid JSON object containing exactly one key "title" with the generated title string.

Document Content:
{document}
`);

export async function generateTitle<T extends Runnable>(
  llm: T, docs: Document<Record<string, any>>[],
) {
  const docToString = docs.map(doc => doc.pageContent).join('\n\n');

  const chain = generate_title_prompt.pipe(llm);

  const chainResult = await chain.invoke(
    {
      document: docToString,
    },
    {
      response_format: {
        type: "json_object",
        schema: zodToJsonSchema(
          z.object({
            title: z.string().max(100),
          }),
        ),
      },
    },
  );

  let rawContent = chainResult.content as string;
  rawContent = rawContent.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '').trim();
  
  if (!rawContent.startsWith('{')) {
      const match = rawContent.match(/\{[\s\S]*\}/);
      if (match) {
          rawContent = match[0];
      }
  }

  const result = JSON.parse(rawContent);

  return result.title;
}
