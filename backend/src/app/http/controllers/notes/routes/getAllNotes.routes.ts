import { Router } from "express";
import { getAllNotes } from "../getAllNotes";

export function getAllNotesRoutes(router: Router){
    router.get('/notes', getAllNotes);
    return router;
}