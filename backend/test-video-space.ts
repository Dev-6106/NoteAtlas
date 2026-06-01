import { Client } from "@gradio/client";
import "dotenv/config";

async function run() {
    try {
        console.log("Connecting to ali-vilab/modelscope-text-to-video-synthesis...");
        const app = await Client.connect("ali-vilab/modelscope-text-to-video-synthesis", {
            hf_token: process.env.HUGGINGFACE_API_KEY as `hf_${string}`
        });

        console.log("API Endpoints:", JSON.stringify(await app.view_api(), null, 2));

        console.log("Testing /predict endpoint...");
        const result = await app.predict("/predict", [
            "A fast moving car", // text
            50, // steps
            100, // seed
            -1 // something else maybe? Let's not pass options if we don't know them.
        ]);
        console.log("Success:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Predict error:", e.message);
    }
}

run();
