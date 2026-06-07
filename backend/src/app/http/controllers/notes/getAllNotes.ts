import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.repository";

export async function getAllNotes(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const query = req.query;
    const search = (query?.search as string) ?? "";
    const page = parseInt(query?.page as string) || 1;
    const limit = Math.min(parseInt(query?.limit as string) || 10, 50);
    const userId = (query?.userId as string) || (req as any).userId || (req.user as any)?._id?.toString() || (req.user as any)?.authData?._id?.toString();
    
    const sortBy = (query?.sortBy as string) || "updatedAt";
    const sortOrder = (query?.sortOrder as string) || "desc";
    const isArchived = query?.isArchived === "true";

    const noteRepo = NoteRepository.getInstance();
    const notes = await noteRepo.getAllNotes({ 
        search, page, limit, userId, sortBy, sortOrder, isArchived 
    });

    return res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
}