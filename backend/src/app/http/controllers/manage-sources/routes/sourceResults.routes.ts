import { Router } from "express";
import { getSourceResults } from "../getSources";
import { generateSummarySources } from "../generateSummaryFromSources";
import { generateFAQSources } from "../generateFaqFromSources";
import { generateStudyGuideSources } from "../generateStudyGuideFromSources";
import { generateBriefingDocSources } from "../generateBriefingDocFromSources";
import { generateMindMapFromSources } from "../generateMindMapFromSources";

export function sourceResultRoutes(router: Router){
    router.post('/notes/add/sources',generateSummarySources);
    router.post('/notes/add/faq/sources',generateFAQSources);
    router.post('/notes/add/studyguide/sources',generateStudyGuideSources);
    router.post('/notes/add/briefingdoc/sources',generateBriefingDocSources);
    router.post('/notes/add/mindmap/sources', generateMindMapFromSources);
    router.get('/notes/source/results',getSourceResults);
    return router;
}