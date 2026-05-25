import { Request, Response, NextFunction, } from "express";

import { NoteRepository } from "./repository/notes.respository";
import { cwd } from "process";
import path from "path";
import { DocRepository } from "./repository/DocRepository";
import { loadDocument } from "./loader/loaders";
import { generateSummary } from "@/pipelines/summary";
import { LLM } from "@/app/llm/llm";

export async function getDocSummary(req: Request, res: Response, next: NextFunction,) {

    try {
        
        const { userId, noteId }: Record<string, any> = req.query;
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc({ userId, noteId })
        if(!doc) throw new Error("No documnet found");
        return res.status(200).send({ summary: doc?.summary });
    } catch (error) {
        next(error);
    }
}