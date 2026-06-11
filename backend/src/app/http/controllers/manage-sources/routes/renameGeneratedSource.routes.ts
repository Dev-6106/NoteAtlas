import { Router } from "express";
import { renameGeneratedSource } from "../renameGeneratedSource";

export function renameGeneratedSourceRoute(router: Router){
    router.put('/notes/generated-sources/:id/rename', renameGeneratedSource);
    return router;
}
