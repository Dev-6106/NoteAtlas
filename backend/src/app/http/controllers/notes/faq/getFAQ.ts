import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";


import { updateOrCreateFAQ } from "./updateOrCreateFAQ";

export async function getFAQ(req: Request, res: Response, next: NextFunction,) {
    try {
        const {noteId, docIds} = req.body as {noteId: string, docIds: string[]};
        const userId = req.userId as string;
        
        const docRepo = DocRepository.getInstance();
        const docWithoutFAQ = [] as any;

        for(const docId of docIds){
            const doc = await docRepo.getSingleDoc2({_id: docId, userId, noteId});

            if(!doc?.FAQ){
                docWithoutFAQ.push({
                    noteId: doc?.noteId,
                    userId: doc?.userId,
                    docId: doc?._id
                })
            }
        };

        await Promise.all(
            docWithoutFAQ.map((docW: any) => updateOrCreateFAQ(docW?.docId, docW?.userId, docW?.noteId))
        );
        console.log("FAQ Summary retured: (getFAQ)" );
        return res.status(200).send({status:'ready_to_generate_source'});
    } catch (error) {
        next(error);
    }
}