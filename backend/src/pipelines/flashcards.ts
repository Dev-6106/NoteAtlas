import { z } from "zod";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate } from "@langchain/core/prompts";

export async function generateFlashcards(llm: any, docs: Document[], count: number = 10) {
    const flashcardsSchema = z.object({
        title: z.string().describe("A short, descriptive title for these flashcards"),
        cards: z.array(z.object({
            front: z.string().describe("The question, term, or prompt on the front of the card"),
            back: z.string().describe("The answer, definition, or explanation on the back of the card")
        })).describe("The array of flashcards")
    });

    const llmWithStructuredOutput = llm.withStructuredOutput(flashcardsSchema, {
        name: "flashcards"
    });

    let contextText = "";
    docs.forEach(doc => {
        contextText += `\n\n${doc.pageContent}`;
    });

    const systemPrompt = `You are an expert educator creating flashcards to help a student study.
Based on the provided document context, generate exactly {count} flashcards.
Extract the most important facts, definitions, and concepts.
Make the 'front' of the card concise, and the 'back' of the card informative.`;

    const humanPrompt = `DOCUMENT CONTEXT:\n{context}`;

    const prompt = ChatPromptTemplate.fromMessages([
        SystemMessagePromptTemplate.fromTemplate(systemPrompt),
        HumanMessagePromptTemplate.fromTemplate(humanPrompt),
    ]);

    const chain = prompt.pipe(llmWithStructuredOutput);
    
    return await chain.invoke({
        context: contextText.substring(0, 50000), // Limit context size
        count: count.toString()
    });
}
