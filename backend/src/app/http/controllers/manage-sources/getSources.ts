import { NextFunction, Request, Response } from "express";
import { SourceRepository } from "../notes/repository/sourceRepository";


export async function getSourceResults(req: Request, res: Response, next: NextFunction){
    try {
        const query = req.query;
        const userId = query?.userId as string;
        const noteId = query?.noteId as string;

        if(!userId || !noteId) return res.status(400).json({message: "UserId or NoteId not found"});

        const sourceRepo = SourceRepository.getInstance();
        const sources = await sourceRepo.getAllSources({userId,noteId});
        return res.status(200).json({ sources });
    } catch (error) {
        next(error);
    }
}