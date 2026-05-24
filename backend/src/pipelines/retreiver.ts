import { Document } from "@langchain/core/documents";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings, CohereRerank } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import "dotenv/config";

export async function queryVectorDB(query: string) {
  const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0",
    apiKey: process.env.COHERE_API_KEY,
  });

  const pinecone = new PineconeClient({
    apiKey: process.env.PINECONE_API_KEY as string,
  });

  const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX as string);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  //   const result = await vectorStore.similaritySearch(query,10);
  const retreiver = await vectorStore.asRetriever();
  const result = await retreiver.invoke(query);

  if (result.length === 0) return [];

  try {
    const cohereRerank = new CohereRerank({
      apiKey: process.env.COHERE_API_KEY,
      model: "rerank-english-v3.0",
    });

    const rerankedDocs = await cohereRerank.rerank(result, query, { topN: 5 });
    if (rerankedDocs.length > 0) {
      return [result[rerankedDocs[0].index]];
    }
  } catch (err: any) {
    console.warn("Cohere Rerank failed (likely rate limit), falling back to first retrieved document. Error:", err?.message || err);
  }

  return [result[0]];
}
