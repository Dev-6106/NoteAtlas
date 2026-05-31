import mongoose from "mongoose";

const sourceSchema = new mongoose.Schema({
    title: {type: String},
    total_source: {type: Number},
    content: {type: String},
    source_type: {type: String},
    noteId: {type: mongoose.Schema.Types.ObjectId, ref: "Note",required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User",required: true},
}, {timestamps: true});

sourceSchema.index({ userId: 1 });
sourceSchema.index({ noteId: 1 });

export const Source = mongoose.model("Source",sourceSchema);