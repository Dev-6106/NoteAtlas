import { Document } from "@langchain/core/documents";
import { NextFunction, Request, Response } from "express";
import { LLM } from "@/app/llm/llm";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { generateSpeechAudio } from "@/pipelines/audio";
import { uploadToStorage } from "@/services/storage/upload.service";

import { deductCredits } from "@/app/helpers/credits";

export async function generatePodcastFromSources(req: Request, res: Response, next: NextFunction) {
    try {
        const { noteId, docIds } = req.body as { noteId: string, docIds: string[] };
        const userId = req.userId as string;

        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });
        await deductCredits(userId, 5);

        const llm = LLM.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });

        let combinedText = "";
        for (const doc of docs) {
            combinedText += `\n\nTitle: ${doc.title}\nSummary: ${doc.summary}`;
        }

        if (!combinedText) {
            return res.status(500).json({ message: "Could not retrieve document summaries for podcast generation." });
        }

        const splitDocs = [new Document({ pageContent: combinedText })];

        // 1. Generate the speech audio buffer via pipeline
        const audioBuffer = await generateSpeechAudio(llm, splitDocs);

        // 2. Upload the audio to Supabase
        const originalName = "podcast_narration.mp3";
        const storageKey = await uploadToStorage(audioBuffer, originalName, "audio/mpeg", `users/${userId}/podcast`);

        // 3. Create the SourceResult
        const title = await generateTitle(llm, splitDocs);

        await sourceRepo.createSource({
            userId,
            noteId,
            title: `Podcast: ${title}`,
            source_type: 'podcast',
            content: storageKey,
            total_source: docs.length
        });

        console.log("Finished creating Podcast: ", storageKey);
        return res.status(200).json({ message: "Finished creating podcast narration" });

    } catch (error) {
        next(error);
    }
}
