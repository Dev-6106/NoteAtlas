const { Pinecone: PineconeClient } = require('@pinecone-database/pinecone');
const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config();

const { CohereEmbeddings } = require("@langchain/cohere");
const { PineconeStore } = require("@langchain/pinecone");

async function check() {
  console.log("COHERE_API_KEY:", process.env.COHERE_API_KEY ? "Loaded" : "Not loaded");
  console.log("PINECONE_API_KEY:", process.env.PINECONE_API_KEY ? "Loaded" : "Not loaded");
  console.log("PINECONE_INDEX:", process.env.PINECONE_INDEX);
  
  try {
    const embeddings = new CohereEmbeddings({
      model: "embed-english-v3.0",
      apiKey: process.env.COHERE_API_KEY,
    });

    const pinecone = new PineconeClient({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);

    console.log("Initializing vectorStore...");
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 5,
    });

    console.log("Running a test similaritySearch...");
    const retriever = await vectorStore.asRetriever();
    const result = await retriever.invoke("test query");
    console.log("Result success! Length:", result.length);
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

check();
