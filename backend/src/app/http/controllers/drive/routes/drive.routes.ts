import { Router } from "express";
import { getUserDriveFiles } from "../getUserDriveFiles";
import { storeDriveFiles } from "../../add-sources/storeDriveFiles";


export function driveRoutes(router: Router){
    router.get('/users/files',getUserDriveFiles);
    return router; 
}