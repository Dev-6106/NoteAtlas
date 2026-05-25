import { PromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";

import { formatDocumentsAsString } from "langchain/util/document";

import z from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

const generate_title_prompt = PromptTemplate.fromTemplate(`
You are a helpful assistant that generates concise and clear titles.

Based on the following document content, create a single title that captures the main theme or subject of the document.

Document Content:
{document}

Title:
`);

export async function generateTitle<T extends Runnable>(
  llm: T,
  docs: Document<Record<string, any>>[],
) {
  const docToString = formatDocumentsAsString(docs);

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
            title: z.string().min(40).max(60),
          }),
        ),
      },
    },
  );

  const result = JSON.parse(chainResult.content as string);

  return result.title;
}
