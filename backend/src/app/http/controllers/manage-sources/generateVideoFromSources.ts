import { Document } from "@langchain/core/documents";
import { NextFunction, Request, Response } from "express";
import { LLM } from "@/app/llm/llm";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { generateVideo } from "@/pipelines/video";
import { uploadToStorage } from "@/services/storage/upload.service";

export async function generateVideoFromSources(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, docIds } = req.body as { userId: string, noteId: string, docIds: string[] };

        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });

        const llm = LLM.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });

        let combinedText = "";
        for (const doc of docs) {
            combinedText += `\n\nTitle: ${doc.title}\nSummary: ${doc.summary}`;
        }

        if (!combinedText) {
            return res.status(500).json({ message: "Could not retrieve document summaries for video generation." });
        }

        const splitDocs = [new Document({ pageContent: combinedText })];

        // 1. Generate the video buffer via pipeline
        const videoBuffer = await generateVideo(llm, splitDocs);

        // 2. Upload the video to Supabase
        const originalName = "video_overview.mp4";
        const storageKey = await uploadToStorage(videoBuffer, originalName, "video/mp4", `users/${userId}/video`);

        // 3. Create the SourceResult
        const title = await generateTitle(llm, splitDocs);

        await sourceRepo.createSource({
            userId,
            noteId,
            title: `Video Overview: ${title}`,
            source_type: 'video-overview',
            content: storageKey,
            total_source: docs.length
        });

        console.log("Finished creating Video Overview: ", storageKey);
        return res.status(200).json({ message: "Finished creating video overview" });

    } catch (error) {
        next(error);
    }
}
