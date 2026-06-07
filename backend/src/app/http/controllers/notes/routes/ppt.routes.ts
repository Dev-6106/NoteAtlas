import { Router } from "express";
import { generatePPTController } from "../ppt/generatePPT";

export function pptRoutes(router: Router) {
    router.post('/notes/ppt/generate', generatePPTController);
    return router;
}
