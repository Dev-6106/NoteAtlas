import { Request, Response } from "express";
import { Flashcard } from "@/app/models/flashcard.models";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "../loader/loaders";
import { DocRepository } from "../repository/DocRepository";
import { downloadFromStorage } from "@/services/storage/download.service";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { cwd } from "process";
import { generateFlashcards } from "@/pipelines/flashcards";
import { Document } from "@langchain/core/documents";

import { deductCredits } from "@/app/helpers/credits";

export async function generateFlashcardsController(req: Request, res: Response) {
    try {
        const { noteId, docIds, count } = req.body;
        const userId = (req as any).userId || (req.user as any)?._id?.toString() || (req.user as any)?.authData?._id?.toString();

        if (!userId || !noteId || !docIds || docIds.length === 0) {
            return res.status(400).json({ success: false, message: "Missing required fields." });
        }
        
        await deductCredits(userId, 5);

        const llm = LLM.getInstance();
        const docRepo = DocRepository.getInstance();

        const splitDocs = [];
        
        for (const docId of docIds) {
            const doc = await docRepo.getSingleDoc2({_id: docId, userId, noteId});
            if (!doc) continue;

            const storageKey = doc?.fileName as string;
            
            try {
                if (storageKey && storageKey.trim() !== "") {
                    const tempPath = path.join(cwd(), "tmp", crypto.randomUUID() + "-" + path.basename(storageKey));
                    if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
                    
                    await downloadFromStorage(storageKey, tempPath);
                    let splittingDoc;
            try {
                splittingDoc = await loadDocument(tempPath);
            } finally {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }

                    splitDocs.push(...splittingDoc);
                } else {
                    splitDocs.push(new Document({ pageContent: doc.summary || doc.title }));
                }
            } catch (err) {
                if (doc.summary || doc.title) {
                    splitDocs.push(new Document({ pageContent: doc.summary || doc.title }));
                }
            }
        }

        if (splitDocs.length === 0) {
            return res.status(400).json({ success: false, message: "No valid documents found." });
        }

        const flashcardsData = await generateFlashcards(llm, splitDocs, count || 10);
        
        const flashcardsDoc = await Flashcard.create({
            userId,
            noteId,
            title: flashcardsData.title || `Flashcards - ${new Date().toLocaleDateString()}`,
            cards: flashcardsData.cards
        });

        return res.status(200).json({ success: true, flashcards: flashcardsDoc });
    } catch (error: any) {
        console.error("Error generating flashcards", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to generate flashcards" });
    }
}

export async function getFlashcardsController(req: Request, res: Response) {
    try {
        const { noteId } = req.query;
        const userId = (req as any).userId || (req.user as any)?._id?.toString() || (req.user as any)?.authData?._id?.toString();

        if (!userId || !noteId) {
            return res.status(400).json({ success: false, message: "Missing noteId" });
        }

        const flashcards = await Flashcard.find({ noteId, userId }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, flashcards });
    } catch (error: any) {
        return res.status(500).json({ success: false, message: "Failed to fetch flashcards" });
    }
}
