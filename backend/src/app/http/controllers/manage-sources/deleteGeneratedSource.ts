import { NextFunction, Request, Response } from "express";
import { Source } from "@/app/models/source.models";

export async function deleteGeneratedSource(req: Request, res: Response, next: NextFunction) {
    try {
        const { id } = req.params; // Source ID

        if (!id) {
            return res.status(400).send({
                message: "Please provide source id",
            });
        }

        const deletedSource = await Source.findByIdAndDelete(id);

        if (!deletedSource) {
            return res.status(404).send({
                message: "Source not found",
            });
        }

        return res.status(200).send({
            message: "Source deleted successfully"
        });
    } catch (error) {
        next(error);
    }
}
