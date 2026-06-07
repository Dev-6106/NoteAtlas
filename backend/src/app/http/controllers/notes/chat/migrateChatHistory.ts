import { NextFunction, Request, Response } from "express";
import { Conversation } from "@/app/models/conversation.models";
import { ChatMessage } from "@/app/models/chat.models";
import { Note } from "@/app/models/note.models";

// This is a utility endpoint to migrate old flat chats into the new Conversation structure
export async function migrateChatHistory(req: Request, res: Response, next: NextFunction) {
    try {
        // Find all notebooks that have chat messages
        const distinctNotes = await ChatMessage.distinct('noteId');
        
        let migratedCount = 0;
        
        for (const noteId of distinctNotes) {
            // Check if this note already has a conversation
            const existingConv = await Conversation.findOne({ noteId });
            
            // Find messages without a conversationId
            const orphanedMessages = await ChatMessage.find({ noteId, conversationId: { $exists: false } });
            
            if (orphanedMessages.length > 0) {
                let convId;
                
                if (existingConv) {
                    convId = existingConv._id;
                } else {
                    // Create a default conversation
                    const firstMsg = orphanedMessages[0];
                    const note = await Note.findById(noteId);
                    
                    const newConv = new Conversation({
                        userId: firstMsg.userId,
                        noteId: noteId,
                        title: "Default Chat",
                        isPinned: true
                    });
                    await newConv.save();
                    convId = newConv._id;
                }
                
                // Update messages
                await ChatMessage.updateMany(
                    { noteId, conversationId: { $exists: false } },
                    { $set: { conversationId: convId } }
                );
                
                migratedCount += orphanedMessages.length;
            }
        }
        
        return res.status(200).send({ 
            message: "Migration completed successfully",
            migratedMessages: migratedCount 
        });
    } catch (error) {
        next(error);
    }
}
