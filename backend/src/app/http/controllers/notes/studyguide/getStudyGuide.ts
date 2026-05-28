import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";

import { updateOrCreateStudyGuide } from "./updateOrCreateStudyGuide";

export async function getStudyGuide(req: Request, res: Response, next: NextFunction,) {
    try {
        const {userId, noteId, docIds} = req.body as {userId: string, noteId: string, docIds: string[]};
        
        const docRepo = DocRepository.getInstance();
        const docWithoutStudyGuide = [] as any;

        for(const docId of docIds){
            const doc = await docRepo.getSingleDoc2({_id: docId, userId, noteId});

            if(!doc?.studyGuide){
                docWithoutStudyGuide.push({
                    noteId: doc?.noteId,
                    userId: doc?.userId,
                    docId: doc?._id
                })
            }
        };

        for(const docW of docWithoutStudyGuide){
            await updateOrCreateStudyGuide(docW?.docId, docW?.userId, docW?.noteId);
        }
        console.log("Study Guide Summary retured: (getStudyGuide)" );
        return res.status(200).send({status:'ready_to_generate_source'});
    } catch (error) {
        next(error);
    }
}
