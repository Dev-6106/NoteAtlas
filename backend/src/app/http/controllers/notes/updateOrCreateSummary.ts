import { Request, Response, NextFunction, } from "express";

import { NoteRepository } from "./repository/notes.respository";
import { cwd } from "process";
import path from "path";
import { DocRepository } from "./repository/DocRepository";
import { loadDocument } from "./loader/loaders";
import { generateSummary } from "@/pipelines/summary";
import { LLM } from "@/app/llm/llm";

export async function updateOrCreateSummary(req: Request, res: Response, next: NextFunction,) {

    try {
        // - getFileName
        // - splitIntoChunks
        // - call generateSummary
        // - storeSummaryInDB
        const llm = LLM.getInstance();
        const { userId, noteId }: Record<string, any> = req.query;
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc({ userId, noteId });
        if(!doc) throw new Error("No documnet found");
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const docFullPath = `${uploadsDir}/${doc?.fileName}`;

        const splittingDoc = await loadDocument(docFullPath);
        const summary = await generateSummary(llm, splittingDoc);

        await docRepo.updateSummary({ userId, noteId, summary });

        return res.status(200).send({ message: "Summary generated succesfully", summary });
    } catch (error) {
        next(error);
    }
}