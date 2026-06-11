import mongoose, { Schema, Document } from "mongoose";

export interface IAnnotation extends Document {
  userId: mongoose.Types.ObjectId;
  docId: mongoose.Types.ObjectId;
  noteId: mongoose.Types.ObjectId;
  type: "highlight" | "note" | "bookmark" | "question";
  content?: string;
  selectedText?: string;
  startOffset?: number;
  endOffset?: number;
  color?: string;
  aiResponse?: string;
  linkedEntityIds?: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const annotationSchema: Schema<IAnnotation> = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    docId: {
      type: Schema.Types.ObjectId,
      ref: "Doc",
      required: true,
      index: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: "Note",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["highlight", "note", "bookmark", "question"],
      required: true,
    },
    content: {
      type: String,
      trim: true,
    },
    selectedText: {
      type: String,
    },
    startOffset: {
      type: Number,
    },
    endOffset: {
      type: Number,
    },
    color: {
      type: String,
    },
    aiResponse: {
      type: String,
    },
    linkedEntityIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Entity",
      },
    ],
  },
  { timestamps: true }
);

export const Annotation = mongoose.model<IAnnotation>("Annotation", annotationSchema);
