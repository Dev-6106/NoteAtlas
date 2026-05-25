import { Router } from "express";
import { updateNote } from "../updateNote";


export function updateNoteRouter(router: Router){
    router.put("/notes",updateNote)
    return router;
}