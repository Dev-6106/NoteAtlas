import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.repository";

export async function deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).send({
                message: "Please provide note id",
            });
        }

        const noteRepo = NoteRepository.getInstance();
        await noteRepo.deleteNote(id);

        return res.status(200).send({
            message: "Note deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}
