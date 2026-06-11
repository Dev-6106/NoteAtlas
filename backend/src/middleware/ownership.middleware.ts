import { Request, Response, NextFunction } from "express";
import { Note } from "@/app/models/note.models";
import { Doc } from "@/app/models/doc.models";
import mongoose from "mongoose";

export async function verifyNoteOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    const noteId = req.params?.noteId || req.params?.id || req.body?.noteId || req.query?.noteId;
    if (!noteId) return next();
    
    // Ignore if id is "blank" or something standard
    if (noteId === "blank" || noteId === "all" || !mongoose.Types.ObjectId.isValid(noteId as string)) return next();

    const note = await Note.findById(noteId);
    if (!note) return res.status(404).send({ error: "Note not found" });
    if (note.userId.toString() !== req.userId) return res.status(403).send({ error: "Access denied" });
    
    next();
  } catch (error) {
    next(error);
  }
}

export async function verifyDocOwnership(req: Request, res: Response, next: NextFunction) {
  try {
    let docId = req.params?.docId || req.params?.id || req.query?.docId;
    
    if (!docId && req.body?.docIds && Array.isArray(req.body.docIds) && req.body.docIds.length > 0) {
        docId = req.body.docIds[0];
    } else if (!docId) {
        docId = req.body?.docId;
    }

    if (!docId || !mongoose.Types.ObjectId.isValid(docId as string)) return next();
    
    const doc = await Doc.findById(docId);
    if (!doc) return res.status(404).send({ error: "Document not found" });
    if (doc.userId.toString() !== req.userId) return res.status(403).send({ error: "Access denied" });
    
    next();
  } catch (error) {
    next(error);
  }
}
