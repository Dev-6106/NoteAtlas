import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: false },
    description: { type: String, required: false },
    isArchived: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    docs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doc" }]
}, {timestamps: true});

noteSchema.index({ userId: 1 });

export const Note = mongoose.model("Note", noteSchema);