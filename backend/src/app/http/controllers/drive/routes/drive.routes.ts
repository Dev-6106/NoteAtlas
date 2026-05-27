import { Router } from "express";
import { getUserDriveFiles } from "../getUserDriveFiles";
import { storeDriveFiles } from "../storeDriveFiles";


export function driveRoutes(router: Router){
    router.get('/users/files',getUserDriveFiles);
    router.post('/notes/drive-files',storeDriveFiles);
    return router; 
}