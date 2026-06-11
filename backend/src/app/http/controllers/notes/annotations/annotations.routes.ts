import { Router } from "express";
import {
  createAnnotation,
  getAnnotations,
  updateAnnotation,
  deleteAnnotation,
  askAIAboutSelection,
} from "./annotations.controller";

export function annotationRoutes(router: Router) {
  const annotationRouter = Router({ mergeParams: true });

  annotationRouter.post("/", createAnnotation);
  annotationRouter.get("/", getAnnotations);
  annotationRouter.patch("/:annotationId", updateAnnotation);
  annotationRouter.delete("/:annotationId", deleteAnnotation);

  annotationRouter.post("/ask", askAIAboutSelection);

  router.use("/notes/:noteId/docs/:docId/annotations", annotationRouter);
  return annotationRouter;
}
