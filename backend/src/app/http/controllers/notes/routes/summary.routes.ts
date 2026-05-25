import { Router } from "express";
import { getDocSummary } from "../getDocSummary";
import { updateOrCreateSummary } from "../updateOrCreateSummary";

export function summaryRoutes(router: Router){
    router.get('/notes/sumarry', getDocSummary);
    router.put('/notes/summary',updateOrCreateSummary);
    return router;
}