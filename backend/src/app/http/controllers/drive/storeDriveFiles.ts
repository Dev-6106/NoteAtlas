import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { env } from "@/config/env";
import { cwd } from "process";
import path from "path";
import fs from "fs";
import { generateFileName } from "../../../../util/generateFileName";
import { loadDocument } from "../notes/loader/loaders";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { DocRepository } from "../notes/repository/DocRepository";
import { LLM } from "@/app/llm/llm";
import { getDocChunk } from "@/util/getDocChunk";

export async function storeDriveFiles(req: Request, res: Response, next: NextFunction, title?: string) {
    try {
        const { userId, noteId, fileId } = req.body;
        const user = req.user as any;

        if (!user?.authData?.googleAccessToken) {
            return res.status(401).json({ message: "No google access token found" });
        }

        const oauth2client = new google.auth.OAuth2({
            client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
            client_id: process.env.GOOGLE_CLIENT_ID,
        });
        oauth2client.setCredentials({
            access_token: user?.authData?.googleAccessToken,
            refresh_token: user?.authData?.googleRefreshToken,
        });

        const drive = google.drive({ version: "v3", auth: oauth2client });

        const metadata = await drive.files.get({
            fileId,
            fields: "id,name,mimeType",
        });

        const fileName = metadata.data.name || `${fileId}.bin`;

        const response = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "stream" }
        );

        const currDir = cwd();
        const uploadsDir = path.join(currDir, "public", "uploads");
        const llm = LLM.getInstance();
        const newFileName = generateFileName(fileName);
        const dest = fs.createWriteStream(`${uploadsDir}/${newFileName}`);

        response.data.on("end", async () => {
            console.log(`File saved: ${uploadsDir}  - ${fileName}`); 4

            const docSplit = await loadDocument(`${uploadsDir}/${newFileName}`);
            const firstChunk = getDocChunk(docSplit);
            const title = await generateTitle(llm, firstChunk);

            const docRepo = DocRepository.getInstance();
            const newDoc = await docRepo.createDoc({ fileName: newFileName, userId, noteId, title });
            res.status(200).json({ message: "Store file to disk" });
        })
        .on("error",(err:any)=>{
            console.error("Error downloading file ", err);
            res.status(600).json({message: "Error saving files: ", errors:err});
        })
        .pipe(dest);
    } catch (error) {
        next(error);
    }
}

