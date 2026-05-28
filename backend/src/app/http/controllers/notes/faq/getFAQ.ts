import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";


import { updateOrCreateFAQ } from "./updateOrCreateFAQ";

export async function getFAQ(req: Request, res: Response, next: NextFunction,) {
    try {
        const {userId, noteId, docIds} = req.body as {userId: string, noteId: string, docIds: string[]};
        
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

        for(const docW of docWithoutFAQ){
            await updateOrCreateFAQ(docW?.docId, docW?.userId, docW?.noteId);
        }
        console.log("FAQ Summary retured: (getFAQ)" );
        return res.status(200).send({status:'ready_to_generate_source'});
    } catch (error) {
        next(error);
    }
}