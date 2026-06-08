import { NextFunction, Request, Response } from "express";
import { DocRepository } from "../notes/repository/DocRepository";
import { SourceRepository } from "../notes/repository/sourceRepository";

export async function renameSource(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params; // Doc ID
        const { displayName } = req.body;

        if (!id || !displayName) {
            return res.status(400).send({
                message: "Please provide source doc id and a new displayName",
            });
        }

        const docRepo = DocRepository.getInstance();
        const sourceRepo = SourceRepository.getInstance();

        // Need an update function in the docRepo...
        // We'll write it directly in MongoDB for speed since it doesn't exist yet
        const { Doc } = require("@/app/models/doc.models");
        
        const doc = await Doc.findByIdAndUpdate(id, { $set: { displayName } }, { new: true });

        if (doc) {
             // Also update the associated source displayName if possible
             const { Source } = require("@/app/models/source.models");
             await Source.findOneAndUpdate(
                 { title: doc.title, noteId: doc.noteId },
                 { $set: { displayName } },
                 { new: true }
             );
        }

        return res.status(200).send({
            message: "Source renamed successfully",
            doc
        });
    } catch (error) {
        next(error);
    }
}
