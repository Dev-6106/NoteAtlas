import { NextFunction, Request, Response } from "express";
import { DocRepository } from "../notes/repository/DocRepository";
import { SourceRepository } from "../notes/repository/sourceRepository";

export async function deleteSource(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params; // Doc ID

        if (!id) {
            return res.status(400).send({
                message: "Please provide source doc id",
            });
        }

        const docRepo = DocRepository.getInstance();
        const sourceRepo = SourceRepository.getInstance();

        // 1. Delete Doc
        const deletedDoc = await docRepo.deleteDoc(id);

        if (deletedDoc) {
             // 2. Delete associated Source (Wait, docs and sources are 1:1 currently by title/content, but let's delete any Source with same docId, except our schema says Source has noteId but no explicit docId reference right now. Let's delete the source if we add docId or just rely on title/noteId for now).
             // Actually, the easiest is to just delete the Doc. The RAG pipeline relies on Sources, so we also need to delete the Source document associated with this doc. We can find it by title and noteId.
             await sourceRepo.deleteSourceByTitleAndNote(deletedDoc.title, deletedDoc.noteId.toString());
        }

        return res.status(200).send({
            message: "Source deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}
