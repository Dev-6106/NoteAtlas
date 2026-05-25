import { Router, Express } from "express";
import { driveRoutes } from "../http/controllers/drive/routes/drive.routes";
import { createNoteRouter } from "../http/controllers/notes/routes/createNote.routes";
import { updateNoteRouter } from "../http/controllers/notes/routes/updateNote.routes";
import { getAllNotesRoutes } from "../http/controllers/notes/routes/getAllNotes.routes";
import { summaryRoutes } from "../http/controllers/notes/routes/summary.routes";

export function apiV1(app: Express, router: Router){
    const driveRouter = driveRoutes(router);
    const noteRouter = createNoteRouter(router);
    const updateRouter = updateNoteRouter(router);
    const getAllNotesRouter = getAllNotesRoutes(router);
    const summaryRouter = summaryRoutes(router);
    app.use('/api/v1',driveRouter,noteRouter, updateRouter, getAllNotesRouter, summaryRouter);
}