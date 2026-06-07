import { Request, Response, NextFunction } from "express";
import { Doc } from "@/app/models/doc.models";

// GET /api/v1/notes/docs/:docId/content
export async function getDocContent(req: Request, res: Response, next: NextFunction) {
    try {
        const { docId } = req.params;
        const userId = req.query.userId as string;

        const doc = await Doc.findOne({ _id: docId, userId });
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        return res.json({
            docId,
            title: doc.displayName || doc.title,
            content: doc.summary || "No content available for this document yet.",
            source_type: doc.source_type,
        });
    } catch (error) {
        next(error);
    }
}
