import { Request, Response, NextFunction, } from "express";

import { NoteRepository } from "../repository/notes.repository";
import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { generateSummary } from "@/pipelines/summary";
import { LLM } from "@/app/llm/llm";
import { generateBriefingDoc } from "@/pipelines/briefing-doc";

export async function updateOrCreateBriefingDoc(req: Request, res: Response, next: NextFunction,) {

    try {
        const llm = LLM.getInstance();
        const { userId, noteId }: Record<string, any> = req.body;
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc({ userId, noteId });
        if (!doc) throw new Error("No documnet found");
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const docFullPath = `${uploadsDir}/${doc?.fileName}`;

        const splittingDoc = await loadDocument(docFullPath);
        const briefingDoc = await generateBriefingDoc(llm, splittingDoc);

        await docRepo.updateBriefingDoc({ userId, noteId, briefingDoc });

        return res.status(200).send({ message: "Briefing doc generated succesfully", briefingDoc });
    } catch (error) {
        next(error);
    }
}