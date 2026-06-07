import mongoose from "mongoose";

const flashcardItemSchema = new mongoose.Schema({
    front: { type: String, required: true },
    back: { type: String, required: true },
});

const flashcardSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
    title: { type: String, required: true },
    cards: [flashcardItemSchema]
}, { timestamps: true });

export const Flashcard = mongoose.model("Flashcard", flashcardSchema);
