import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { env } from "@/config/env";
import { cwd } from "process";
import path from "path";
import fs from "fs";
import { Types } from "mongoose";
import { generateFileName, generateUniqueFileName } from "../../../../util/generateFileName";
import { loadDocument, loadWeb } from "../notes/loader/loaders";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { Document } from "@langchain/core/documents";
import { DocRepository } from "../notes/repository/DocRepository";
import { LLM } from "@/app/llm/llm";
import { getDocChunk } from "@/util/getDocChunk";
import { uploadTextToStorage } from "@/services/storage/upload.service";
import agenda from "@/app/bootstrap/agenda/agenda";

export async function storeTextData(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, text } = req.body;
        const llm = LLM.getInstance();

        const title = await generateTitle(llm, [new Document({ pageContent: text })]);

        const storageKey = await uploadTextToStorage(text, `users/${userId}/notes`);
        const fileName = storageKey;
        const docRepo = DocRepository.getInstance();
        const newDoc = await docRepo.createDoc({ fileName, userId, noteId, title });
        await agenda.now('docEmbedding', { noteId, userId, filePath: fileName });

        console.log("File Saved to Supabase: ", `${storageKey}`);
        res.status(200).json({ message: "Document was saved successfully" });
    } catch (error) {
        next(error);
    }
}