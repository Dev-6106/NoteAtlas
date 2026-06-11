import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
    name: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

folderSchema.index({ userId: 1 });

export const Folder = mongoose.model("Folder", folderSchema);
