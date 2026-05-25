import { ChatFireWorks } from "@langchain/community/chat_models/fireworks";
export class LLM{
    private constructor(){}
    private static instance(): ChatFireWorks;

    public static getInstance(): ChatFireWorks{
        if(!LLM.instance){
            if(!process.env.CHATFIREWORK_API_KEY){
                throw new Error("Fireworks Api key is not set");
            }
            LLM.instance = new ChatFireWorks({
                model: "accounts/fireworks/models/deepseek-v4-pro",
                tempreature: 0.7,
                apiKey: process.env.CHATFIREWORK_API_KEY;
            })
        };
        return LLM.instance;
    }
}