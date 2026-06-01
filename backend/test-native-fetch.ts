import "dotenv/config";
import dns from "node:dns";
dns.setDefaultResultOrder('ipv4first');

async function testNativeFetchWithRealToken() {
    try {
        console.log("Testing native fetch to space host API with token:", process.env.HUGGINGFACE_API_KEY);
        // Using the correct space ID: Wan-AI/Wan2.1
        const res = await fetch("https://huggingface.co/api/spaces/Wan-AI/Wan2.1/host", {
            headers: {
                Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`
            }
        });
        console.log("Native fetch success!", res.status);
        if (res.ok) {
            console.log("Response:", await res.json());
        } else {
            console.log("Error body:", await res.text());
        }
    } catch (e) {
        console.error("Native fetch failed:", e.message);
    }
}

testNativeFetchWithRealToken();
