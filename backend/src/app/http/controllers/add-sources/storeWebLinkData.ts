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
import { DocRepository } from "../notes/repository/DocRepository";
import { LLM } from "@/app/llm/llm";
import { getDocChunk } from "@/util/getDocChunk";
import { formatDocumentAsString } from "@/util/formatDocAsString";
import { uploadTextToStorage } from "@/services/storage/upload.service";

export async function storeWebLinkFiles(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, webLink } = req.body;

        if (!webLink) {
            return res.status(400).json({ message: "webLink is required" });
        }

        const llm = LLM.getInstance();

        const docSplit = await loadWeb(webLink);
        const docToStrData = formatDocumentAsString(docSplit);


        const firstChunk = getDocChunk(docSplit);
        const title = await generateTitle(llm,firstChunk);

        const storageKey = await uploadTextToStorage(docToStrData, `users/${userId}/notes`);
        const fileName = storageKey;
        const docRepo = DocRepository.getInstance();
        const newDoc = await docRepo.createDoc({fileName,userId,noteId, title});

        console.log("File Saved to Supabase: ",`${storageKey}`);
        res.status(200).json({message: "Document was saved successfully"});
    } catch (error) {
        next(error);
    }
}