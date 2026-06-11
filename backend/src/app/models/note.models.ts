import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: false },
    description: { type: String, required: false },
    isArchived: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    folderId: { type: mongoose.Schema.Types.ObjectId, ref: "Folder", default: null },
    docs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doc" }],
    collaborators: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            role: { type: String, enum: ["viewer", "editor", "admin"], default: "editor" },
            joinedAt: { type: Date, default: Date.now }
        }
    ],
    isPublic: { type: Boolean, default: false }
}, {timestamps: true});

noteSchema.index({ userId: 1 });

export const Note = mongoose.model("Note", noteSchema);