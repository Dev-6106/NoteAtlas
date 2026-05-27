import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.repository";

import mongoose from "mongoose";

export async function getSingleNote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const noteId = req.params?.id as string;
    if (!noteId) {
      return res.status(422).send("Note ID is required");
    }

    if (!mongoose.Types.ObjectId.isValid(noteId)) {
      return res.status(400).send("Invalid Note ID format");
    }

    const NoteRepo = NoteRepository.getInstance();
    const note = await NoteRepo.getSingleNote(noteId);
    return res.status(200).send({note});
  } catch (error) {
    next(error);
  }
}
