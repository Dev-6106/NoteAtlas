import fs from "fs";
import path from "path";
import { cwd } from "process";

const currDir = cwd();
const uploadsDir = path.join(currDir, "public", "chat-history");

if(!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, {recursive: true});

const HISTORY_FILE = path.join(uploadsDir, "chat-history.json");

export async function storeConversation(messages: {role: "user" | "ai" | "system", content: string, userId?: string, noteId?: string}[]) {
    try {
        let history: {role: string, content: string, userId?: string, noteId?: string}[] = [];

        if(fs.existsSync(HISTORY_FILE)){
            const data = fs.readFileSync(HISTORY_FILE, "utf-8");
            history = JSON.parse(data);
        }

        history.push(...messages);

        fs.writeFileSync(HISTORY_FILE, JSON.stringify(history, null, 2), "utf-8");
        return {success: true, message: "Conversation stored successfully"};
    } catch (error) {
        console.error("Error storing conversation: ", error);
        return {success: false, message: "Failed to store conversation"};
    }
}

export async function getConversationHistory() {
    try {
        if(fs.existsSync(HISTORY_FILE)){
            const data = fs.readFileSync(HISTORY_FILE, "utf-8");
            return JSON.parse(data);
        }
        return [];
    } catch (error) {
        console.error("Error getting conversation history: ", error);
        return [];
    }
}
