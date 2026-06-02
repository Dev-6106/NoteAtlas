import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import * as googleTTS from "google-tts-api";
import { invokeWithRetry } from "@/util/invokeWithRetry";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";
import path from "path";
import os from "os";

// Ensure ffmpeg is available
if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

interface VideoScriptJSON {
  narration: string;
  image_prompts: string[];
}

/**
 * Generate a programmatic video overview from document content.
 * The pipeline:
 *   1. Uses an LLM to generate a JSON script containing an audio narration and 3-4 visual scene prompts.
 *   2. Generates audio from the narration using Google TTS.
 *   3. Generates images concurrently using pollinations.ai.
 *   4. Stitches the images (as a slideshow) and audio into an MP4 video using ffmpeg.
 */
export async function generateVideo<T extends Runnable>(llm: T, splitDocs: Document[]): Promise<Buffer> {
  // 1. Combine document text
  const combinedText = splitDocs.map(d => d.pageContent).join("\n\n").slice(0, 4000);

  const promptTemplate = ChatPromptTemplate.fromMessages([
    [
      "system",
      `You are a video producer. Read the text and create a short video script consisting of:
1. "narration": A concise, engaging spoken narration (40-60 words max) summarizing the key points.
2. "image_prompts": An array of exactly 4 highly descriptive, visually rich image prompts (each 15-20 words) that represent key concepts from the narration. These will be used to generate visual aids. Ensure the prompts are completely standalone and describe visual scenes.

Respond ONLY with valid JSON in the exact following format:
{{
  "narration": "Your spoken narration script here...",
  "image_prompts": ["prompt 1", "prompt 2", "prompt 3", "prompt 4"]
}}`
    ],
    [
      "user",
      "Text:\n\n{context}"
    ],
  ]);

  const prompt = await promptTemplate.invoke({
    context: combinedText,
  });

  const llmResult = await invokeWithRetry(() => llm.invoke(prompt));
  let scriptContent = String(llmResult.content).trim();

  // Extract JSON if wrapped in markdown code blocks
  if (scriptContent.startsWith("```json")) {
    scriptContent = scriptContent.replace(/^```json\n/, "").replace(/\n```$/, "");
  } else if (scriptContent.startsWith("```")) {
    scriptContent = scriptContent.replace(/^```\n/, "").replace(/\n```$/, "");
  }

  let script: VideoScriptJSON;
  try {
    script = JSON.parse(scriptContent);
  } catch (error) {
    console.error("Failed to parse LLM video script output:", scriptContent);
    throw new Error("Invalid JSON generated for video script.");
  }

  console.log("Parsed Video Script:", script);

  const numImages = script.image_prompts.length;
  if (numImages === 0) {
    throw new Error("No image prompts generated.");
  }

  // 2. Generate Audio via Google TTS (MP3 Base64)
  console.log("Generating Audio...");
  const audioChunks = await googleTTS.getAllAudioBase64(script.narration, {
    lang: "en",
    slow: false,
    host: "https://translate.google.com",
  });
  const audioBuffer = Buffer.concat(audioChunks.map(chunk => Buffer.from(chunk.base64, "base64")));

  // 3. Generate Images sequentially via Pollinations to avoid rate limits/paywalls
  console.log("Generating Images...");
  const imageBuffers: Buffer[] = [];
  let i = 1;
  for (const imgPrompt of script.image_prompts) {
    console.log(`Fetching image ${i}/${script.image_prompts.length}...`);
    const seed = Math.floor(Math.random() * 1000000);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(imgPrompt)}?seed=${seed}&width=768&height=432&nologo=true&model=turbo`;
    
    let success = false;
    let retries = 3;
    while (!success && retries > 0) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
        
        const res = await fetch(url, { 
          headers: { "User-Agent": "NotebookLMClone-VideoPipeline" },
          signal: controller.signal as any
        });
        
        clearTimeout(timeoutId);

        if (!res.ok) {
          throw new Error(`Failed to generate image from pollinations: ${res.statusText}`);
        }
        const arrayBuffer = await res.arrayBuffer();
        imageBuffers.push(Buffer.from(arrayBuffer));
        console.log(`Fetched image ${i} successfully.`);
        success = true;
      } catch (err: any) {
        console.error(`Attempt failed: ${err.message}. Retrying...`);
        retries--;
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    if (!success) {
      console.warn("Failed to fetch image from Pollinations after multiple retries. Using fallback image.");
      // Fallback to dummyimage.com
      const fallbackUrl = `https://dummyimage.com/768x432/282c34/61dafb.jpg&text=${encodeURIComponent(imgPrompt.slice(0, 30))}`;
      const res = await fetch(fallbackUrl);
      const arrayBuffer = await res.arrayBuffer();
      imageBuffers.push(Buffer.from(arrayBuffer));
    }

    i++;
  }

  // 4. Stitch Images and Audio using FFmpeg
  console.log("Stitching Video...");
  
  // Prepare temporary directory
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "video-gen-"));
  const audioPath = path.join(tmpDir, "audio.mp3");
  fs.writeFileSync(audioPath, audioBuffer);

  const imagePaths: string[] = [];
  for (let i = 0; i < imageBuffers.length; i++) {
    const imgPath = path.join(tmpDir, `image_${i.toString().padStart(3, "0")}.jpg`);
    fs.writeFileSync(imgPath, imageBuffers[i]);
    imagePaths.push(imgPath);
  }

  const outputPath = path.join(tmpDir, "output.mp4");

  // Create a concat demuxer file for ffmpeg to show images sequentially
  const concatFilePath = path.join(tmpDir, "images.txt");
  
  // Calculate duration per image (5 seconds each)
  let concatText = "";
  for (const imgPath of imagePaths) {
    concatText += `file '${imgPath.replace(/\\/g, "/")}'\n`;
    concatText += `duration 5\n`;
  }
  // To avoid issues with the last image disappearing, repeat the last image
  concatText += `file '${imagePaths[imagePaths.length - 1].replace(/\\/g, "/")}'\n`;

  fs.writeFileSync(concatFilePath, concatText);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(concatFilePath)
      .inputOptions(["-f concat", "-safe 0"])
      .input(audioPath)
      // video codec
      .videoCodec("libx264")
      .outputOptions([
        "-pix_fmt yuv420p",
        "-shortest", // Stop encoding when the shortest stream (audio) ends
        "-r 30"      // 30 fps
      ])
      .audioCodec("aac")
      .on("end", () => {
        console.log("Video generation complete.");
        try {
          const videoBuffer = fs.readFileSync(outputPath);
          
          // Cleanup
          fs.rmSync(tmpDir, { recursive: true, force: true });
          
          resolve(videoBuffer);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err, stdout, stderr) => {
        console.error("FFmpeg error:", err.message);
        console.error("FFmpeg stderr:", stderr);
        
        // Cleanup on error
        try {
          fs.rmSync(tmpDir, { recursive: true, force: true });
        } catch (e) {}
        
        reject(err);
      })
      .save(outputPath);
  });
}
