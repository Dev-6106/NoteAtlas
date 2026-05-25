import { Router, Express } from "express";
import { driveRoutes } from "../http/controllers/drive/routes/drive.routes";
import { createNoteRouter } from "../http/controllers/notes/routes/createNote.routes";


export function apiV1(app: Express, router: Router){
    const driveRouter = driveRoutes(router);
    const noteRouter = createNoteRouter(router);
    app.use('/api/v1',driveRouter,noteRouter)
}