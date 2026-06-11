import { Request, Response } from "express";
import { Annotation } from "@/app/models/annotation.models";
import { logger } from "@/lib/logger";
import { LLM } from "@/app/llm/llm";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function createAnnotation(req: Request, res: Response) {
  try {
    const { noteId, docId } = req.params;
    const userId = (req as any).userId;
    const { type, content, selectedText, startOffset, endOffset, color } = req.body;

    const annotation = new Annotation({
      userId,
      noteId,
      docId,
      type,
      content,
      selectedText,
      startOffset,
      endOffset,
      color,
    });

    await annotation.save();
    res.status(201).json({ annotation });
  } catch (error) {
    logger.error("[annotations] Error creating annotation", error);
    res.status(500).json({ error: { message: "Failed to create annotation" } });
  }
}

export async function getAnnotations(req: Request, res: Response) {
  try {
    const { noteId, docId } = req.params;
    const userId = (req as any).userId;

    const annotations = await Annotation.find({ userId, noteId, docId }).sort({ createdAt: -1 }).lean();
    res.json({ annotations });
  } catch (error) {
    logger.error("[annotations] Error fetching annotations", error);
    res.status(500).json({ error: { message: "Failed to fetch annotations" } });
  }
}

export async function updateAnnotation(req: Request, res: Response) {
  try {
    const { annotationId } = req.params;
    const userId = (req as any).userId;
    const { content, color } = req.body;

    const annotation = await Annotation.findOneAndUpdate(
      { _id: annotationId, userId },
      { $set: { content, color } },
      { new: true }
    ).lean();

    if (!annotation) {
      res.status(404).json({ error: { message: "Annotation not found" } });
      return;
    }

    res.json({ annotation });
  } catch (error) {
    logger.error("[annotations] Error updating annotation", error);
    res.status(500).json({ error: { message: "Failed to update annotation" } });
  }
}

export async function deleteAnnotation(req: Request, res: Response) {
  try {
    const { annotationId } = req.params;
    const userId = (req as any).userId;

    const annotation = await Annotation.findOneAndDelete({ _id: annotationId, userId });
    if (!annotation) {
      res.status(404).json({ error: { message: "Annotation not found" } });
      return;
    }

    res.json({ message: "Annotation deleted successfully" });
  } catch (error) {
    logger.error("[annotations] Error deleting annotation", error);
    res.status(500).json({ error: { message: "Failed to delete annotation" } });
  }
}

export async function askAIAboutSelection(req: Request, res: Response) {
  try {
    const { noteId, docId } = req.params;
    const userId = (req as any).userId;
    const { question, selectedText } = req.body;

    if (!selectedText || !question) {
      res.status(400).json({ error: { message: "Question and selected text are required" } });
      return;
    }

    const llm = LLM.getInstance();
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are a helpful AI assistant. Answer the user's question based strictly on the provided selected text from their document.",
      ],
      [
        "user",
        `Selected Text: "{selectedText}"\n\nQuestion: {question}`,
      ],
    ]);

    const chain = prompt.pipe(llm);
    const result = await chain.invoke({ selectedText, question });
    const aiResponse = typeof result === "string" ? result : result.content?.toString() || "";

    const annotation = new Annotation({
      userId,
      noteId,
      docId,
      type: "question",
      content: question,
      selectedText,
      aiResponse,
    });

    await annotation.save();
    res.status(201).json({ annotation });
  } catch (error) {
    logger.error("[annotations] Error asking AI", error);
    res.status(500).json({ error: { message: "Failed to ask AI about selection" } });
  }
}
