import { Document } from "@langchain/core/documents";
import { CohereEmbeddings, CohereRerank } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";
import { Pinecone as PineconeClient } from "@pinecone-database/pinecone";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

export async function queryVectorDB(query: string) {
  const embeddings = new CohereEmbeddings({
    model: "embed-english-v3.0",
    apiKey: env.COHERE_API_KEY,
  });

  const pinecone = new PineconeClient({
    apiKey: env.PINECONE_API_KEY,
  });

  const pineconeIndex = pinecone.Index(env.PINECONE_INDEX);

  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    maxConcurrency: 5,
  });

  const retriever = await vectorStore.asRetriever();
  const result = await retriever.invoke(query);

  if (result.length === 0) return [];

  try {
    const cohereRerank = new CohereRerank({
      apiKey: env.COHERE_API_KEY,
      model: "rerank-english-v3.0",
    });

    const rerankedDocs = await cohereRerank.rerank(result, query, { topN: 5 });
    if (rerankedDocs.length > 0) {
      return [result[rerankedDocs[0].index]];
    }
  } catch (err: any) {
    logger.warn("Cohere Rerank failed, falling back to first retrieved document", err?.message);
  }

  return [result[0]];
}
