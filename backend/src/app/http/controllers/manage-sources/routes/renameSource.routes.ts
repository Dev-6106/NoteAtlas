import { Router } from "express";
import { renameSource } from "../renameSource";

export function renameSourceRoute(router: Router){
    router.put('/notes/sources/:id/rename', renameSource);
    return router;
}
