import { LLM } from "@/app/llm/llm";
import { NextFunction, Request, Response } from "express";
import { DocSummaryTool, libraryTool, vectorDBTool } from "./agent-tools";
import { SystemMessage } from "@langchain/core/messages";
import { REACT_AGENT_SYSTEM_PROMPT } from "./agent-system-prompts";
import { storeConversation, getConversationHistory } from "./chat-history";
import { createReactAgent } from "@langchain/langgraph/prebuilt";


export async function ChatOverDoc(req: Request, res: Response, next: NextFunction){
    try {
        const { query, userId, noteId } = req.body;
        const llm = LLM.getInstance();
        const tools = [libraryTool,vectorDBTool, DocSummaryTool];

        const modifyMessages = (messages: string[]) => {
            return [
                new SystemMessage(REACT_AGENT_SYSTEM_PROMPT),
                ...messages,
                new SystemMessage(`
                    TOOL PARAMS

                    some tool needs these params, If you want to use a tool that needs those, use these from here

                    - userId: ${userId}
                    - noteId: ${noteId}
                    `)
            ];
        };

        const appWithMessagesModified = createReactAgent({
            llm, tools, messagesModifier: modifyMessages as any,
        });


        await storeConversation([{role: 'user', content: query as string, userId, noteId}]);
        const chatHistory = await getConversationHistory(userId as string, noteId as string);

        const agentOutput = await appWithMessagesModified.invoke({
            messages: [...chatHistory],
        },{
            recursionLimit: 30
        });

        const aiResponse = agentOutput.messages[agentOutput.messages.length-1].content;

        await storeConversation([{role: 'ai', content: aiResponse, userId, noteId}]);

        console.log({output: aiResponse});
        return res.status(200).send({ 
            message: { role: 'ai', content: aiResponse, userId, noteId } 
        });
    } catch (error) {
        next(error);
    }
}