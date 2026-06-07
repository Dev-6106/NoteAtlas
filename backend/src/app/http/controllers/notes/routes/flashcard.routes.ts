import { Router } from "express";
import { generateFlashcardsController, getFlashcardsController } from "../flashcards/generateFlashcards";

export function flashcardRoutes(router: Router) {
    router.post('/notes/flashcards/generate', generateFlashcardsController);
    router.get('/notes/flashcards', getFlashcardsController);
    return router;
}
