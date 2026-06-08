import { Request, Response, NextFunction } from "express";
import { Doc } from "@/app/models/doc.models";
import { getPresignedUrl } from "@/services/storage/presigned.service";
import { downloadTextFromStorage } from "@/services/storage/download.service";

// GET /api/v1/notes/docs/:docId/source
export async function getDocSource(req: Request, res: Response, next: NextFunction) {
    try {
        const { docId } = req.params;
        const userId = req.query.userId as string;

        const doc = await Doc.findOne({ _id: docId, userId });
        if (!doc) {
            return res.status(404).json({ error: "Document not found" });
        }

        if (!doc.fileName) {
            return res.status(404).json({ error: "Document file not available" });
        }

        // Generate a signed URL valid for 1 hour (3600 seconds)
        let sourceUrl: string | undefined;
        try {
            sourceUrl = await getPresignedUrl(doc.fileName, 3600);
        } catch (e) {
            console.error("Failed to generate presigned URL:", e);
        }

        let textContent: string | undefined;
        if (doc.source_type !== "pdf") {
            try {
                textContent = await downloadTextFromStorage(doc.fileName);
            } catch (e) {
                console.error("Failed to download text content from storage:", e);
            }
        }

        return res.json({
            docId,
            title: doc.displayName || doc.title,
            sourceUrl,
            source_type: doc.source_type,
            textContent: textContent || doc.summary || "No content available for this document yet.",
        });
    } catch (error) {
        next(error);
    }
}
