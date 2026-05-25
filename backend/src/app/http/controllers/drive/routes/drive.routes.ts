import { Router } from "express";
import { getUserDriveFiles } from "../getUserDriveFiles";


export function driveRoutes(router: Router){
    router.get('/users/files',getUserDriveFiles);
    return router; 
}