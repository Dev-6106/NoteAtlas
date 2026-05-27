import { Request, Response, NextFunction } from "express";
import { cwd } from "process";
import path from "path";

import { generateTitle } from "./helpers/TitleGeneration";
import { LLM } from "@/app/llm/llm";
import { loadDocument } from "./loader/loaders";
import { DocRepository } from "./repository/DocRepository";
import { getDocChunk } from "@/util/getDocChunk";

export async function uploadFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.files || (req.files as any[]).length === 0) {
      return res.status(400).send("No files uploaded");
    }

    const { userId, noteId } = req.body;
    
    if (!noteId) {
      return res.status(400).send("Missing noteId");
    }

    const currentDir = cwd();
    const uploadDir = path.join(
      currentDir,
      "public",
      "uploads",
    );

    const llm = LLM.getInstance();
    const docRepo = DocRepository.getInstance();
    
    const files = req.files as any[];
    const createdDocs = [];

    for (const file of files) {
      const fileName = file.filename;
      
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

      const newDoc = await docRepo.createDoc({fileName, title, userId, noteId});
      createdDocs.push(newDoc);
    }

    return res.status(201).send({
      message: "Files uploaded successfully",
      docs: createdDocs
    });

  } catch (error) {
    next(error);
  }
}
