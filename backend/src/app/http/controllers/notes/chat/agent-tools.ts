import { tool } from "@langchain/core/tools";
import { Document } from "@langchain/core/documents";
import { NoteRepository } from "../repository/notes.repository";
import { DocRepository } from "../repository/DocRepository";
import { queryVectorDB } from "./queryVectorDB";
import z from "zod";
import { SearchToolData } from "@/app/tools/SearchToolData";

export const DocSummaryTool = tool(
    async ({ noteId, docId, userId }) => {
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
            noteId: z.string().describe("The note ID"),
            docId: z.string().describe("The document ID"),
            userId: z.string().describe("The user ID"),
        }),
    }
);

export const libraryTool = tool(
    async ({ userId, noteId }) => {
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
        schema: z.object({
            userId: z
                .string()
                .describe("User ID used to fetch library data"),

            noteId: z
                .string()
                .describe("Note ID whose documents should be returned"),
        }),
    }
);

export const vectorDBTool = tool(
    async ({ query, noteId, userId }) => {
        const results = await queryVectorDB({
            query,
            noteId,
            userId,
        });

        const docs: Document[] = [];

        for (const result of results) {
            docs.push(
                new Document({
                    pageContent: result.pageContent ?? "",
                    metadata: {
                        ...(result.metadata ?? {}),
                    },
                })
            );
        }

        return JSON.stringify(
            docs.map((doc) => ({
                pageContent: doc.pageContent,
                metadata: doc.metadata,
            }))
        );
    },
    {
        name: "vector_db",
        description:
            "Searches the vector database and returns relevant chunks from user documents.",
        schema: z.object({
            query: z
                .string()
                .describe("User query to search in the vector database"),

            noteId: z
                .string()
                .describe("Note ID whose vectors should be searched"),

            userId: z
                .string()
                .describe("User ID owning the note"),
        }),
    }
);

export const searchTool = tool(
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