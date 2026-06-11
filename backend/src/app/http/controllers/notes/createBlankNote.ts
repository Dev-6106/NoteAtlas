import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.repository";

export async function createBlankNote(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(400).send("User ID is required");
    }

    const NoteRepo = NoteRepository.getInstance();
    const newNote = await NoteRepo.createBlankNote(userId);

    return res.status(201).send({
      message: "Blank Note Created Successfully",
      newNote
    });

  } catch (error) {
    next(error);
  }
}
