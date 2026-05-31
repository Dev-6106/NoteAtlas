import { webFileEmbeddings } from "@/app/http/controllers/notes/chat/EmbedDoc";
import agenda from "../agenda";

agenda.define("docEmbedding", async(job: any)=>{
    const {noteId, filePath, userId} = job.attrs.data as any;
    console.log("Starting document embedding...");
    await webFileEmbeddings({filePath,userId, noteId});
    console.log("Finished embedding...");
})