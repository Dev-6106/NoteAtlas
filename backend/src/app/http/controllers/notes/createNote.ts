import { Request, Response, NextFunction } from "express";
import { env } from "@/config/env";
import { NoteRepository } from "./repository/notes.repository";
import { cwd } from "process";
import path from "path";
import fs from "fs";
import agenda from "@/app/bootstrap/agenda/agenda";

import { generateTitle } from "./helpers/TitleGeneration";
import { generatePrompt } from "./helpers/promptGenerator";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "./loader/loaders";
import { DocRepository } from "./repository/DocRepository";
import { getDocChunk } from "@/util/getDocChunk";
import { uploadToStorage } from "@/services/storage/upload.service";

export async function createNote(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const userId = req.userId as string;

    const currentDir = cwd();

    const uploadDir = path.join(
      currentDir,
      "public",
      "uploads",
    );

    const randomName =
      Date.now() +
      "-" +
      Math.floor(Math.random() * 1e9);

    const llm = LLM.getInstance();
    
    // Upload the file to Supabase Storage directly from the memory buffer
    const fileBuffer = req.file.buffer;
    const mimeType = req.file.mimetype;
    const originalName = req.file.originalname;
    
    const storageKey = await uploadToStorage(fileBuffer, originalName, mimeType, `users/${userId}/notes`);
    const fileName = storageKey;

    // We can't load the document directly from disk anymore. 
    // We can either pass the buffer to the loader or use the presigned URL.
    // For now, let's assume `loadDocument` can handle buffers or we write a temp file.
    // Let's write to a temp file, load it, then delete it.
    const tempPath = path.join(cwd(), "tmp", randomName + originalName);
    if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
    fs.writeFileSync(tempPath, fileBuffer);

    // Load document
    let docSplit;
            try {
                docSplit = await loadDocument(tempPath);
            } finally {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }

    // Take only first chunk
    const firstChunk = getDocChunk(docSplit);

    // Generate title
    const title = await generateTitle(
      llm,
      firstChunk,
    );

    // Generate image prompt
    const imagePrompt = await generatePrompt(
      llm,
      title,
    );

    // Image path will be updated by the agenda job later
    const image = "📓";

    const NoteRepo = NoteRepository.getInstance();
    const docRepo = DocRepository.getInstance();

    // Save note
    const newNote = await NoteRepo.createNote(
      {
        title,
        image,
        userId,
      },
      {
        filePath: storageKey,
        generateImagePrompt: imagePrompt,
      },
    );

    const newDoc = await docRepo.createDoc({fileName, title, userId, noteId: newNote._id})
    await agenda.now('docEmbedding', { noteId: newNote._id.toString(), userId, filePath: fileName });

    return res.status(201).send({
      message: "Note Created Successfully",
      newNote
    });

  } catch (error) {
    next(error);
  }
}