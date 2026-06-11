import { Request, Response, NextFunction } from "express";
import { cwd } from "process";
import path from "path";

import { generateTitle } from "./helpers/TitleGeneration";
import { generatePrompt } from "./helpers/promptGenerator";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "./loader/loaders";
import { DocRepository } from "./repository/DocRepository";
import { NoteRepository } from "./repository/notes.repository";
import { getDocChunk } from "@/util/getDocChunk";
import { uploadToStorage } from "@/services/storage/upload.service";
import crypto from "crypto";
import fs from "fs";
import agenda from "@/app/bootstrap/agenda/agenda";
import OpenAI, { toFile } from "openai";
import { env } from "@/config/env";

export async function uploadFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const { noteId } = req.body;
    const userId = req.userId as string;
    
    if (!noteId) {
      return res.status(400).send("Missing noteId");
    }

    const currentDir = cwd();

    const llm = LLM.getInstance();
    const docRepo = DocRepository.getInstance();
    const noteRepo = NoteRepository.getInstance();
    
    const note = await noteRepo.findById(noteId);
    let isFirstDocForNote = note?.image === "📓" || note?.title === "Untitled notebook";
    
    const files = req.files as any[];
    const createdDocs = [];

    for (const file of files) {
      const fileBuffer = file.buffer;
      const mimeType = file.mimetype;
      const originalName = file.originalname;

      const storageKey = await uploadToStorage(fileBuffer, file.originalname, file.mimetype, `users/${userId}/notes`);
      const fileName = storageKey;
      
      const randomName = crypto.randomUUID();
      // Process based on file type
      let docSplit;
      const isAudio = mimeType.startsWith('audio/') || originalName.match(/\.(mp3|wav|mpeg)$/i);

      if (isAudio) {
        if (!env.GROQ_API_KEY) {
          throw new Error("GROQ_API_KEY is not configured for audio transcription");
        }
        
        const openai = new OpenAI({
          apiKey: env.GROQ_API_KEY,
          baseURL: "https://api.groq.com/openai/v1"
        });

        const transcript = await openai.audio.transcriptions.create({
          file: await toFile(fileBuffer, originalName),
          model: "whisper-large-v3"
        });

        const txtName = originalName + ".txt";
        const tempPath = path.join(cwd(), "tmp", randomName + "-" + txtName);
        if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
        fs.writeFileSync(tempPath, transcript.text);

        try {
            docSplit = await loadDocument(tempPath);
        } finally {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      } else {
        const tempPath = path.join(cwd(), "tmp", randomName + "-" + originalName);
        if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
        fs.writeFileSync(tempPath, fileBuffer);

        try {
            docSplit = await loadDocument(tempPath);
        } finally {
            if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        }
      }

      // Take only first chunk
      const firstChunk = getDocChunk(docSplit);

      // Generate title
      const title = await generateTitle(
        llm,
        firstChunk,
      );

      const newDoc = await docRepo.createDoc({fileName, title, userId, noteId});
      await agenda.now('docEmbedding', { noteId, userId, filePath: fileName });
      createdDocs.push(newDoc);

      // If this is a blank/new notebook, set its title and generate profile image
      if (isFirstDocForNote) {
        isFirstDocForNote = false; // only trigger for the very first file in the batch
        
        await noteRepo.updateNotes({ id: noteId, title });

        const imagePrompt = await generatePrompt(llm, title);
        await agenda.now("generateImage", {
          noteId: noteId,
          generateImagePrompt: imagePrompt,
          filePath: storageKey
        });
      }
    }

    return res.status(201).send({
      message: "Files uploaded successfully",
      docs: createdDocs
    });

  } catch (error) {
    next(error);
  }
}
