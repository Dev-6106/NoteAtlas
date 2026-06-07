import { z } from "zod";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

export async function generatePPTStructure(llm: any, docs: Document[]) {
    const pptSchema = z.object({
        title: z.string().describe("The main title of the presentation"),
        subtitle: z.string().describe("A brief subtitle or author line"),
        slides: z.array(z.object({
            title: z.string().describe("The title of this slide"),
            bullets: z.array(z.string()).describe("The main bullet points for this slide. Maximum 5 short bullets."),
            notes: z.string().describe("Speaker notes or extra context for the presenter")
        })).describe("The sequence of content slides")
    });

    const llmWithStructuredOutput = llm.withStructuredOutput(pptSchema, {
        name: "presentation_structure"
    });

    let contextText = "";
    docs.forEach(doc => {
        contextText += `\n\n${doc.pageContent}`;
    });

    const systemPrompt = `You are an expert presentation designer.
Based on the provided document context, extract the most important information and structure it into a professional presentation.
Create a logical flow with an introduction, main points, and conclusion.
Keep bullets concise and readable.`;

    const humanPrompt = `DOCUMENT CONTEXT:\n{context}`;

    const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemPrompt),
        HumanMessagePromptTemplate.fromTemplate(humanPrompt),
    ]);

    const chain = prompt.pipe(llmWithStructuredOutput);
    
    return await chain.invoke({
        context: contextText.substring(0, 50000)
    });
}
