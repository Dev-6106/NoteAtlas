import {
    Request,
    Response,
    NextFunction,
} from "express";

import { NoteRepository }
    from "./repository/notes.repository";

export async function updateNote(
    req: Request,
    res: Response,
    next: NextFunction,
) {

    try {

        const { id, title, image, description, isArchived, isPinned } = req.body;

        if (!id) {
            return res.status(400).send({
                message: "Please provide note id",
            });
        }

        const noteRepo = NoteRepository.getInstance();
        const updatedNote = await noteRepo.updateNotes({
            id, title, image, description, isArchived, isPinned
        });

        return res.status(200).send({

            message:
                "Note updated successfully",

            updatedNote,

        });

    } catch (error) {

        next(error);

    }
}