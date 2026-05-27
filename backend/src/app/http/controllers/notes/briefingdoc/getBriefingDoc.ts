import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";


export async function getBriefingDoc(req: Request, res: Response, next: NextFunction,) {

    try {

        const { userId, noteId }: Record<string, any> = req.query;
        const docRepo = DocRepository.getInstance();
        const doc = await docRepo.getSingleDoc({ userId, noteId })
        if (!doc) throw new Error("No documnet found");
        return res.status(200).send({ briefingDoc: doc?.briefingDoc });
    } catch (error) {
        next(error);
    }
}