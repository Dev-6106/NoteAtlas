import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";
import { updateOrCreateSummary } from "./updateOrCreateSummary";


// export async function getDocSummary(req: Request, res: Response, next: NextFunction,) {

//     try {

//         const { userId, noteId }: Record<string, any> = req.query;
//         const docRepo = DocRepository.getInstance();
//         const doc = await docRepo.getSingleDoc({ userId, noteId })
//         if (!doc) throw new Error("No documnet found");
//         return res.status(200).send({ summary: doc?.summary });
//     } catch (error) {
//         next(error);
//     }
// }

export async function getDocSummary(req: Request, res: Response, next: NextFunction,) {
    try {
        console.log("=> Reached POST /notes/summary (getDocSummary)");
        const {noteId, docIds} = req.body as {noteId: string, docIds: string[]};
        const userId = req.userId as string;
        console.log(`Processing summary for docIds:`, docIds);
        
        const docRepo = DocRepository.getInstance();
        const docWithoutSummary = [] as any;

        for(const docId of docIds){
            const doc = await docRepo.getSingleDoc2({_id: docId, userId, noteId});

            if(!doc?.summary){
                docWithoutSummary.push({
                    noteId: doc?.noteId,
                    userId: doc?.userId,
                    docId: doc?._id
                })
            }
        };

        await Promise.all(
            docWithoutSummary.map((docW: any) => updateOrCreateSummary(docW?.docId, docW?.userId, docW?.noteId))
        );
        console.log("Doc Summary retured: (getDocSummary)" );
        return res.status(200).send({status:'ready_to_generate_source'});
    } catch (error) {
        next(error);
    }
}