import { Router } from "express";
import { deleteNote } from "../deleteNote";

export function deleteNoteRouter(router: Router){
    router.delete("/notes/:id", deleteNote);
    return router;
}
