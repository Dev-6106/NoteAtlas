import { Router } from "express";
import { getSourceResults } from "../getSources";
import { generateSummarySources } from "../generateSummaryFromSources";
import { generateFAQSources } from "../generateFaqFromSources";
import { generateStudyGuideSources } from "../generateStudyGuideFromSources";
import { generateBriefingDocSources } from "../generateBriefingDocFromSources";
import { generateMindMapFromSources } from "../generateMindMapFromSources";
import { generateAudioFromSources } from "../generateAudioFromSources";
import { getAudioUrl } from "../getAudioUrl";
import { generatePodcastFromSources } from "../generatePodcastFromSources";

export function sourceResultRoutes(router: Router){
    router.post('/notes/add/sources',generateSummarySources);
    router.post('/notes/add/faq/sources',generateFAQSources);
    router.post('/notes/add/studyguide/sources',generateStudyGuideSources);
    router.post('/notes/add/briefingdoc/sources',generateBriefingDocSources);
    router.post('/notes/add/mindmap/sources', generateMindMapFromSources);
    router.post('/notes/add/audio/sources', generateAudioFromSources);
    router.get('/notes/audio/url', getAudioUrl);
    router.post('/notes/add/podcast/sources', generatePodcastFromSources);
    router.get('/notes/source/results',getSourceResults);
    return router;
}