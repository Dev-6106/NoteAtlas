import { Request, Response, NextFunction } from "express";
import { NoteRepository } from "./repository/notes.respository";
import { cwd } from "process";
import path from "path";
import { generateTitle } from "./TitleGeneration";
import { generatePrompt } from "./promptGenerator";
import { generateImage } from "./generateImage";
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
    const uploadDir = path.join(currentDir, "public", "uploads");

    const randomName =
      Date.now() + "-" + Math.floor(Math.random() * 1e9);

    const llm = LLM.getInstance();

    const docSplit = await loadDocument(
      `${uploadDir}/${req.file.filename}`,
      "txt",
    );

    const title = await generateTitle(llm, docSplit);

    const imagePrompt = await generatePrompt(llm, title);

    await generateImage(
      imagePrompt,
      uploadDir,
      randomName,
      async (fileName: string) => {
        const image =
          `${process.env.APP_URL}/uploads/${fileName}`;

        const NoteRepo = NoteRepository.getInstance();

        await NoteRepo.createNote({
          title,
          image,
          userId,
        });
      },
    );

    return res.status(201).send({
      message: "Note Created Successfully",
      title,
      image: `${process.env.APP_URL}/uploads/${randomName}.png`,
    });
  } catch (error) {
    next(error);
  }
}