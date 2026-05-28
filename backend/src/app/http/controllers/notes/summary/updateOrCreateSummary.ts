import { Request, Response, NextFunction, } from "express";

import { NoteRepository } from "../repository/notes.repository";
import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { generateSummary } from "@/pipelines/summary";
import { LLM } from "@/app/llm/llm";

export async function updateOrCreateSummary(_id: string,userId: string, noteId: string) {

    try {
        // - getFileName
        // - splitIntoChunks
        // - call generateSummary
        // - storeSummaryInDB
        const llm = LLM.getInstance();
        
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc2({_id:_id,userId,noteId});
        if (!doc) throw new Error("No documnet found");
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const docFullPath = `${uploadsDir}/${doc?.fileName}`;

        const splittingDoc = await loadDocument(docFullPath);
        const summary = await generateSummary(llm, splittingDoc);

        await docRepo.updateSummary2({docId: _id, userId, noteId, summary });

        console.log("Finished generating summary");
    } catch (error) {
        console.log("Error generating summary: ",error);
    }
}