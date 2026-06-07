import { Router } from "express";
import { ChatOverDoc } from "../chat/ChatOverDoc";
import { getHistoryController } from "../chat/getHistoryController";
import { createConversation, getConversations, renameConversation, deleteConversation, duplicateConversation } from "../chat/conversationController";
import { migrateChatHistory } from "../chat/migrateChatHistory";

export function chatRoutes(router: Router) {
    router.post("/chats", ChatOverDoc);
    router.get("/chats/history", getHistoryController);
    
    // Conversation Routes
    router.post("/chats/conversations", createConversation);
    router.get("/chats/conversations", getConversations);
    router.put("/chats/conversations/:id/rename", renameConversation);
    router.delete("/chats/conversations/:id", deleteConversation);
    router.post("/chats/conversations/:id/duplicate", duplicateConversation);
    
    // Migration
    router.post("/chats/migrate", migrateChatHistory);
    
    return router;
}
