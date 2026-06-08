import { tool } from "@langchain/core/tools";
import { Document } from "@langchain/core/documents";
import { NoteRepository } from "../repository/notes.repository";
import { DocRepository } from "../repository/DocRepository";
import { queryVectorDB } from "./queryVectorDB";
import z from "zod";
import { SearchToolData } from "@/app/tools/SearchToolData";

export const getAgentTools = (userId: string, noteId: string): any[] => {
    const DocSummaryTool: any = tool(
        async ({ docId }) => {
            const docRepo = DocRepository.getInstance();

            const doc = await docRepo.getSingleDoc2({
                _id: docId,
                userId,
                noteId,
            });

            return JSON.stringify(doc?.summary || "Summary not found");
        },
        {
            name: "Doc_Summary",
            description: "Returns the summary of a document.",
            schema: z.object({
                docId: z.string().describe("The document ID"),
            }),
        }
    );

    const libraryTool: any = tool(
        async () => {
            const noteRepo = NoteRepository.getInstance();

            const noteDocs = await noteRepo.getSingleNote(noteId);

            return JSON.stringify({
                userId,
                note: noteDocs,
            });
        },
        {
            name: "user_library",
            description:
                "Returns metadata and documents belonging to a user's note.",
            schema: z.object({}),
        }
    );

    const vectorDBTool: any = tool(
        async ({ query }) => {
            const results = await queryVectorDB({
                query,
                noteId,
                userId,
            });

            // Need to map the metadata 'source' (which is fileName) to actual document _id and title for citations
            const { Doc } = require("@/app/models/doc.models");
            const docsInNote = await Doc.find({ noteId, userId }).lean();
            const docMap = new Map();
            docsInNote.forEach((d: any) => {
                docMap.set(d.fileName, { _id: d._id.toString(), title: d.title });
            });

            const docs: Document[] = [];

            for (const result of results) {
                const source = result.metadata?.source;
                const docInfo = docMap.get(source) || { _id: "unknown", title: "Unknown Source" };

                docs.push(
                    new Document({
                        pageContent: result.pageContent ?? "",
                        metadata: {
                            ...(result.metadata ?? {}),
                            _id: docInfo._id,
                            title: docInfo.title,
                        },
                    })
                );
            }

            let formattedOutput = "";
            for (const doc of docs) {
                const pageNum = doc.metadata?.['loc.pageNumber'] || doc.metadata?.pageNumber || doc.metadata?.page;
                const lineFrom = doc.metadata?.['loc.lines.from'] || doc.metadata?.lineFrom;
                const lineTo = doc.metadata?.['loc.lines.to'] || doc.metadata?.lineTo;

                formattedOutput += `\nDocument Title: ${doc.metadata?.title || "Unknown Source"}\nDocument ID: ${doc.metadata?._id || "unknown"}\n`;
                if (pageNum) {
                    formattedOutput += `Page: ${pageNum}\n`;
                }
                if (lineFrom !== undefined && lineTo !== undefined) {
                    formattedOutput += `Lines: ${lineFrom}-${lineTo}\n`;
                }
                formattedOutput += `Content:\n${doc.pageContent}\n---\n`;
            }
            return formattedOutput;
        },
        {
            name: "vector_db",
            description:
                "Searches the vector database and returns relevant chunks from user documents.",
            schema: z.object({
                query: z
                    .string()
                    .describe("User query to search in the vector database"),
            }),
        }
    );

    const searchTool: any = tool(
        async ({ query }) => {
            const searchTool = new SearchToolData('exa');
            const searchResult = await searchTool.invoke(query);
            return searchResult;
        },
        {
            name: "search",
            description: "Call to surf the web",
            schema: z.object({
                query: z.string().describe("The query to use in your search"),
            })
        }
    );

    return [libraryTool, vectorDBTool, DocSummaryTool, searchTool];
};