import { Router } from "express";
import { getStudyGuide } from "../studyguide/getStudyGuide";
import { updateOrCreateStudyGuide } from "../studyguide/updateOrCreateStudyGuide";

export function studyGuideRoutes(router: Router) {
    router.post('/notes/studyguide',  getStudyGuide);
    router.put('/notes/studyguide', updateOrCreateStudyGuide);
    return router;
}
