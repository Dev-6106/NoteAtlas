import fs from "fs";
import fetch from "node-fetch";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";
import { uploadToStorage } from "@/services/storage/upload.service";

export const generateImage = async (
  prompt: string,
  fileName: string,
  cb: (fileName: string) => void
): Promise<void> => {
  try {
    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "image/jpeg",
          Authorization: `Bearer ${env.CHATFIREWORK_API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          aspect_ratio: "1:1",
          guidance_scale: 3.5,
          num_inference_steps: 28,
          seed: Math.floor(Math.random() * 1000000),
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Image generation failed: ${response.statusText} - ${errText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const storageKey = await uploadToStorage(buffer, `cover-${Date.now()}.png`, "image/png", "covers");

    logger.info(`Image saved at Supabase key: ${storageKey}`);
    cb(storageKey);
  } catch (error) {
    logger.error("Error generating image", error);
  }
};