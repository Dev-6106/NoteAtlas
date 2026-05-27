import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";
import { generateMindMap } from "@/pipelines/mind-map";
import { LLM } from "@/app/llm/llm";


export async function createOrUpdateMindMap(req: Request, res: Response, next: NextFunction,) {

    try {

        const { userId, noteId }: Record<string, any> = req.query;
        const docRepo = DocRepository.getInstance();
        const llm = LLM.getInstance();
        const doc = await docRepo.getSingleDoc({ userId, noteId })
        if (!doc) throw new Error("No documnet found");

        const studyguide = doc?.studyGuide;

        if(!studyguide) throw new Error("Study Guide Not Found");
        const mindMap = await generateMindMap(llm, studyguide);
        const storedMindMap = await docRepo.updateMindMap({userId, noteId, mindMap});
        return res.status(200).send({ mindMap: storedMindMap });
    } catch (error) {
        next(error);
    }
}