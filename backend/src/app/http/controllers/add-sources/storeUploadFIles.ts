import { NextFunction, Request, Response, text } from "express";
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
import { uploadToStorage } from "@/services/storage/upload.service";
import crypto from "crypto";
import agenda from "@/app/bootstrap/agenda/agenda";

export async function storeUploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
        if(!req.file) return res.status(400).send("No file uploaded.");

        const {noteId, userId} = req.body;
        
        const fileBuffer = req.file.buffer;
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname;

        const storageKey = await uploadToStorage(fileBuffer, originalName, mimeType, `users/${userId}/notes`);
        const fileName = storageKey;

        const randomName = crypto.randomUUID();
        const tempPath = path.join(cwd(), "tmp", randomName + "-" + originalName);
        if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
        fs.writeFileSync(tempPath, fileBuffer);

        const llm = LLM.getInstance();
        const docSplit = await loadDocument(tempPath);
        fs.unlinkSync(tempPath);

        const firstChunk = getDocChunk(docSplit);
        const title = await generateTitle(llm, firstChunk); 


        const docRepo = DocRepository.getInstance();
        const newDoc = await docRepo.createDoc({ fileName, userId, noteId, title });
        await agenda.now('docEmbedding', { noteId, userId, filePath: fileName });

        console.log("File saved!");
        return res.status(201).send({message: "Documnet uploaded succesfully"});
    } catch (error) {
        next(error);
    }
}