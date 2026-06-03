import { ChatMessage } from "../../../models/chat.models";

export async function storeConversation(messages: {role: "user" | "ai" | "system", content: string, userId?: string, noteId?: string}[]) {
    try {
        if (!messages.length) return {success: true, message: "No messages to store"};
        
        // ensure all messages have userId and noteId if provided to the array
        const docs = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            userId: msg.userId,
            noteId: msg.noteId
        }));
        
        await ChatMessage.insertMany(docs);
        return {success: true, message: "Conversation stored successfully"};
    } catch (error) {
        console.error("Error storing conversation: ", error);
        return {success: false, message: "Failed to store conversation"};
    }
}

export async function getConversationHistory(userId: string, noteId: string) {
    try {
        const history = await ChatMessage.find({ userId, noteId }).sort({ createdAt: 1 }).lean();
        return history.map(msg => ({
            role: msg.role,
            content: msg.content,
            userId: msg.userId,
            noteId: msg.noteId
        }));
    } catch (error) {
        console.error("Error getting conversation history: ", error);
        return [];
    }
}
