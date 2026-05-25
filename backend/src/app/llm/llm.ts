import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
export class LLM{
    private constructor(){}
    private static instance: ChatFireworks;

    public static getInstance(): ChatFireworks{
        if(!LLM.instance){
            if(!process.env.CHATFIREWORK_API_KEY){
                throw new Error("Fireworks Api key is not set");
            }
            LLM.instance = new ChatFireworks({
                model: "accounts/fireworks/models/deepseek-v4-pro",
                temperature: 0.7,
                apiKey: process.env.CHATFIREWORK_API_KEY,
            })
        };
        return LLM.instance;
    }
}