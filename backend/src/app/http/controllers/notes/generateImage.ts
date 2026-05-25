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
      "https://api.fireworks.ai/inference/v1/workflows/accounts/fireworks/models/flux-dev-fp8/text_to_image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt,
          width: 1024,
          height: 1024,
          steps: 28,
          cfg_scale: 3.5,
          seed: Math.floor(Math.random() * 1000000),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Generation failed: ${response.statusText}`);
    }

    const result = await response.json();

    // Fireworks usually returns base64 image
    const imageData = result?.image || result?.data?.[0]?.b64_json;

    if (!imageData) {
      throw new Error("No image data returned from API");
    }

    // Ensure directory exists
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }

    const finalPath = `${path}/${fileName}.png`;

    // Save image
    const buffer = Buffer.from(imageData, "base64");
    fs.writeFileSync(finalPath, buffer);

    console.log(`Image saved at ${finalPath}`);

    cb(`${fileName}.png`);
  } catch (error) {
    console.error("Error generating image:", error);
  }
};