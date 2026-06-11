import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    status: { type: String, enum: ["todo", "in_progress", "done"], default: "todo" },
    priority: { type: String, enum: ["low", "medium", "high"], default: "medium" },
    dueDate: { type: Date, default: null },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignees: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    linkedDocs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doc" }],
    linkedAnnotations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Annotation" }]
}, { timestamps: true });

taskSchema.index({ noteId: 1, status: 1 });

export const Task = mongoose.model("Task", taskSchema);
