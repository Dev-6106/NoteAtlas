import { Pinecone } from "@pinecone-database/pinecone";
import { CohereEmbeddings } from "@langchain/cohere";
import { PineconeStore } from "@langchain/pinecone";

export async function queryVectorDB({
    query,
    noteId,
    userId,
}: {
    query: string;
    noteId: string;
    userId: string;
}) {
    const embeddings = new CohereEmbeddings({
        apiKey: process.env.COHERE_API_KEY!,
        model: "embed-english-v3.0",
    });

    const pinecone = new Pinecone({
        apiKey: process.env.PINECONE_API_KEY!,
    });

    const pineconeIndex = pinecone.index(
        process.env.PINECONE_INDEX!
    );

    const vectorStore = await PineconeStore.fromExistingIndex(
        embeddings,
        {
            pineconeIndex,
            maxConcurrency: 5,
        }
    );

    const filter = {
        userId,
        noteId,
    };

    const results = await vectorStore.similaritySearch(
        query,
        10,
        filter
    );

    return results;
}