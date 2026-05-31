import { Request, Response, NextFunction, } from "express";

import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { downloadFromStorage } from "@/services/storage/download.service";
import fs from "fs";
import crypto from "crypto";
import { LLM } from "@/app/llm/llm";
import { generateStudyGuide } from "@/pipelines/study-guide";

export async function updateOrCreateStudyGuide(_id: string, userId: string, noteId: string) {

    try {
        const llm = LLM.getInstance();
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc2({ _id, userId, noteId });
        if (!doc) throw new Error("No document found");
        
        const storageKey = doc?.fileName as string;
        const tempPath = path.join(cwd(), "tmp", crypto.randomUUID() + "-" + path.basename(storageKey));
        if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
        
        await downloadFromStorage(storageKey, tempPath);
        
        const splittingDoc = await loadDocument(tempPath);
        fs.unlinkSync(tempPath);

        const studyGuide = await generateStudyGuide(llm, splittingDoc);

        await docRepo.updateStudyGuide2({ docId: _id, userId, noteId, studyGuide });

        console.log("Finished generating Study Guide");
    } catch (error) {
        console.log("Error generating Study Guide: ", error);
        throw error;
    }
}
