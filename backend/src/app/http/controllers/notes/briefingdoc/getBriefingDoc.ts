import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";

import { updateOrCreateBriefingDoc } from "./updateOrCreateBriefingDoc";

export async function getBriefingDoc(req: Request, res: Response, next: NextFunction,) {
    try {
        const {noteId, docIds} = req.body as {noteId: string, docIds: string[]};
        const userId = req.userId as string;
        
        const docRepo = DocRepository.getInstance();
        const docWithoutBriefingDoc = [] as any;

        for(const docId of docIds){
            const doc = await docRepo.getSingleDoc2({_id: docId, userId, noteId});

            if(!doc?.briefingDoc){
                docWithoutBriefingDoc.push({
                    noteId: doc?.noteId,
                    userId: doc?.userId,
                    docId: doc?._id
                })
            }
        };

        await Promise.all(
            docWithoutBriefingDoc.map((docW: any) => updateOrCreateBriefingDoc(docW?.docId, docW?.userId, docW?.noteId))
        );
        console.log("Briefing Doc retured: (getBriefingDoc)" );
        return res.status(200).send({status:'ready_to_generate_source'});
    } catch (error) {
        next(error);
    }
}