import {
    Request,
    Response,
    NextFunction,
} from "express";

import { NoteRepository }
    from "./repository/notes.respository";

export async function updateNote(
    req: Request,
    res: Response,
    next: NextFunction,
) {

    try {

        const { id, title } = req.body;

        if (!id || !title) {

            return res.status(400).send({
                message:
                    "Please provide id and title",
            });

        }

        const noteRepo =
            NoteRepository.getInstance();

        const updatedNote =
            await noteRepo.updateNotes({
                id,
                title,
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