import { Router, Express } from "express";
import { driveRoutes } from "../http/controllers/drive/routes/drive.routes";
import { createNoteRouter } from "../http/controllers/notes/routes/createNote.routes";
import { updateNoteRouter } from "../http/controllers/notes/routes/updateNote.routes";
import { deleteNoteRouter } from "../http/controllers/notes/routes/deleteNote.routes";
import { duplicateNoteRouter } from "../http/controllers/notes/routes/duplicateNote.routes";
import { getAllNotesRoutes } from "../http/controllers/notes/routes/getAllNotes.routes";
import { summaryRoutes } from "../http/controllers/notes/routes/summary.routes";
import { briefingRoutes } from "../http/controllers/notes/routes/briefingDoc.routes";
import { faqRoutes } from "../http/controllers/notes/routes/faq.routes";
import { studyGuideRoutes } from "../http/controllers/notes/routes/studyGuide.routes";
import { mindMapRoutes } from "../http/controllers/notes/routes/mindMap.routes";
import { mockRoutes } from "./mock.routes";
import { addSourceRoutes } from "../http/controllers/add-sources/routes/addSources.routes";
import { sourceResultRoutes } from "../http/controllers/manage-sources/routes/sourceResults.routes";
import { deleteSourceRoute } from "../http/controllers/manage-sources/routes/deleteSource.routes";
import { renameSourceRoute } from "../http/controllers/manage-sources/routes/renameSource.routes";
import { chatRoutes } from "../http/controllers/notes/routes/chat.routes";
import { quizRoutes } from "../http/controllers/notes/routes/quiz.routes";
import { flashcardRoutes } from "../http/controllers/notes/routes/flashcard.routes";
import { pptRoutes } from "../http/controllers/notes/routes/ppt.routes";
import { paymentRoutes } from "../http/controllers/notes/payment/payment.routes";
import { getDocContent } from "../http/controllers/notes/getDocContent";
import { getDocSource } from "../http/controllers/notes/getDocSource";
import { ensureAuthenticated } from "@/middleware/auth.middleware";

export function apiV1(app: Express, router: Router) {
    const driveRouter = driveRoutes(router);
    const noteRouter = createNoteRouter(router);
    const updateRouter = updateNoteRouter(router);
    const deleteRouter = deleteNoteRouter(router);
    const duplicateRouter = duplicateNoteRouter(router);
    const getAllNotesRouter = getAllNotesRoutes(router);
    const summaryRouter = summaryRoutes(router);
    const briefingRouter = briefingRoutes(router);
    const faqRouter = faqRoutes(router);
    const studyGuideRouter = studyGuideRoutes(router);
    const mindMapRouter = mindMapRoutes(router);
    const addSourceRouter = addSourceRoutes(router);
    const sourceResultsRouter = sourceResultRoutes(router);
    const deleteSourceRouter = deleteSourceRoute(router);
    const renameSourceRouter = renameSourceRoute(router);
    const mockRouter = mockRoutes(router);
    const chatRouter = chatRoutes(router);
    const quizRouter = quizRoutes(router);
    const flashcardRouter = flashcardRoutes(router);
    const pptRouter = pptRoutes(router);
    const paymentRouter = paymentRoutes(router);

    // ─── Doc content endpoint (for citation source viewer) ──
    router.get("/notes/docs/:docId/content", getDocContent);
    router.get("/notes/docs/:docId/source", getDocSource);

    app.use('/api/v1', ensureAuthenticated,
        driveRouter, noteRouter, updateRouter, deleteRouter, duplicateRouter,
        summaryRouter, briefingRouter, faqRouter, studyGuideRouter, mindMapRouter,
        getAllNotesRouter, addSourceRouter, sourceResultsRouter, deleteSourceRouter,
        renameSourceRouter, mockRouter, chatRouter, quizRouter, flashcardRouter,
        pptRouter, paymentRouter
    );
}