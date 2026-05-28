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
import { formatDocumentAsString } from "@/util/formatDocAsString";

export async function storeUploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
        if(!req.file) return res.status(400).send("No file uploaded.");

        const {userId, noteId} = req.body;
        
        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const fileName = generateUniqueFileName();


        const llm = LLM.getInstance();
        const docSplit = await loadDocument(`${uploadsDir}/${fileName}`);

        const firstChunk = getDocChunk(docSplit);
        const title = await generateTitle(llm, firstChunk); 


        const docRepo = DocRepository.getInstance();
        const newDoc = await docRepo.createDoc({ fileName, userId, noteId, title });

        console.log("File saved!");
        return res.status(201).send({message: "Documnet uploaded succesfully"});
    } catch (error) {
        next(error);
    }
}