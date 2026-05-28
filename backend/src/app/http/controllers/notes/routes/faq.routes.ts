import { Router } from "express";
import { getFAQ } from "../faq/getFAQ";
import { updateOrCreateFAQ } from "../faq/updateOrCreateFAQ";

export function faqRoutes(router: Router) {
    router.post('/notes/faq',  getFAQ);
    router.put('/notes/faq', updateOrCreateFAQ);
    return router;
}
