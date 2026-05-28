import { Request, Response, NextFunction, } from "express";

import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { LLM } from "@/app/llm/llm";
import { generateStudyGuide } from "@/pipelines/study-guide";

export async function updateOrCreateStudyGuide(_id: string, userId: string, noteId: string) {

    try {
        const llm = LLM.getInstance();
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc2({ _id, userId, noteId });
        if (!doc) throw new Error("No document found");
        
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const docFullPath = `${uploadsDir}/${doc?.fileName}`;

        const splittingDoc = await loadDocument(docFullPath);
        const studyGuide = await generateStudyGuide(llm, splittingDoc);

        await docRepo.updateStudyGuide2({ docId: _id, userId, noteId, studyGuide });

        console.log("Finished generating Study Guide");
    } catch (error) {
        console.log("Error generating Study Guide: ", error);
        throw error;
    }
}
