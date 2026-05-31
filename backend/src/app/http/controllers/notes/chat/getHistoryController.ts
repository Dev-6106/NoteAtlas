import { Request, Response, NextFunction } from "express";
import { getConversationHistory } from "./chat-history";

export async function getHistoryController(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId } = req.query;
        const allHistory = await getConversationHistory();
        
        // Filter history by userId and noteId
        const chatHistory = allHistory.filter((msg: any) => 
            msg.userId === userId && msg.noteId === noteId
        );

        return res.status(200).send({ chatHistory });
    } catch (error) {
        next(error);
    }
}
