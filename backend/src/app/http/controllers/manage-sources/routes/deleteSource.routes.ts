import { Router } from "express";
import { deleteSource } from "../deleteSource";

export function deleteSourceRoute(router: Router){
    router.delete('/notes/sources/:id', deleteSource);
    return router;
}
