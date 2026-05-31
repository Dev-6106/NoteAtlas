import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { CohereEmbeddings } from "@langchain/cohere";
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";

import { loadDocument } from "../loader/loaders";
import { downloadFromStorage } from "@/services/storage/download.service";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { cwd } from "process";

export async function webFileEmbeddings(props: {
  filePath: string;
  noteId: string;
  userId: string;
}) {
  const { filePath, noteId, userId } = props;

  // filePath is the storage key now
  const storageKey = filePath;
  const tempPath = path.join(cwd(), "tmp", crypto.randomUUID() + "-" + path.basename(storageKey));
  if (!fs.existsSync(path.join(cwd(), "tmp"))) fs.mkdirSync(path.join(cwd(), "tmp"));
  
  await downloadFromStorage(storageKey, tempPath);

  // Load document
  const parsedDocs = await loadDocument(tempPath);
  
  fs.unlinkSync(tempPath);

  // Attach metadata
  const docsWithMeta = parsedDocs.map((doc) => ({
    ...doc,
    metadata: {
      ...doc.metadata,
      source: filePath,
      noteId,
      userId,
    },
  }));

  // Split into chunks
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splitDocs = await textSplitter.splitDocuments(
    docsWithMeta
  );

  // Embedding model
  const embeddings = new CohereEmbeddings({
    apiKey: process.env.COHERE_API_KEY!,
    model: "embed-english-v3.0",
  });

  // Pinecone
  const pinecone = new Pinecone({
    apiKey: process.env.PINECONE_API_KEY!,
  });

  const pineconeIndex = pinecone.index(
    process.env.PINECONE_INDEX!
  );

  // Store vectors
  await PineconeStore.fromDocuments(
    splitDocs,
    embeddings,
    {
      pineconeIndex,
      maxConcurrency: 5,
    }
  );

  return {
    success: true,
    chunksCreated: splitDocs.length,
    noteId,
    userId,
  };
}