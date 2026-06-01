import { NextFunction, Request, Response } from "express";
import { getPresignedUrl } from "@/services/storage/presigned.service";

export async function getVideoUrl(req: Request, res: Response, next: NextFunction) {
    try {
        const { key } = req.query;

        if (!key || typeof key !== 'string') {
            return res.status(400).json({ message: "Video storage key is required" });
        }

        // Generate a signed URL valid for 1 hour
        const signedUrl = await getPresignedUrl(key, 3600);

        return res.status(200).json({ url: signedUrl });
    } catch (error) {
        next(error);
    }
}
