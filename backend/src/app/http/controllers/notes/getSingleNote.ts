import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.repository";

export async function getSingleNote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const noteId = req.params.id;
    if (!noteId) {
      return res.status(400).send("Note ID is required");
    }

    const NoteRepo = NoteRepository.getInstance();
    const note = await NoteRepo.findById(noteId);

    return res.status(200).send({
      note
    });

  } catch (error) {
    next(error);
  }
}
