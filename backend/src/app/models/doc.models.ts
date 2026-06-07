import mongoose from "mongoose";

const docSchema = new mongoose.Schema({
    title: { type: String, required: true },
    fileName: { type: String, required: true },
    displayName: { type: String },
    description: { type: String },
    summary: { type: String },
    studyGuide: { type: String },
    briefingDoc: { type: String },
    FAQ: { type: String },
    mindMap: { type: String },
    audioOverview: { type: String },
    
    source_type: { type: String },
    status: { type: String, enum: ['uploading', 'parsing', 'embedding', 'indexed', 'failed'], default: 'indexed' },
    errorMessage: { type: String },

    noteId: {type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
}, {timestamps: true});

docSchema.index({ userId: 1 });
docSchema.index({ noteId: 1 });

export const Doc = mongoose.model("Doc", docSchema);