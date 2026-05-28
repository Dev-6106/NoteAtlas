import { NextFunction, Request, Response } from "express";
import { cwd } from "process";
import path from "path";
import fs from "fs";

import { Document } from "@langchain/core/documents";
import { YoutubeTranscript } from "youtube-transcript";

import { generateUniqueFileName } from "../../../../util/generateFileName";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { DocRepository } from "../notes/repository/DocRepository";
import { LLM } from "@/app/llm/llm";
import { formatDocumentAsString } from "@/util/formatDocAsString";

export async function storeYouTubeScript(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { userId, noteId, youtubeLink } = req.body;

    if (!youtubeLink) {
      return res.status(400).json({
        success: false,
        message: "YouTube link is required",
      });
    }

    const llm = LLM.getInstance();

    const currDir = cwd();

    const uploadsDir = path.join(
      currDir,
      "public",
      "uploads"
    );

    // Ensure uploads directory exists
    if (!fs.existsSync(uploadsDir)) {
      await fs.promises.mkdir(uploadsDir, {
        recursive: true,
      });
    }

    let docs: Document[];

    try {
      const transcript =
        await YoutubeTranscript.fetchTranscript(
          youtubeLink
        );

      if (!transcript || transcript.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "No transcript found for this video",
        });
      }

      const transcriptText = transcript
        .map((item) => item.text)
        .join(" ");

      docs = [
        new Document({
          pageContent: transcriptText,
          metadata: {
            source: youtubeLink,
            type: "youtube_transcript",
          },
        }),
      ];
    } catch (err) {
      console.error(
        "YouTube transcript error:",
        err
      );

      return res.status(400).json({
        success: false,
        message:
          "Failed to fetch YouTube transcript. The video may not have captions enabled.",
      });
    }

    const title = await generateTitle(
      llm,
      docs
    );

    const fileName =
      generateUniqueFileName() + ".txt";

    const docRepo = DocRepository.getInstance();

    const newDoc = await docRepo.createDoc({
      fileName,
      userId,
      noteId,
      title,
    });

    const docToString =
      formatDocumentAsString(docs);

    const filePath = path.join(
      uploadsDir,
      fileName
    );

    await fs.promises.writeFile(
      filePath,
      docToString,
      "utf-8"
    );

    console.log("File Saved:", filePath);

    return res.status(200).json({
      success: true,
      message:
        "YouTube transcript saved successfully",
      filePath,
      doc: newDoc,
    });
  } catch (error) {
    next(error);
  }
}