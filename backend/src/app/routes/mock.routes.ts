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

    // Mocks for missing source upload routes
    router.post("/notes/drive-files", (req, res) => res.json({ message: "Drive file uploaded successfully (mock)" }));
    router.post("/notes/weblinkdata", (req, res) => res.json({ message: "Weblink uploaded successfully (mock)" }));
    router.post("/notes/text-data", (req, res) => res.json({ message: "Text data uploaded successfully (mock)" }));
    router.post("/notes/youtube-link", (req, res) => res.json({ message: "Youtube link uploaded successfully (mock)" }));
    router.get("/notes/search/web", (req, res) => res.json({ results: [] }));

    // Mocks for AI Generations (Summary, FAQ, etc)
    const mockReady = (req: any, res: any) => res.json({ status: "ready_to_generate_source" });
    const mockSuccess = (req: any, res: any) => res.json({ message: "Sources added successfully (mock)" });

    router.post("/notes/summary", mockReady);
    router.post("/notes/add/sources", mockSuccess);

    router.post("/notes/faq", mockReady);
    router.post("/notes/add/faq/sources", mockSuccess);

    router.post("/notes/studyguide", mockReady);
    router.post("/notes/add/studyguide/sources", mockSuccess);

    router.post("/notes/briefingdoc", mockReady);
    router.post("/notes/add/briefingdoc/sources", mockSuccess);

    router.post("/notes/mindmap", mockReady);
    router.post("/notes/add/mindmap/sources", mockSuccess);

    // Mocks for missing chat POST route
    router.post("/chats", (req, res) => {
        res.json({
            message: {
                role: "ai",
                noteId: req.body.noteId,
                userId: req.body.userId,
                content: "This is a mock AI response."
            }
        });
    });

    // Mocks for missing payment routes
    router.post("/notes/payment/create-setup-session", (req, res) => {
        res.json({ message: "Setup session created (mock)" });
    });
    router.post("/notes/payment/charge-customer", (req, res) => {
        res.json({ message: "Customer charged (mock)" });
    });

    return router;
}
