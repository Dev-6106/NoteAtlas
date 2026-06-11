import { Router } from "express";
import {
  getKnowledgeGraph,
  getEntityDetail,
  generateKnowledgeGraph,
  getGraphStats,
} from "../knowledge-graph/knowledgeGraph.controller";

export function knowledgeGraphRoutes(router: Router) {
  router.get("/notes/:noteId/graph", getKnowledgeGraph);
  router.get("/notes/:noteId/graph/stats", getGraphStats);
  router.get("/notes/:noteId/graph/entity/:entityId", getEntityDetail);
  router.post("/notes/:noteId/graph/generate", generateKnowledgeGraph);
  return router;
}
