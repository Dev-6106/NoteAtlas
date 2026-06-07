import { NextFunction, Request, Response } from "express";
import { Conversation } from "@/app/models/conversation.models";
import { ChatMessage } from "@/app/models/chat.models";

export async function createConversation(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, title } = req.body;
        if (!userId || !noteId || !title) {
            return res.status(400).send({ message: "userId, noteId, and title are required" });
        }
        
        const conversation = new Conversation({ userId, noteId, title });
        await conversation.save();
        
        return res.status(201).send({ message: "Conversation created", conversation });
    } catch (error) {
        next(error);
    }
}

export async function getConversations(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId } = req.query;
        if (!userId || !noteId) {
            return res.status(400).send({ message: "userId and noteId are required" });
        }
        
        const conversations = await Conversation.find({ userId, noteId }).sort({ updatedAt: -1 }).lean();
        return res.status(200).send({ conversations });
    } catch (error) {
        next(error);
    }
}

export async function renameConversation(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const { title } = req.body;
        if (!title) {
            return res.status(400).send({ message: "title is required" });
        }
        
        const conversation = await Conversation.findByIdAndUpdate(id, { title }, { new: true });
        if (!conversation) {
            return res.status(404).send({ message: "Conversation not found" });
        }
        
        return res.status(200).send({ message: "Conversation renamed", conversation });
    } catch (error) {
        next(error);
    }
}

export async function deleteConversation(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        
        const conversation = await Conversation.findByIdAndDelete(id);
        if (!conversation) {
            return res.status(404).send({ message: "Conversation not found" });
        }
        
        // Also delete associated chat messages
        await ChatMessage.deleteMany({ conversationId: id });
        
        return res.status(200).send({ message: "Conversation deleted" });
    } catch (error) {
        next(error);
    }
}

export async function duplicateConversation(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        
        const original = await Conversation.findById(id).lean();
        if (!original) {
            return res.status(404).send({ message: "Conversation not found" });
        }
        
        const newConversation = new Conversation({
            userId: original.userId,
            noteId: original.noteId,
            title: `${original.title} (Copy)`,
            isPinned: original.isPinned
        });
        await newConversation.save();
        
        // Duplicate chat messages
        const messages = await ChatMessage.find({ conversationId: id }).lean();
        if (messages.length > 0) {
            const newMessages = messages.map(msg => ({
                userId: msg.userId,
                noteId: msg.noteId,
                conversationId: newConversation._id,
                role: msg.role,
                content: msg.content
            }));
            await ChatMessage.insertMany(newMessages);
        }
        
        return res.status(201).send({ message: "Conversation duplicated", conversation: newConversation });
    } catch (error) {
        next(error);
    }
}
