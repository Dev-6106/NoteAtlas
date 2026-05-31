import { Request, Response, NextFunction, } from "express";

import { NoteRepository } from "../repository/notes.repository";
import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { downloadFromStorage } from "@/services/storage/download.service";
import fs from "fs";
import crypto from "crypto";
import { generateSummary } from "@/pipelines/summary";
import { LLM } from "@/app/llm/llm";
import { generateBriefingDoc } from "@/pipelines/briefing-doc";

export async function updateOrCreateBriefingDoc(_id: string, userId: string, noteId: string) {

    try {
        const llm = LLM.getInstance();
        
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc2({_id, userId, noteId});
        if (!doc) throw new Error("No documnet found");
        
        const storageKey = doc?.fileName as string;
        const tempPath = path.join(cwd(), "tmp", crypto.randomUUID() + "-" + path.basename(storageKey));
        if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
        
        await downloadFromStorage(storageKey, tempPath);
        
        const splittingDoc = await loadDocument(tempPath);
        fs.unlinkSync(tempPath);

        const briefingDoc = await generateBriefingDoc(llm, splittingDoc);

        await docRepo.updateBriefingDoc2({ docId: _id, userId, noteId, briefingDoc });

        console.log("Finished generating Briefing Doc");
    } catch (error) {
        console.log("Error generating Briefing Doc: ", error);
        throw error;
    }
}