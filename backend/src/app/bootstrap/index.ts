import { Express } from "express";
import { expressServer } from "./express/expressServer";
import { dbConnection } from "./mongoose/dbConnection";
import agenda from "./agenda/agenda";
import './agenda/jobs/image.job'

export async function bootStrapApp(app: Express, PORT: number) {
    await dbConnection();
    await agenda.start();
    expressServer(app, PORT)
}