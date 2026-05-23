import { Document } from "@langchain/core/dist/documents/document";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import "dotenv/config";

export async function webFileEmbedding(url:string){
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();
}