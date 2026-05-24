import { splitListOfDocs } from "@langchain/core/utils/function_calling";
import {Document} from "@langchain/core/documents";
import {StateGraph,Annotation,Send} from "@langchain/langgraph";
import {ChatPromptTemplate} from "@langchain/core/prompts";
import {RecursiveCharacterTextSplitter} from "@langchain/textsplitters";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import "dotenv/config";

const loader = new CheerioWebBaseLoader('https://github.com/Bienfait-ijambo/notebooklm-assets/blob/main/lessons/graph.ts');
const docs = await loader.load();
const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize:1000,
    chunkOverlap:200,
})
const splitDocs = await textSplitter.splitDocuments(docs);

const llm = new ChatFireworks({
  model: "accounts/fireworks/models/deepseek-v4-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: process.env.CHATFIREWORK_API_KEY,
});

let maxTokens = 1000;

function approximateTokens(text:string)