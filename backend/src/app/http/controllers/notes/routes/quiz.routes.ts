import { Router } from "express";
import { generateQuizController } from "../quiz/generateQuiz";
import { submitQuizController } from "../quiz/submitQuiz";
import { getQuizHistoryController } from "../quiz/getQuizHistory";

export function quizRoutes(router: Router) {
    router.post('/notes/quiz/generate', generateQuizController as any);
    router.post('/notes/quiz/submit', submitQuizController as any);
    router.get('/notes/quiz/history', getQuizHistoryController as any);
    return router;
}
