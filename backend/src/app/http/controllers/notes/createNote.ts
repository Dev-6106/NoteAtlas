import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.respository";
import { cwd } from "process";
import path from "path";

import { generateTitle } from "./TitleGeneration";
import { generatePrompt } from "./promptGenerator";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "./loaders";

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

    // Load document
    const docSplit = await loadDocument(
      `${uploadDir}/${req.file.filename}`,
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
    const image =
      `${process.env.APP_URL}/uploads/${randomName}.png`;

    const NoteRepo =
      NoteRepository.getInstance();

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

    return res.status(201).send({
      message: "Note Created Successfully",
      newNote
    });

  } catch (error) {
    next(error);
  }
}

function getDocChunk(docSplit: any[]) {
  const docChunk: any[] = [];

  if (docSplit.length > 0) {
    docChunk.push(docSplit[0]);
  } else {
    throw new Error(
      "The provided document is empty",
    );
  }

  return docChunk;
} 