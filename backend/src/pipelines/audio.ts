import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import * as googleTTS from 'google-tts-api';
import { invokeWithRetry } from "@/util/invokeWithRetry";
import { env } from "@/config/env";

export async function generateAudio<T extends Runnable>(llm: T, splitDocs: Document[]): Promise<Buffer> {
  // 1. Generate a short spoken summary from the document
  const combinedText = splitDocs.map(d => d.pageContent).join("\n\n").slice(0, 3000);
  
  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      "You are an expert at creating concise summaries. Create a very short, 1 to 2 sentence summary of the provided text, designed to be spoken aloud as a quick audio overview. Return ONLY the spoken summary text, no quotes or extra text.",
    ],
    [
      "user",
      "Text:\n\n{context}",
    ],
  ]);

  const prompt = await promptTemplate.invoke({
    context: combinedText,
  });

  const llmResult = await invokeWithRetry(() => llm.invoke(prompt));
  let audioPrompt = String(llmResult.content).trim();
  
  // Clean up quotes if the LLM added them
  audioPrompt = audioPrompt.replace(/^["']|["']$/g, '');
  
  console.log("Generated Audio Overview Script:", audioPrompt);

  // 2. Call Google TTS API
  const chunks = await googleTTS.getAllAudioBase64(audioPrompt, {
    lang: 'en',
    slow: false,
    host: 'https://translate.google.com',
  });

  // 3. Return the binary audio buffer (MP3 format)
  const buffers = chunks.map(chunk => Buffer.from(chunk.base64, 'base64'));
  return Buffer.concat(buffers);
}


/**
 * Generate a spoken podcast-style narration from document content.
 * Pipeline:
 *   1. Uses the LLM to create a concise, engaging podcast narration script
 *   2. Calls HF Inference API with microsoft/speecht5_tts for TTS
 *   3. Returns the audio Buffer (WAV format)
 */
export async function generateSpeechAudio<T extends Runnable>(llm: T, splitDocs: Document[]): Promise<Buffer> {
  // 1. Generate a podcast-style narration script from the documents
  const combinedText = splitDocs.map(d => d.pageContent).join("\n\n").slice(0, 6000);

  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a professional podcast narrator. Create a short, engaging spoken narration (100–200 words) that summarizes the key points of the provided text. 
Write it as if you are narrating a podcast episode — conversational, clear, and informative. 
Do NOT include any stage directions, speaker labels, or non-speech annotations. 
Return ONLY the narration text, nothing else.`,
    ],
    [
      "user",
      "Text:\n\n{context}",
    ],
  ]);

  const prompt = await promptTemplate.invoke({
    context: combinedText,
  });

  const llmResult = await invokeWithRetry(() => llm.invoke(prompt));
  let narrationScript = String(llmResult.content).trim();

  // Clean up quotes if the LLM added them
  narrationScript = narrationScript.replace(/^["']|["']$/g, '');

  console.log("Generated Narration Script:", narrationScript.slice(0, 100) + "...");

  // 2. Call Google TTS API for TTS
  const chunks = await googleTTS.getAllAudioBase64(narrationScript, {
    lang: 'en',
    slow: false,
    host: 'https://translate.google.com',
  });

  // 3. Return the binary audio buffer (MP3 format)
  const buffers = chunks.map(chunk => Buffer.from(chunk.base64, 'base64'));
  return Buffer.concat(buffers);
}
