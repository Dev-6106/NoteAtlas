import { ChatMessage } from "@/app/models/chat.models";
import mongoose from "mongoose";

export async function storeConversation(messages: {role: "user" | "ai" | "system", content: string, userId?: string, noteId?: string, conversationId?: string}[]) {
    try {
        if (!messages.length) return {success: true, message: "No messages to store"};
        
        // ensure all messages have userId and noteId if provided to the array
        const docs = messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            userId: msg.userId ? new mongoose.Types.ObjectId(msg.userId) : undefined,
            noteId: msg.noteId ? new mongoose.Types.ObjectId(msg.noteId) : undefined,
            conversationId: msg.conversationId ? new mongoose.Types.ObjectId(msg.conversationId) : undefined
        }));
        
        await ChatMessage.insertMany(docs);
        return {success: true, message: "Conversation stored successfully"};
    } catch (error) {
        console.error("Error storing conversation: ", error);
        return {success: false, message: "Failed to store conversation"};
    }
}

export async function getConversationHistory(userId: string, noteId: string, conversationId?: string) {
    try {
        if (!userId || !noteId || userId === 'undefined' || noteId === 'undefined') {
            return [];
        }
        
        const filter: any = { 
            userId: new mongoose.Types.ObjectId(userId), 
            noteId: new mongoose.Types.ObjectId(noteId) 
        };
        
        if (conversationId && conversationId !== 'undefined') {
            filter.conversationId = new mongoose.Types.ObjectId(conversationId);
        } else {
            // For backward compatibility, if no conversationId is requested, we might only return chats with no conversationId,
            // or we might return the oldest conversation. But ideally the client requests a specific conversation.
        }

        const history = await ChatMessage.find(filter).sort({ createdAt: 1 }).lean();
        
        return history.map(msg => ({
            role: msg.role,
            content: msg.content,
            userId: msg.userId?.toString(),
            noteId: msg.noteId?.toString(),
            conversationId: msg.conversationId?.toString()
        }));
    } catch (error) {
        console.error("Error getting conversation history: ", error);
        return [];
    }
}
