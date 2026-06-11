import mongoose from "mongoose";

const relationshipSchema = new mongoose.Schema({
  sourceEntity: { type: mongoose.Schema.Types.ObjectId, ref: "Entity", required: true },
  targetEntity: { type: mongoose.Schema.Types.ObjectId, ref: "Entity", required: true },
  type: {
    type: String,
    enum: [
      "related_to",
      "part_of",
      "caused_by",
      "created_by",
      "works_at",
      "mentioned_with",
      "contradicts",
      "supports",
      "depends_on",
      "predecessor_of",
      "successor_of",
      "alternative_to",
      "other",
    ],
    default: "related_to",
  },
  label: { type: String },         // human-readable edge label (e.g. "founded", "competes with")
  strength: { type: Number, default: 0.5, min: 0, max: 1 },
  evidence: { type: String },      // quote from source supporting this relationship
  sourceDocId: { type: mongoose.Schema.Types.ObjectId, ref: "Doc" },
  noteId: { type: mongoose.Schema.Types.ObjectId, ref: "Note", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

relationshipSchema.index({ noteId: 1, userId: 1 });
relationshipSchema.index({ sourceEntity: 1 });
relationshipSchema.index({ targetEntity: 1 });

export const Relationship = mongoose.model("Relationship", relationshipSchema);
