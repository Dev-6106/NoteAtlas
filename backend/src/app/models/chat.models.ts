import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
    role: { type: String, enum: ["user", "ai", "system"], required: true },
    content: { type: String, required: true },
}, { timestamps: true });

chatSchema.index({ userId: 1, noteId: 1 });

export const ChatMessage = mongoose.model("ChatMessage", chatSchema);
