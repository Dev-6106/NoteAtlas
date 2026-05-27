import { Router } from "express";

export function mockRoutes(router: Router) {
    // Return mock data for user credits to prevent 404
    router.get("/notes/payment/user-credits", (req, res) => {
        res.json({
            userCredit: 100,
            hasSubscription: false,
            subscriptionDetails: null
        });
    });

    // Return mock data for sources to prevent 404
    router.get("/notes/source/results", (req, res) => {
        res.json({
            sources: [],
            audioCard: null,
            mindMapCard: null
        });
    });

    // Return empty chat history to prevent 404
    router.get("/chats/history", (req, res) => {
        res.json({
            chatHistory: []
        });
    });

    // Return empty doc overview to prevent 404
    router.get("/notes/docs/overview", (req, res) => {
        res.json({
            aiResult: { questions: [], doc_overview: "" }
        });
    });

    return router;
}
