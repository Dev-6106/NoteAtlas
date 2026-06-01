import { Client } from "@gradio/client";
import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');

async function checkAPI() {
    try {
        console.log("Connecting to Wan-AI/Wan2.1...");
        const app = await Client.connect("Wan-AI/Wan2.1", {
            hf_token: process.env.HUGGINGFACE_API_KEY as `hf_${string}`
        });
        const apiInfo = await app.view_api();
        console.log("API Endpoints:", JSON.stringify(apiInfo, null, 2));
    } catch (e) {
        console.error("Failed:", e.message);
    }
}

checkAPI();
