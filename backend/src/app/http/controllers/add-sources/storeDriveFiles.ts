import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import { env } from "@/config/env";
import { cwd } from "process";
import path from "path";
import fs from "fs";
import { Types } from "mongoose";
import { generateFileName } from "../../../../util/generateFileName";
import { loadDocument } from "../notes/loader/loaders";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { DocRepository } from "../notes/repository/DocRepository";
import { LLM } from "@/app/llm/llm";
import { getDocChunk } from "@/util/getDocChunk";
import { webFileEmbedding } from "@/pipelines/ingestion-pipeline";
import agenda from "@/app/bootstrap/agenda/agenda";
import { uploadToStorage } from "@/services/storage/upload.service";

// Google Workspace mimeTypes that need export instead of direct download
const GOOGLE_EXPORT_MAP: Record<string, { mimeType: string; ext: string }> = {
    "application/vnd.google-apps.document": { mimeType: "application/pdf", ext: ".pdf" },
    "application/vnd.google-apps.spreadsheet": { mimeType: "application/pdf", ext: ".pdf" },
    "application/vnd.google-apps.presentation": { mimeType: "application/pdf", ext: ".pdf" },
};

/**
 * Downloads the file stream from Google Drive.
 * Uses `files.export` for Google Workspace types, `files.get` for everything else.
 */
async function getDriveFileStream(
    drive: ReturnType<typeof google.drive>,
    fileId: string,
    fileMimeType: string
) {
    const exportInfo = GOOGLE_EXPORT_MAP[fileMimeType];

    if (exportInfo) {
        // Google Workspace file — must export
        const response = await drive.files.export(
            { fileId, mimeType: exportInfo.mimeType },
            { responseType: "stream" }
        );
        return { stream: response.data, ext: exportInfo.ext };
    }

    // Regular file — direct download
    const response = await drive.files.get(
        { fileId, alt: "media" },
        { responseType: "stream" }
    );
    return { stream: response.data, ext: null };
}

/**
 * Pipes a readable stream to a file and returns a promise that resolves when done.
 */
function streamToFile(stream: NodeJS.ReadableStream, destPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(destPath);
        stream.on("error", (err) => {
            dest.destroy();
            reject(err);
        });
        dest.on("error", (err) => {
            reject(err);
        });
        dest.on("finish", () => {
            resolve();
        });
        stream.pipe(dest);
    });
}

export async function storeDriveFiles(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, fileId } = req.body;
        const user = req.user as any;

        if (!user?.authData?.googleAccessToken) {
            return res.status(401).json({ message: "No google access token found" });
        }

        const oauth2client = new google.auth.OAuth2({
            clientSecret: env.GOOGLE_CLIENT_SECRET,
            clientId: env.GOOGLE_CLIENT_ID,
            redirectUri: env.CALLBACK_URL,
        });
        oauth2client.setCredentials({
            access_token: user.authData.googleAccessToken,
            refresh_token: user.authData.googleRefreshToken,
        });

        const drive = google.drive({ version: "v3", auth: oauth2client });

        // Get file metadata
        const metadata = await drive.files.get({
            fileId,
            fields: "id,name,mimeType",
        });

        const originalName = metadata.data.name || `${fileId}.bin`;
        const fileMimeType = metadata.data.mimeType || "";

        // Download or export the file
        const { stream, ext } = await getDriveFileStream(drive, fileId, fileMimeType);

        // If we exported (e.g. Google Doc → PDF), override the file extension
        const finalName = ext
            ? originalName.replace(/\.[^.]*$/, "") + ext  // replace extension
            : originalName;

        const currDir = cwd();
        const newFileName = generateFileName(finalName);
        const randomName = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const tempPath = path.join(currDir, "tmp", randomName + "-" + newFileName);
        
        if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));

        // Stream the file to disk (awaitable, won't crash on error)
        await streamToFile(stream as NodeJS.ReadableStream, tempPath);
        
        const fileBuffer = fs.readFileSync(tempPath);
        const storageKey = await uploadToStorage(fileBuffer, newFileName, fileMimeType, `users/${userId}/notes`);

        // Process the saved file
        const llm = LLM.getInstance();
        const docSplit = await loadDocument(tempPath);
        const firstChunk = getDocChunk(docSplit);
        const title = await generateTitle(llm, firstChunk);
        
        fs.unlinkSync(tempPath);

        const docRepo = DocRepository.getInstance();
        const noteObjectId = new Types.ObjectId(noteId);
        const newDoc = await docRepo.createDoc({ fileName: storageKey, userId, noteId: noteObjectId, title });

        agenda.now('docEmbedding',
            {noteId, userId, filePath: storageKey}
        )
        res.status(200).json({ message: "Store file to Supabase", doc: newDoc });
    } catch (error: any) {
        console.error("storeDriveFiles error:", error?.message || error);

        // Surface Google API errors with a clear message
        const googleStatus = error?.response?.status || error?.status || error?.code;
        if (googleStatus === 403 || googleStatus === 401) {
            return res.status(googleStatus).json({
                message: "Google Drive access denied. Your access token may have expired. Please log out and log back in.",
                error: error?.response?.data?.error || error.message,
            });
        }

        next(error);
    }
}

