import { Request, Response, NextFunction, } from "express";

import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { LLM } from "@/app/llm/llm";
import { generateFAQ } from "@/pipelines/generate-faq";

export async function updateOrCreateFAQ(_id: string, userId: string, noteId: string) {

    try {
        const llm = LLM.getInstance();
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc2({ _id, userId, noteId });
        if (!doc) throw new Error("No document found");
        
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const docFullPath = `${uploadsDir}/${doc?.fileName}`;

        const splittingDoc = await loadDocument(docFullPath);
        const faq = await generateFAQ(llm, splittingDoc);

        await docRepo.updateFaq2({ docId: _id, userId, noteId, faq });

        console.log("Finished generating FAQ");
    } catch (error) {
        console.log("Error generating FAQ: ", error);
        throw error;
    }
}
