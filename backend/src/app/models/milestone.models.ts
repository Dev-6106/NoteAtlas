import mongoose from "mongoose";

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["pending", "active", "completed"], default: "pending" },
    targetDate: { type: Date, default: null },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    progress: { type: Number, default: 0 } // 0 to 100 percentage
}, { timestamps: true });

milestoneSchema.index({ noteId: 1 });

export const Milestone = mongoose.model("Milestone", milestoneSchema);
