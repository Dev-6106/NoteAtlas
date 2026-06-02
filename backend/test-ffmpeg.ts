import { Document } from "@langchain/core/documents";
import { generateVideo } from "./src/pipelines/video";
import fs from "fs";
import { Runnable } from "@langchain/core/runnables";

class MockLLM extends Runnable {
    async invoke(input: any) {
        return {
            content: JSON.stringify({
                narration: "A fast moving car speeds through a cyberpunk city at night. The neon lights blur past as it races towards the horizon, symbolizing the rapid pace of technological advancement.",
                image_prompts: [
                    "A fast moving futuristic car on a neon-lit cyberpunk street at night, cinematic lighting, highly detailed",
                    "A close up of glowing tires of a car moving very fast, motion blur, cyberpunk aesthetic",
                    "A wide shot of a glowing neon city skyline at night, cars rushing by on a futuristic highway",
                    "A driver's POV from inside a futuristic car moving fast, glowing dashboard, neon city passing by"
                ]
            })
        };
    }
}

async function run() {
    const splitDocs = [new Document({ pageContent: "Dummy document content about futuristic cars." })];
    const llm = new MockLLM();
    try {
        console.log("Starting video generation test...");
        const buffer = await generateVideo(llm, splitDocs);
        fs.writeFileSync("output_test.mp4", buffer);
        console.log("Successfully created output_test.mp4, size:", buffer.byteLength);
    } catch (e) {
        console.error("Test failed:", e);
    }
}

run();
