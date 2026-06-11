import { LLM } from "@/app/llm/llm";
import { NextFunction, Request, Response } from "express";
import { getAgentTools } from "./agent-tools";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { REACT_AGENT_SYSTEM_PROMPT } from "./agent-system-prompts";
import { storeConversation, getConversationHistory } from "./chat-history";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { DocRepository } from "../repository/DocRepository";
import { deductCredits } from "@/app/helpers/credits";

interface Citation {
    title: string;
    docId: string;
    page?: number;
    lines?: string;
}

// Parse [Source: Title | ID: docId | Page: N | Lines: X-Y] markers from LLM response
function extractCitations(text: string): Array<Citation> {
    const regex = /\[Source:\s*([^\|]+)\|\s*ID:\s*([^\|\]]+)(?:\|\s*Page:\s*([^\|\]]+))?(?:\|\s*Lines:\s*([^\|\]]+))?\]/g;
    const citations: Array<Citation> = [];
    const seen = new Set<string>();
    let match;
    while ((match = regex.exec(text)) !== null) {
        const title = match[1].trim();
        const docId = match[2].trim();
        const pageVal = match[3]?.trim();
        const page = pageVal ? parseInt(pageVal) : undefined;
        const lines = match[4]?.trim();

        const key = `${docId}-${page}-${lines}`;
        if (!seen.has(key)) {
            seen.add(key);
            citations.push({ 
                title, 
                docId, 
                page: (page !== undefined && !isNaN(page)) ? page : undefined, 
                lines 
            });
        }
    }
    return citations;
}

export async function ChatOverDoc(req: Request, res: Response, next: NextFunction) {
    try {
        const { query, noteId, docIds, conversationId } = req.body;
        const userId = req.userId as string;

        if (!query || !userId || !noteId) {
            return res.status(400).send({ error: "query, userId, and noteId are required" });
        }

        // ─── Deduct credits before calling LLM ─────────────────
        await deductCredits(userId, 2);

        const llm = LLM.getInstance();
        const tools = getAgentTools(userId as string, noteId as string);

        let selectedDocsMsg = "";
        if (docIds && docIds.length > 0) {
            const docRepo = DocRepository.getInstance();
            const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });

            let summariesContext = "";
            for (const doc of docs) {
                summariesContext += `\n- Document ID: ${doc._id}\n  Title: ${doc.title}\n  Summary: ${doc.summary || "No summary available."}\n`;
            }

            selectedDocsMsg = `\nThe user has selected specific documents to focus on. Their document IDs are: ${docIds.join(', ')}.
Here are their summaries for immediate context:
${summariesContext}
Use this context to answer the user's questions. If you need more details, you can use the vector_db tool.`;
        }

        const modifyMessages = (messages: any[]) => {
            const systemMsg = new SystemMessage(`${REACT_AGENT_SYSTEM_PROMPT}

You are currently assisting a user within note ID: ${noteId}. ${selectedDocsMsg}`);
            
            const lastMsg = messages[messages.length - 1];
            if (lastMsg && (lastMsg.constructor.name === 'ToolMessage' || lastMsg._getType() === 'tool')) {
                const reminderMsg = new SystemMessage(`REMINDER: You must answer the user's question now based on the tool outputs.
CRITICAL: You MUST include inline citations for any facts from the documents in the EXACT format: [Source: <title> | ID: <id> | Page: <page> | Lines: <from>-<to>] (omit Page/Lines if not available in the tool output).
DO NOT use other formats. DO NOT append a bibliography/sources list.`);
                return [systemMsg, ...messages, reminderMsg];
            }
            
            return [systemMsg, ...messages];
        };

        const appWithMessagesModified = createReactAgent({
            llm, tools, messageModifier: modifyMessages as any,
        });

        await storeConversation([{ role: 'user', content: query as string, userId, noteId, conversationId }]);
        const rawHistory = await getConversationHistory(userId as string, noteId as string, conversationId as string);

        const chatHistory = rawHistory.map((msg) => {
            if (msg.role === 'user') return new HumanMessage(msg.content);
            return new AIMessage(msg.content);
        });

        // ─── SSE Headers ────────────────────────────────────────
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        const stream = await appWithMessagesModified.streamEvents({ messages: chatHistory }, { version: "v2" });

        let fullResponse = "";

        for await (const event of stream) {
            if (event.event === "on_chat_model_stream") {
                if (event.metadata?.langgraph_node === "agent") {
                    const chunk = event.data?.chunk?.content;
                    if (chunk && typeof chunk === "string") {
                        fullResponse += chunk;
                        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
                    }
                }
            }
        }

        // ─── Extract + emit citations ────────────────────────────
        const citations = extractCitations(fullResponse);
        console.log("=== LLM RESPONSE ===");
        console.log(fullResponse);
        console.log("=== EXTRACTED CITATIONS ===", citations);
        
        res.write(`data: ${JSON.stringify({ done: true, citations })}\n\n`);
        res.end();

        await storeConversation([{ role: 'ai', content: fullResponse, userId, noteId, conversationId }]);
        return;
    } catch (error: any) {
        // Surface credit errors cleanly
        if (error?.statusCode === 402) {
            if (!res.headersSent) {
                return res.status(402).json({ error: error.message });
            }
            res.write(`data: ${JSON.stringify({ error: error.message, code: 402 })}\n\n`);
            res.end();
            return;
        }
        next(error);
    }
}