import { LLM } from "@/app/llm/llm";
import { NextFunction, Request, Response } from "express";
import { DocSummaryTool, libraryTool, vectorDBTool } from "./agent-tools";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { REACT_AGENT_SYSTEM_PROMPT } from "./agent-system-prompts";
import { storeConversation, getConversationHistory } from "./chat-history";
import { createReactAgent } from "@langchain/langgraph/prebuilt";


export async function ChatOverDoc(req: Request, res: Response, next: NextFunction){
    try {
        const { query, userId, noteId } = req.body;

        if (!query || !userId || !noteId) {
            return res.status(400).send({ error: "query, userId, and noteId are required" });
        }

        const llm = LLM.getInstance();
        const tools = [libraryTool, vectorDBTool, DocSummaryTool];

        const modifyMessages = (messages: any[]) => {
            const systemMsg = new SystemMessage(`${REACT_AGENT_SYSTEM_PROMPT}

CRITICAL INSTRUCTIONS FOR TOOLS:
You are currently assisting user ID: ${userId} within note ID: ${noteId}.
Whenever you call a tool (such as user_library, vector_db, or Doc_Summary), you MUST include these exact values for the "userId" and "noteId" arguments. 
DO NOT ask the user for their note ID or user ID. You already have them!`);
            return [
                systemMsg,
                ...messages
            ];
        };

        const appWithMessagesModified = createReactAgent({
            llm, tools, messagesModifier: modifyMessages as any,
        });

        // Store the user message first
        await storeConversation([{role: 'user', content: query as string, userId, noteId}]);

        // Fetch full history (includes the message we just stored)
        const rawHistory = await getConversationHistory(userId as string, noteId as string);

        // Convert raw DB objects to proper LangChain message instances
        const chatHistory = rawHistory.map((msg) => {
            if (msg.role === 'user') {
                return new HumanMessage(msg.content);
            } else {
                return new AIMessage(msg.content);
            }
        });

        const agentOutput = await appWithMessagesModified.invoke({
            messages: chatHistory,
        },{
            recursionLimit: 30
        });

        const aiResponse = agentOutput.messages[agentOutput.messages.length-1].content;

        await storeConversation([{role: 'ai', content: aiResponse as string, userId, noteId}]);

        console.log({output: aiResponse});
        return res.status(200).send({ 
            message: { role: 'ai', content: aiResponse, userId, noteId } 
        });
    } catch (error) {
        next(error);
    }
}