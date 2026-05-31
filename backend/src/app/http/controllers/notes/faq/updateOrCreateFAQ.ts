import { Request, Response, NextFunction, } from "express";

import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { downloadFromStorage } from "@/services/storage/download.service";
import fs from "fs";
import crypto from "crypto";
import { LLM } from "@/app/llm/llm";
import { generateFAQ } from "@/pipelines/generate-faq";

export async function updateOrCreateFAQ(_id: string, userId: string, noteId: string) {

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

        const faq = await generateFAQ(llm, splittingDoc);

        await docRepo.updateFaq2({ docId: _id, userId, noteId, faq });

        console.log("Finished generating FAQ");
    } catch (error) {
        console.log("Error generating FAQ: ", error);
        throw error;
    }
}
