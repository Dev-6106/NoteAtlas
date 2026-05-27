import { Router } from "express";
import { storeDriveFiles } from "./storeDriveFiles";
import { storeWebLinkFiles } from "./storeWebLinkData";



export function addSourceRoutes(router: Router){
    router.post('/notes/drive-files',storeDriveFiles);
    router.post('/notes/weblinkdata',storeWebLinkFiles);
    return router; 
}