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
import { formatDocumentAsString } from "@/util/formatDocAsString";

export async function storeTextData(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, text } = req.body;
        const llm = LLM.getInstance();

        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");

        const title = await generateTitle(llm, [new Document({ pageContent: text })]);

        const fileName = generateUniqueFileName();
        const docRepo = DocRepository.getInstance();
        const newDoc = await docRepo.createDoc({ fileName, userId, noteId, title });

        const filePath = path.join(uploadsDir, fileName);

        fs.writeFile(filePath, text, "utf-8", (err) => {
            if (err) {
                console.error("Error saving file: ", err);
                return res.status(500).json({ message: "Error saving file: ", err });
            }
            console.log("FIle Saved: ", `${filePath}`);
            res.status(200).json({ message: "Document was saved successfully", filePath });
        })
    } catch (error) {
        next(error);
    }
}