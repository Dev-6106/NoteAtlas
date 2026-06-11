import { Request, Response } from "express";
import { Quiz } from "@/app/models/quiz.models";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "../loader/loaders";
import { DocRepository } from "../repository/DocRepository";
import { downloadFromStorage } from "@/services/storage/download.service";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { cwd } from "process";
import { generateQuiz } from "@/pipelines/quiz";
import { Document } from "@langchain/core/documents";

export async function generateQuizController(req: Request, res: Response) {
    try {
        const { noteId, docIds, difficulty, questionCount } = req.body;
        const userId = (req as any).userId || (req.user as any)?._id?.toString() || (req.user as any)?.authData?._id?.toString();

        if (!userId || !noteId || !docIds || docIds.length === 0) {
            console.log("Missing fields in generateQuiz: ", { userId, noteId, docIds });
            return res.status(400).json({ 
                success: false, 
                message: `Missing required fields. userId: ${!!userId}, noteId: ${!!noteId}, docIds: ${!!docIds}, docIds.length: ${docIds?.length}` 
            });
        }

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
                console.log(`Failed to load original document ${docId}, falling back to summary. Error:`, err);
                if (doc.summary || doc.title) {
                    splitDocs.push(new Document({ pageContent: doc.summary || doc.title }));
                }
            }
        }

        if (splitDocs.length === 0) {
            console.log("No valid documents found in generateQuiz. docIds was:", docIds);
            return res.status(400).json({ success: false, message: `No valid documents found. Evaluated ${docIds.length} docIds.` });
        }

        const quizData = await generateQuiz(llm, splitDocs, difficulty || "medium", questionCount || 5);
        
        let questions = [];
        let title = `Quiz - ${new Date().toLocaleDateString()}`;

        if (Array.isArray(quizData)) {
            questions = quizData;
        } else if (quizData && Array.isArray((quizData as any).questions)) {
            questions = (quizData as any).questions;
            if ((quizData as any).title) title = (quizData as any).title;
        } else {
            console.error("Invalid LLM quiz format:", quizData);
            return res.status(500).json({ success: false, message: "Invalid format returned by the AI" });
        }

        const quiz = await Quiz.create({
            userId,
            noteId,
            title,
            difficulty: difficulty || "medium",
            questions: questions
        });

        return res.status(200).json({ success: true, quiz });
    } catch (error: any) {
        console.error("Error generating quiz", error);
        return res.status(500).json({ success: false, message: error.message || "Failed to generate quiz" });
    }
}
