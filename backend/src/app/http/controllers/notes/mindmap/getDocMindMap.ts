import express, { NextFunction, Request, Response } from "express";
import { DocRepository } from "../repository/DocRepository";
import { createOrUpdateMindMap } from "./createOrUpdateMindMap";

export async function getMindMap(req:Request, res: Response, next: NextFunction){
    try {
        const {userId, noteId, docIds} = req.body as {userId: string, noteId: string, docIds: string[]};
        const docRepo = DocRepository.getInstance();
        const docWithoutMindMap = [] as any;
        
        for(const docId of docIds){
            const doc = await docRepo.getSingleDoc2({_id: docId, userId, noteId});

            if(!doc?.mindMap){
                docWithoutMindMap.push({
                    noteId: doc?.noteId,
                    userId: doc?.userId,
                    docId: doc?._id
                })
            }
        }

        await Promise.all(
            docWithoutMindMap.map((docW: any) => createOrUpdateMindMap(docW?.docId, docW?.userId, docW?.noteId))
        );

        return res.status(200).send({status: 'ready_to_generate_source'});
    } catch (error) {
        next(error);
    }
}