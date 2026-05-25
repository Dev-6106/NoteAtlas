import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";

export async function splitDocToChunks(docs: Document<Record<string, any>>[], props: { chunkSize: number, chunkOverlap: number }) {
    const splitter = new RecursiveCharacterTextSplitter(props);
    const splitDocs = await splitter.splitDocuments(docs);
    return splitDocs
};

export async function loadWeb(url: string) {
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
    return docs;
}

export async function loadPDF(filePath: string) {
    const loader = new PDFLoader(filePath);
    const docs = await loader.load();
    return docs;
};

export async function loadText(filePath: string) {
    const text = await readFile(filePath, "utf-8");
    return [new Document({ pageContent: text, metadata: { source: filePath } })];
};

export async function loadDocument(
    filePath: string,
    // docType: "pdf" | "html" | "txt",
    chunkSize: number = 1000,
    chunkOverlap: number = 200
) {
    let docs = null;
    const docType = path
        .extname(filePath)
        .slice(1);

    switch (docType) {
        case 'pdf':
            docs = await loadPDF(filePath);
            break;
        case 'html':
            docs = await loadWeb(filePath);
            break;
        case 'txt':
            docs = await loadText(filePath);
            break;
        default:
            throw new Error("File Type Not Supported");
    };

    return splitDocToChunks(docs, { chunkSize, chunkOverlap });
}