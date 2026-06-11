import { NextFunction, Request, Response } from "express";
import { Source } from "@/app/models/source.models";

export async function renameGeneratedSource(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params; // Source ID
        const { title } = req.body;

        if (!id || !title) {
            return res.status(400).send({
                message: "Please provide source id and a new title",
            });
        }

        const updatedSource = await Source.findByIdAndUpdate(id, { $set: { title } }, { new: true });

        if (!updatedSource) {
            return res.status(404).send({
                message: "Source not found",
            });
        }

        return res.status(200).send({
            message: "Source renamed successfully",
            source: updatedSource
        });
    } catch (error) {
        next(error);
    }
}
