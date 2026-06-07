import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { lengthFunction, splitListOfDocs, deduplicateDocs, cachedInvoke } from "./pipelineUtils";

const MAX_TOKENS = 32_000;

const mapPrompt = ChatPromptTemplate.fromMessages([
  [
    "user",
    `Generate {questionCount} multiple-choice questions from the following text.
Difficulty level: {difficulty}

Format the output strictly as a JSON object. Do not wrap it in markdown block quotes.
The object must have exactly these keys:
- "title": A short, catchy title for the quiz (max 5 words).
- "questions": An array of question objects.

Each question object must have exactly these keys:
- "questionText": The text of the question
- "options": An array of 4 string options
- "correctAnswer": The exact string from the options array that is correct
- "explanation": A brief explanation of why the answer is correct

TEXT:
{context}`
  ],
]);

export async function generateQuiz<T extends Runnable>(
  llm: T,
  splitDocs: Document[],
  difficulty: "easy" | "medium" | "hard" = "medium",
  questionCount: number = 5
): Promise<any[]> {
  if (!splitDocs.length) throw new Error("No documents provided.");

  const dedupedDocs = deduplicateDocs(splitDocs);
  let contextDocs = dedupedDocs;

  // If text is too long, we'll just take a large chunk to generate the quiz.
  // Alternatively, we could sample documents. For simplicity, we just collapse it.
  while (lengthFunction(contextDocs) > MAX_TOKENS) {
    const groups = splitListOfDocs(contextDocs, MAX_TOKENS);
    contextDocs = groups[0]; // just take the first group to fit in prompt
  }

  const contextText = contextDocs.map(d => d.pageContent).join("\n\n");
  const prompt = await mapPrompt.invoke({ context: contextText, difficulty, questionCount });
  const response = await cachedInvoke(llm, prompt);

  try {
    let jsonStr = response;
    // Clean up markdown block if present
    if (jsonStr.includes("```json")) {
        jsonStr = jsonStr.split("```json")[1].split("```")[0].trim();
    } else if (jsonStr.includes("```")) {
        jsonStr = jsonStr.split("```")[1].split("```")[0].trim();
    }
    
    const parsed = JSON.parse(jsonStr);
    return parsed;
  } catch (error) {
    console.error("Failed to parse quiz JSON", response);
    throw new Error("Failed to parse quiz JSON from LLM.");
  }
}
