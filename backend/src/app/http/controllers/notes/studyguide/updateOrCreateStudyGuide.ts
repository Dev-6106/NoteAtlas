import { Request, Response, NextFunction, } from "express";

import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { LLM } from "@/app/llm/llm";
import { generateStudyGuide } from "@/pipelines/study-guide";

export async function updateOrCreateStudyGuide(req: Request, res: Response, next: NextFunction,) {

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
        const studyGuide = await generateStudyGuide(llm, splittingDoc);

        await docRepo.updateStudyGuide({ userId, noteId, studyGuide });

        return res.status(200).send({ message: "Study guide generated succesfully", studyGuide });
    } catch (error) {
        next(error);
    }
}
