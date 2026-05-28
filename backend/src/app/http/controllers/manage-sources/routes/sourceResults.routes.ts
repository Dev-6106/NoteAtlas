import { Router } from "express";
import { getSourceResults } from "../getSources";
import { generateSummarySources } from "../generateSummaryFromSources";

export function sourceResultRoutes(router: Router){
    router.post('/notes/add/sources',generateSummarySources);
    router.get('/notes/source/results',getSourceResults);
    return router;
}