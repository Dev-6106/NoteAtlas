import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export async function webFileEmbedding(url: string) {
  const loader = new CheerioWebBaseLoader(url);
  const docs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 500,
    chunkOverlap: 200,
  });

  const allSplits = await textSplitter.splitDocuments(docs);

  const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0",
    apiKey: env.COHERE_API_KEY,
  });

  const pinecone = new PineconeClient({
    apiKey: env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index(env.PINECONE_INDEX);

  const vectorStore = new PineconeStore(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  await vectorStore.addDocuments(allSplits);
  logger.info("Finished indexing documents");
}