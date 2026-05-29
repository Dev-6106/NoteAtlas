import { Request, Response, NextFunction, } from "express";

import { NoteRepository } from "../repository/notes.repository";
import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { generateSummary } from "@/pipelines/summary";
import { LLM } from "@/app/llm/llm";
import { generateBriefingDoc } from "@/pipelines/briefing-doc";

export async function updateOrCreateBriefingDoc(_id: string, userId: string, noteId: string) {

    try {
        const llm = LLM.getInstance();
        
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc2({_id, userId, noteId});
        if (!doc) throw new Error("No documnet found");
        
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const docFullPath = `${uploadsDir}/${doc?.fileName}`;

        const splittingDoc = await loadDocument(docFullPath);
        const briefingDoc = await generateBriefingDoc(llm, splittingDoc);

        await docRepo.updateBriefingDoc2({ docId: _id, userId, noteId, briefingDoc });

        console.log("Finished generating Briefing Doc");
    } catch (error) {
        console.log("Error generating Briefing Doc: ", error);
        throw error;
    }
}