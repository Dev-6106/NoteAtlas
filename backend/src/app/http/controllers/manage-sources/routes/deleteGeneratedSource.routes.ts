import { Router } from "express";
import { deleteGeneratedSource } from "../deleteGeneratedSource";

export function deleteGeneratedSourceRoute(router: Router){
    router.delete('/notes/generated-sources/:id', deleteGeneratedSource);
    return router;
}
