import { Request, Response, NextFunction } from "express";
import { getConversationHistory } from "./chat-history";

export async function getHistoryController(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId } = req.query;
        const chatHistory = await getConversationHistory(userId as string, noteId as string);

        return res.status(200).send({ chatHistory });
    } catch (error) {
        next(error);
    }
}
