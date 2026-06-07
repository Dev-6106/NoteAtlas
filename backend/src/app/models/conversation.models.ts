import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    title: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
}, { timestamps: true });

conversationSchema.index({ userId: 1, noteId: 1 });

export const Conversation = mongoose.model("Conversation", conversationSchema);
