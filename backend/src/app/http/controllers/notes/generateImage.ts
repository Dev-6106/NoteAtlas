import fs from "fs";
import fetch from "node-fetch";

export const generateImage = async (
  prompt: string,
  path: string,
  fileName: string,
  cb: (fileName: string) => void
): Promise<void> => {
  try {
    const API_KEY = process.env.CHATFIREWORK_API_KEY;

    // Step 1: Send generation request
    const response = await fetch(
      "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-1-dev-fp8/text_to_image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "image/jpeg",
          Authorization: `Bearer ${API_KEY}`,
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
      throw new Error(`Generation failed: ${response.statusText} - ${errText}`);
    }

    // Fireworks with Accept: image/jpeg returns the raw image bytes
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure directory exists
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    const finalPath = `${path}/${fileName}.png`;

    // Save image
    fs.writeFileSync(finalPath, buffer);

    console.log(`Image saved at ${finalPath}`);

    cb(`${fileName}.png`);
  } catch (error) {
    console.error("Error generating image:", error);
  }
};