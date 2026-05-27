import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: false },
    userId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    docs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doc" }]
}, {timestamps: true});

export const Note = mongoose.model("Note", noteSchema);