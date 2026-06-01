import { Client } from "@gradio/client";

async function run() {
    try {
        console.log("Connecting to haoheliu/audioldm2-text2audio-text2music...");
        const app = await Client.connect("haoheliu/audioldm2-text2audio-text2music");
        const apiInfo = await app.view_api();
        console.log("API Info:", JSON.stringify(apiInfo, null, 2));

        console.log("Testing predict_batched...");
        const result = await app.predict("/predict_batched", [
            "A relaxing and ambient soundscape", // texts (Describe your music)
            null, // melodies (Condition on a melody)
        ]);
        console.log("Result:", result.data);
    } catch (e) {
        console.error(e);
    }
}

run();
