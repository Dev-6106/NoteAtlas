import { Router } from "express";
import { ChatOverDoc } from "../chat/ChatOverDoc";
import { getHistoryController } from "../chat/getHistoryController";

export function chatRoutes(router: Router) {
    router.post("/chats", ChatOverDoc);
    router.get("/chats/history", getHistoryController);
    return router;
}
