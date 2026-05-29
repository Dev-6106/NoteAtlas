import { Request, Response, NextFunction, } from "express";
import { DocRepository } from "../repository/DocRepository";
import { generateMindMap } from "@/pipelines/mind-map";
import { LLM } from "@/app/llm/llm";
import { updateOrCreateStudyGuide } from "../studyguide/updateOrCreateStudyGuide";

export async function createOrUpdateMindMap(_id: string, userId: string, noteId: string) {

    try {
        const docRepo = DocRepository.getInstance();
        const llm = LLM.getInstance();
        const doc = await docRepo.getSingleDoc2({ _id, userId, noteId })
        if (!doc) throw new Error("No document found");

        let studyguide = doc?.studyGuide;

        if(!studyguide) {
            console.log(`Study Guide not found for doc ${_id}. Generating Study Guide first...`);
            await updateOrCreateStudyGuide(_id, userId, noteId);
            
            const updatedDoc = await docRepo.getSingleDoc2({ _id, userId, noteId });
            studyguide = updatedDoc?.studyGuide;
            if(!studyguide) throw new Error("Failed to generate Study Guide required for Mind Map");
        }
        
        const mindMap = await generateMindMap(llm, studyguide);
        
        // We will need updateMindMap2 in DocRepository, which I should add
        await docRepo.updateMindMap2({docId: _id, userId, noteId, mindMap});
        console.log("Finished generating Mind Map");
    } catch (error) {
        console.log("Error generating Mind Map: ", error);
        throw error;
    }
}