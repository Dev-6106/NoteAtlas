import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    content: { type: String, required: true },
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    targetType: { type: String, enum: ["doc", "task", "annotation", "note"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    replyToId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null }
}, { timestamps: true });

commentSchema.index({ targetType: 1, targetId: 1 });

export const Comment = mongoose.model("Comment", commentSchema);
