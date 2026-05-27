import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { env } from "@/config/env";

export class LLM {
  private constructor() {}
  private static instance: ChatFireworks;

  public static getInstance(): ChatFireworks {
    if (!LLM.instance) {
      LLM.instance = new ChatFireworks({
        model: "accounts/fireworks/models/deepseek-v4-pro",
        temperature: 0.7,
        apiKey: env.CHATFIREWORK_API_KEY,
      });
    }
    return LLM.instance;
  }
}