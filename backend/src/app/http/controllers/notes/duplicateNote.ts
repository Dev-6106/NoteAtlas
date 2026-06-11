import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.repository";
import { Note } from "@/app/models/note.models";
import { Doc } from "@/app/models/doc.models";
import { Source } from "@/app/models/source.models";

export async function duplicateNote(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params;
        const userId = req.userId as string;

        if (!id) {
            return res.status(400).send({
                message: "Please provide note id",
            });
        }

        const noteRepo = NoteRepository.getInstance();
        const originalNote = await noteRepo.findById(id);

        // 1. Create a new Note document
        const newNote = new Note({
            title: `${originalNote.title} (Copy)`,
            image: originalNote.image,
            description: originalNote.description,
            userId: userId || originalNote.userId,
            isArchived: false,
            isPinned: false,
            docs: []
        });
        
        await newNote.save();

        // 2. Clone Docs
        if (originalNote.docs && originalNote.docs.length > 0) {
            const originalDocs = await Doc.find({ noteId: id }).lean();
            const newDocIds = [];

            for (const doc of originalDocs) {
                const newDoc = new Doc({
                    title: doc.title,
                    fileName: doc.fileName,
                    displayName: doc.displayName,
                    description: doc.description,
                    summary: doc.summary,
                    studyGuide: doc.studyGuide,
                    briefingDoc: doc.briefingDoc,
                    FAQ: doc.FAQ,
                    mindMap: doc.mindMap,
                    audioOverview: doc.audioOverview,
                    source_type: doc.source_type,
                    status: doc.status,
                    errorMessage: doc.errorMessage,
                    noteId: newNote._id,
                    userId: newNote.userId
                });
                const savedDoc = await newDoc.save();
                newDocIds.push(savedDoc._id);
            }
            
            newNote.docs = newDocIds;
            await newNote.save();
        }

        // 3. Clone Sources
        const originalSources = await Source.find({ noteId: id }).lean();
        for (const source of originalSources) {
            const newSource = new Source({
                title: source.title,
                displayName: source.displayName,
                total_source: source.total_source,
                content: source.content,
                source_type: source.source_type,
                status: source.status,
                errorMessage: source.errorMessage,
                noteId: newNote._id,
                userId: newNote.userId
            });
            await newSource.save();
        }

        return res.status(201).send({
            message: "Note duplicated successfully",
            note: newNote
        });
    } catch (error) {
        next(error);
    }
}
