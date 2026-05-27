import { Router } from "express";
import { getAllNotes } from "../getAllNotes";
import { getSingleNote } from "../getSingleNote";

export function getAllNotesRoutes(router: Router){
    router.get('/notes', getAllNotes);
    router.get('/notes/:id', getSingleNote);
    return router;
}