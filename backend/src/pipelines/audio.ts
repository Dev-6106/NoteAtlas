import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import fetch from "node-fetch";
import { invokeWithRetry } from "@/util/invokeWithRetry";
import { env } from "@/config/env";

export async function generateAudio<T extends Runnable>(llm: T, splitDocs: Document[]): Promise<Buffer> {
  // 1. Generate a short audio prompt from the first chunk of the document
  const firstChunk = splitDocs[0]?.pageContent || "A relaxing and ambient soundscape";
  
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at creating concise, 5 to 10 word prompts for AI music generators like stable-audio. Create a prompt that captures the essence, mood, or topic of the provided text. Return ONLY the prompt, no quotes, no extra text.",
    ],
    [
      "user",
      "Text:\n\n{context}",
    ],
  ]);

  const prompt = await promptTemplate.invoke({
    context: firstChunk.slice(0, 3000), // Limit context to avoid context window issues
  });

  const llmResult = await invokeWithRetry(() => llm.invoke(prompt));
  let audioPrompt = String(llmResult.content).trim();
  
  // Clean up quotes if the LLM added them
  audioPrompt = audioPrompt.replace(/^["']|["']$/g, '');
  
  console.log("Generated Audio Prompt:", audioPrompt);

  // 2. Call the Hugging Face Inference API
  const hfToken = env.HUGGINGFACE_API_KEY;
  if (!hfToken || hfToken === "hf_placeholder_key") {
    throw new Error("Invalid or missing HUGGINGFACE_API_KEY");
  }

  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/stabilityai/stable-audio-open-1.0",
    {
      headers: {
        Authorization: `Bearer ${hfToken}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: audioPrompt }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API Error (${response.status}): ${errorText}`);
  }

  // 3. Return the binary audio buffer
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
