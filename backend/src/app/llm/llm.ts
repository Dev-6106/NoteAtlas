import { ChatGroq } from "@langchain/groq";
import { env } from "@/config/env";

export class LLM {
  private constructor() {}
  private static instance: ChatGroq;

  public static getInstance(): ChatGroq {
    if (!LLM.instance) {
      LLM.instance = new ChatGroq({
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        apiKey: env.GROQ_API_KEY,
        maxRetries: 3,
      });
    }
    return LLM.instance;
  }
}