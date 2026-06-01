import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { Client } from "@gradio/client";
import { invokeWithRetry } from "@/util/invokeWithRetry";
import { env } from "@/config/env";

/**
 * Generate a short video from document content using a free Gradio Space.
 * The pipeline:
 *   1. Uses an LLM to create a short, vivid visual scene prompt from the documents
 *   2. Calls a public Wan2.1 text-to-video Gradio Space
 *   3. Returns the video data as a Buffer
 */
export async function generateVideo<T extends Runnable>(llm: T, splitDocs: Document[]): Promise<Buffer> {
  // 1. Generate a concise visual scene description from the document content
  const firstChunk = splitDocs[0]?.pageContent || "A calming nature documentary scene";

  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at creating vivid, cinematic scene descriptions for AI video generators. Create a single, concise prompt (15–25 words) that captures a visually appealing scene related to the document content. Focus on concrete visual elements, lighting, and camera movement. Return ONLY the prompt, no quotes, no extra text.",
    ],
    [
      "user",
      "Text:\n\n{context}",
    ],
  ]);

  const prompt = await promptTemplate.invoke({
    context: firstChunk.slice(0, 3000),
  });

  const llmResult = await invokeWithRetry(() => llm.invoke(prompt));
  let videoPrompt = String(llmResult.content).trim();

  // Clean up quotes if the LLM added them
  videoPrompt = videoPrompt.replace(/^["']|["']$/g, '');

  console.log("Generated Video Prompt:", videoPrompt);

  // 2. Call a public Gradio Space for text-to-video
  // Using a popular Wan2.1 text-to-video Space (ZeroGPU)
  const hfToken = env.HUGGINGFACE_API_KEY;

  if (!hfToken || hfToken === "hf_placeholder_key" || hfToken.includes("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")) {
    console.warn("⚠️ Invalid or missing HUGGINGFACE_API_KEY. Using a placeholder demo video.");
    
    // Download a free sample MP4 to act as a placeholder video
    const demoVideoUrl = "https://media.w3.org/2010/05/sintel/trailer.mp4";
    const response = await fetch(demoVideoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download placeholder video: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  try {
    const app = await Client.connect("fffiloni/Wan2.1", {
      hf_token: hfToken as `hf_${string}`,
    });

    console.log("Connected to Gradio Space, generating video...");

    // Call the prediction endpoint
    const result = await app.predict("/infer", [
      videoPrompt,        // prompt text
    ]);

    // The result typically contains a file path or URL to the generated video
    const resultData = result.data as any[];

    if (!resultData || resultData.length === 0) {
      throw new Error("No video data returned from the Gradio Space");
    }

    // The result may be a file object with a URL or path
    const videoResult = resultData[0];
    let videoUrl: string;

    if (typeof videoResult === "string") {
      videoUrl = videoResult;
    } else if (videoResult?.url) {
      videoUrl = videoResult.url;
    } else if (videoResult?.path) {
      videoUrl = videoResult.path;
    } else {
      throw new Error("Unexpected video result format from Gradio Space");
    }

    console.log("Video URL from Space:", videoUrl);

    // 3. Download the video and return as Buffer
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error(`Failed to download video: ${response.status} ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error: any) {
    console.error("Gradio Space error:", error);
    
    // Check if it's the metadata error typically caused by auth/401 issues on ZeroGPU spaces
    if (error.message?.includes("metadata could not be loaded")) {
      throw new Error("Failed to connect to the video generation space. Please ensure your HUGGINGFACE_API_KEY is valid and has read permissions.");
    }
    
    throw new Error(`Video generation failed: ${error.message}`);
  }
}
