import { Request, Response, NextFunction, } from "express";

import { cwd } from "process";
import path from "path";
import { DocRepository } from "../repository/DocRepository";
import { loadDocument } from "../loader/loaders";
import { LLM } from "@/app/llm/llm";
import { generateFAQ } from "@/pipelines/generate-faq";

export async function updateOrCreateFAQ(req: Request, res: Response, next: NextFunction,) {

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
        const faq = await generateFAQ(llm, splittingDoc);

        await docRepo.updateFaq({ userId, noteId, faq });

        return res.status(200).send({ message: "FAQ generated succesfully", faq });
    } catch (error) {
        next(error);
    }
}
