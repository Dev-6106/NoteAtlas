import fetch from "node-fetch";

async function testVideoEndpoint() {
    try {
        console.log("Fetching video from image.pollinations.ai...");
        const res = await fetch("https://image.pollinations.ai/prompt/a%20fast%20moving%20car?model=wan", {
            redirect: 'follow'
        });
        
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        
        if (res.headers.get("content-type")?.includes("video")) {
            console.log("Success! It returned a video!");
        } else {
            console.log("It did not return a video.");
        }
    } catch (e) {
        console.error("Failed:", e);
    }
}

testVideoEndpoint();
