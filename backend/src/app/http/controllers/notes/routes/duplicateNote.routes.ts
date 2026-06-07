import { Router } from "express";
import { duplicateNote } from "../duplicateNote";

export function duplicateNoteRouter(router: Router){
    router.post("/notes/:id/duplicate", duplicateNote);
    return router;
}
