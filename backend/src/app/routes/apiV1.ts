import { Router, Express } from "express";
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
import { renameGeneratedSourceRoute } from "../http/controllers/manage-sources/routes/renameGeneratedSource.routes";
import { deleteGeneratedSourceRoute } from "../http/controllers/manage-sources/routes/deleteGeneratedSource.routes";
import { chatRoutes } from "../http/controllers/notes/routes/chat.routes";
import { quizRoutes } from "../http/controllers/notes/routes/quiz.routes";
import { flashcardRoutes } from "../http/controllers/notes/routes/flashcard.routes";
import { pptRoutes } from "../http/controllers/notes/routes/ppt.routes";
import { paymentRoutes } from "../http/controllers/notes/payment/payment.routes";
import { knowledgeGraphRoutes } from "../http/controllers/notes/routes/knowledgeGraph.routes";
import { getDocContent } from "../http/controllers/notes/getDocContent";
import { getDocSource } from "../http/controllers/notes/getDocSource";
import { ensureAuthenticated } from "@/middleware/auth.middleware";
import { verifyNoteOwnership, verifyDocOwnership } from "@/middleware/ownership.middleware";
import { annotationRoutes } from "../http/controllers/notes/annotations/annotations.routes";
import { folderRoutes } from "../http/controllers/folders/routes/folder.routes";
import { agentStudioRoutes } from "../http/controllers/notes/agents/agentStudio.routes";

export function apiV1(app: Express, router: Router) {
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
    const renameGeneratedSourceRouter = renameGeneratedSourceRoute(router);
    const deleteGeneratedSourceRouter = deleteGeneratedSourceRoute(router);
    const mockRouter = mockRoutes(router);
    const chatRouter = chatRoutes(router);
    const quizRouter = quizRoutes(router);
    const flashcardRouter = flashcardRoutes(router);
    const pptRouter = pptRoutes(router);
    const paymentRouter = paymentRoutes(router);
    const knowledgeGraphRouter = knowledgeGraphRoutes(router);
    const annotationRouter = annotationRoutes(router);
    const folderRouter = folderRoutes(router);
    const agentStudioRouter = agentStudioRoutes(router);

    // ─── Doc content endpoint (for citation source viewer) ──
    router.get("/notes/docs/:docId/content", getDocContent);
    router.get("/notes/docs/:docId/source", getDocSource);

    app.use('/api/v1', ensureAuthenticated, verifyNoteOwnership, verifyDocOwnership,
        noteRouter, updateRouter, deleteRouter, duplicateRouter,
        summaryRouter, briefingRouter, faqRouter, studyGuideRouter, mindMapRouter,
        getAllNotesRouter, addSourceRouter, sourceResultsRouter, deleteSourceRouter,
        renameSourceRouter, renameGeneratedSourceRouter, deleteGeneratedSourceRouter, mockRouter, chatRouter, quizRouter, flashcardRouter,
        pptRouter, paymentRouter, knowledgeGraphRouter, annotationRouter, folderRouter,
        agentStudioRouter
    );
}