import { Router } from "express";
import { generateAgentReportController } from "./agentStudio.controller";

export function agentStudioRoutes(router: Router) {
    router.post('/notes/agents/generate', generateAgentReportController as any);
    return router;
}
