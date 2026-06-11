import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { Document } from "@langchain/core/documents";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import path from "path";
import mammoth from "mammoth";
import csvParser from "csv-parser";
import fs from "fs";

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

export async function loadDocx(filePath: string) {
    const result = await mammoth.extractRawText({ path: filePath });
    return [new Document({ pageContent: result.value, metadata: { source: filePath } })];
}

export async function loadCSV(filePath: string): Promise<Document[]> {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                const docs = results.map(row => {
                    const content = Object.entries(row).map(([key, value]) => `${key}: ${value}`).join("\n");
                    return new Document({ pageContent: content, metadata: { source: filePath } });
                });
                resolve(docs);
            })
            .on('error', (err) => reject(err));
    });
}

export async function loadJSON(filePath: string) {
    const text = await readFile(filePath, "utf-8");
    const data = JSON.parse(text);
    const content = JSON.stringify(data, null, 2);
    return [new Document({ pageContent: content, metadata: { source: filePath } })];
}

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
        case 'md':
            docs = await loadText(filePath);
            break;
        case 'docx':
        case 'doc':
            docs = await loadDocx(filePath);
            break;
        case 'csv':
            docs = await loadCSV(filePath);
            break;
        case 'json':
            docs = await loadJSON(filePath);
            break;
        default:
            throw new Error(`File Type ${docType} Not Supported`);
    };

    return splitDocToChunks(docs, { chunkSize, chunkOverlap });
}