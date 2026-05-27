import { Request, Response, NextFunction } from "express";
import { env } from "@/config/env";
import { NoteRepository } from "./repository/notes.repository";
import { cwd } from "process";
import path from "path";

import { generateTitle } from "./helpers/TitleGeneration";
import { generatePrompt } from "./helpers/promptGenerator";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "./loader/loaders";
import { DocRepository } from "./repository/DocRepository";
import { getDocChunk } from "@/util/getDocChunk";

export async function createNote(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      return res.status(400).send("No file uploaded");
    }

    const userId = req.body?.userId;

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
    const fileName = req.file.filename;
    // Load document
    const docSplit = await loadDocument(
      `${uploadDir}/${fileName}`,
    );

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

    // Image path
    const image = `${env.APP_URL}/uploads/${randomName}.png`;

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
        generateImagePrompt: imagePrompt,
        uploadDir,
        randomName,
      },
    );

    const newDoc = await docRepo.createDoc({fileName, title, userId, noteId: newNote._id})

    return res.status(201).send({
      message: "Note Created Successfully",
      newNote
    });

  } catch (error) {
    next(error);
  }
}