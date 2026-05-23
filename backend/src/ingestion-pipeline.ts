import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import "dotenv/config";

export async function webFileEmbedding(url:string){
    // Step 01 - Loading the data
    const loader = new CheerioWebBaseLoader(url);
    const docs = await loader.load();

    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 200,
    });

    const allSplits = await textSplitter.splitDocuments(docs);
    
    const embeddings = new CohereEmbeddings({
        model:"embed-english-v3.0",
        apiKey: process.env.COHERE_API_KEY,
    });

    const pinecone = new PineconeClient({
        apiKey: process.env.PINECONE_API_KEY as string,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string)

    const vectorStore = new PineconeStore(embeddings,{
        pineconeIndex,
        maxConcurrency:5,
    });
    await vectorStore.addDocuments(allSplits);
    console.log("Finished indexing...")
}

webFileEmbedding('https://en.wikipedia.org/wiki/Ramayana');