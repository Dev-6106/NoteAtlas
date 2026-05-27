import { Router } from "express";
import { getStudyGuide } from "../studyguide/getStudyGuide";
import { updateOrCreateStudyGuide } from "../studyguide/updateOrCreateStudyGuide";

export function studyGuideRoutes(router: Router) {
    router.get('/notes/study-guide',  getStudyGuide);
    router.put('/notes/study-guide', updateOrCreateStudyGuide);
    return router;
}
