import { Router } from "express";
import { getMindMap } from "../mindmap/getDocMindMap";
import { createOrUpdateMindMap } from "../mindmap/createOrUpdateMindMap";

export function mindMapRoutes(router: Router) {
    router.post('/notes/mindmap',  getMindMap);
    router.put('/notes/mindmap',createOrUpdateMindMap);
    return router;
}