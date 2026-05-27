import { Router, Express } from "express";
import { driveRoutes } from "../http/controllers/drive/routes/drive.routes";
import { createNoteRouter } from "../http/controllers/notes/routes/createNote.routes";
import { updateNoteRouter } from "../http/controllers/notes/routes/updateNote.routes";
import { getAllNotesRoutes } from "../http/controllers/notes/routes/getAllNotes.routes";
import { summaryRoutes } from "../http/controllers/notes/routes/summary.routes";
import { briefingRoutes } from "../http/controllers/notes/routes/briefingDoc.routes";
import { faqRoutes } from "../http/controllers/notes/routes/faq.routes";
import { studyGuideRoutes } from "../http/controllers/notes/routes/studyGuide.routes";
import { mindMapRoutes } from "../http/controllers/notes/routes/mindMap.routes";
import { mockRoutes } from "./mock.routes";

export function apiV1(app: Express, router: Router) {
    const driveRouter = driveRoutes(router);
    const noteRouter = createNoteRouter(router);
    const updateRouter = updateNoteRouter(router);
    const getAllNotesRouter = getAllNotesRoutes(router);
    const summaryRouter = summaryRoutes(router);
    const briefingRouter = briefingRoutes(router);
    const faqRouter = faqRoutes(router);
    const studyGuideRouter = studyGuideRoutes(router);
    const mindMapRouter = mindMapRoutes(router);
    const mockRouter = mockRoutes(router);
    app.use('/api/v1', driveRouter, noteRouter, updateRouter, summaryRouter, briefingRouter, faqRouter, studyGuideRouter, mindMapRouter, getAllNotesRouter, mockRouter);
}