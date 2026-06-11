import { Request, Response, NextFunction } from "express";
import { DocRepository } from "../repository/DocRepository";
import { SourceRepository } from "../repository/sourceRepository";
import { loadDocument } from "../loader/loaders";
import { downloadFromStorage } from "@/services/storage/download.service";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cwd } from "process";
import { LLM } from "@/app/llm/llm";
import { generateAgentStudioArtifact } from "@/pipelines/agentStudio";

export const generateAgentReportController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { noteId, docIds, agentType, agentTitle, inputs } = req.body;
        const userId = req.userId as string;

        if (!userId || !noteId || !agentType) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const docRepo = DocRepository.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const llm = LLM.getInstance();

        // Set up SSE headers
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const emitProgress = (stepIndex: number, message: string) => {
            res.write(`data: ${JSON.stringify({ stepIndex, message, status: 'processing' })}\n\n`);
        };

        // 1. Fetch requested documents
        emitProgress(0, "Fetching document sources...");
        let targetDocIds = docIds || [];
        if (targetDocIds.length === 0) {
            // If none selected, fetch all for the note
            const docs = await docRepo.getAllDocs({ noteId, userId });
            targetDocIds = docs.map(d => d._id.toString());
        }

        const splittingDocs = [];

        for (const docId of targetDocIds) {
            const doc = await docRepo.getSingleDoc2({ _id: docId, userId, noteId });
            if (!doc) continue;

            const storageKey = doc.fileName as string;
            const tempPath = path.join(cwd(), "tmp", crypto.randomUUID() + "-" + path.basename(storageKey));
            
            if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
            
            await downloadFromStorage(storageKey, tempPath);
            let chunkedDocs;
            try {
                chunkedDocs = await loadDocument(tempPath);
            } finally {
                if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
            }

            splittingDocs.push(...chunkedDocs);
        }

        if (splittingDocs.length === 0) {
            res.write(`data: ${JSON.stringify({ status: 'error', message: 'No document content found.' })}\n\n`);
            return res.end();
        }

        // 2. Invoke Agent Pipeline
        emitProgress(1, "Executing AI map-reduce pipeline...");
        console.log(`[AgentStudio] Invoking ${agentType} for Note ${noteId}...`);
        let resultMarkdown = "";
        if (agentType === "CITATION_VERIFICATION_AGENT") {
            const { runCitationVerification } = await import("@/pipelines/citationVerificationAgent");
            const combinedText = splittingDocs.map(d => d.pageContent).join("\n\n");
            resultMarkdown = await runCitationVerification(combinedText, userId, noteId, emitProgress);
        } else {
            resultMarkdown = await generateAgentStudioArtifact(llm, splittingDocs, agentType, inputs || "", emitProgress);
        }

        // 3. Save as a Source Result
        emitProgress(2, "Generating final formal artifact...");
        const savedSource = await sourceRepo.createSource({
            source_type: "agent-report",
            userId,
            noteId,
            total_source: targetDocIds.length,
            title: agentTitle || 'Agent Report', // The frontend will display the actual icon based on the source_type or content
            content: resultMarkdown
        });

        console.log(`[AgentStudio] Finished ${agentType}`);
        res.write(`data: ${JSON.stringify({ status: 'success', data: savedSource })}\n\n`);
        res.write("data: [DONE]\n\n");
        return res.end();

    } catch (error: any) {
        console.error("Agent Studio Error: ", error);
        res.write(`data: ${JSON.stringify({ status: 'error', message: error.message || 'Server error' })}\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
    }
};
