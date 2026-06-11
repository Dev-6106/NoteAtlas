import { webFileEmbeddings } from "@/app/http/controllers/notes/chat/EmbedDoc";
import agenda from "../agenda";
import { Doc } from "@/app/models/doc.models";
import { logger } from "@/lib/logger";

agenda.define("docEmbedding", async(job: any)=>{
    const {noteId, filePath, userId} = job.attrs.data as any;
    try {
        await Doc.updateOne(
            { fileName: filePath, noteId, userId },
            { $set: { status: 'embedding' } }
        );
        logger.info(`Starting document embedding for ${filePath}`);
        await webFileEmbeddings({filePath,userId, noteId});
        await Doc.updateOne(
            { fileName: filePath, noteId, userId },
            { $set: { status: 'indexed' } }
        );
        logger.info(`Finished embedding for ${filePath}`);
    } catch (error) {
        logger.error(`Embedding failed for ${filePath}`, error);
        await Doc.updateOne(
            { fileName: filePath, noteId, userId },
            { $set: { status: 'failed', errorMessage: String(error) } }
        );
        // Let Agenda retry
        throw error;
    }
})