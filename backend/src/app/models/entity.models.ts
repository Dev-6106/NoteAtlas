import mongoose from "mongoose";

const entitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["person", "org", "concept", "event", "product", "location", "date", "other"],
    default: "concept",
  },
  description: { type: String },
  aliases: [{ type: String }],
  metadata: { type: mongoose.Schema.Types.Mixed },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sourceDocIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Doc" }],
  mentionCount: { type: Number, default: 1 },
  firstSeen: { type: Date, default: Date.now },
}, { timestamps: true });

entitySchema.index({ noteId: 1, userId: 1 });
entitySchema.index({ name: 1, noteId: 1 });
entitySchema.index({ type: 1, noteId: 1 });

export const Entity = mongoose.model("Entity", entitySchema);
