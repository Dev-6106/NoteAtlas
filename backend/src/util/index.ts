import { zodToJsonSchema } from "zod-to-json-schema";
import z from "zod";

export function extractMessage(state: any, messageType: "ai" | "human") {
  const lastMessage = state.messages
    .filter((m: any) => m._getType() === "human")
    .slice(-1)[0];

  return lastMessage;
}

export const gradeDocResponseFormatter = {
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "grade_document_relevance",
      schema: zodToJsonSchema(
        z.object({
          binaryScore: z
            .enum(["yes", "no"])
            .describe("Relevance score 'yes' or 'no'"),
        })
      ),
    },
  },
};

export const generateResponseFormatter = {
    response_format:{
        type:"json_object",
        schema: zodToJsonSchema(
            z.object({
                reasoning: z.string(),
                answer: z.string()
            })
        )
    }
} as any;

export const TransformResponseFormatter = {
  response_format: {
    type: "json_schema",
    json_schema: {
      name: "transform_query",
      schema: zodToJsonSchema(
        z.object({
          question: z.string(),
        })
      ),
    },
  },
};