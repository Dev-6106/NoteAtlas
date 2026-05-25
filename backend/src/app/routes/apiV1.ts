import { Router, Express } from "express";
import { driveRoutes } from "../http/controllers/drive/routes/drive.routes";


export function apiV1(app: Express, router: Router){
    const driveRouter = driveRoutes(router);
    app.use('/api/v1',driveRouter)
}