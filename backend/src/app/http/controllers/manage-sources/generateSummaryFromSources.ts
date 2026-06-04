import { Runnable } from "@langchain/core/runnables";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { Document } from "@langchain/core/documents";
import { NextFunction, Request, Response } from "express";
import { LLM } from "@/app/llm/llm";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { invokeWithRetry } from "@/util/invokeWithRetry";
export async function generateSummarySources(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, docIds } = req.body as { userId: string, noteId: string, docIds: string[] };

        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });

        const llm = LLM.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const summaries = [] as Array<{ title: string | null | undefined, summary: string | null | undefined }>;

        const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });
        for (const doc of docs) {
            if (!doc.summary) {
                return res.status(500).json({ message: `Summary for document '${doc.title}' was not generated successfully. Please try again.` });
            }
            summaries.push({ title: doc.title, summary: doc.summary });
        }

        console.log("Sources: ",summaries);
        if (summaries.length > 0) {
            if (summaries.length === 1) {
                const title = await generateTitle(llm, [new Document({ pageContent: summaries[0]?.summary as string })]);

                await sourceRepo.createSource({
                    userId, noteId, title, source_type: 'summary', content: summaries[0]?.summary as string, total_source: 1
                });
                console.log("Finished summary... \n\n Title: ", title, "\n\n Summary: ", summaries);
                return res.status(200).send({ message: "Finished creating summary" });
            } else {
                const countSource = summaries.length;
                const summaryToStr = formatSummaries(summaries);
                
                const llmFinalSummary = await mergeSummary({ countSource, llm, summaryToStr }) as string;
                const title = await generateTitle(llm, [new Document({ pageContent: summaryToStr as string })]);
                
                await sourceRepo.createSource({
                    userId, noteId, title, source_type: 'summary', content: llmFinalSummary, total_source: countSource
                });
                console.log("Finished summary... \n\n Title: ", title, "\n\n Summary: ", llmFinalSummary);
                return res.status(200).json({ message: "Finished creating summaries" }); 
            }
        }

    } catch (error) {
        next(error);
    }
}

type SummaryItem = {
    title?: string | null,
    summary?: string | null
};

function formatSummaries(summaries: SummaryItem[]): string {
    return summaries.map((item) => `title: ${item.title ?? ""} \n\n, summary: ${item.summary ?? ""}`).join("----=====|====----");
}

async function mergeSummary(props: { llm: Runnable, countSource: number, summaryToStr: string }) {
    const { llm, countSource, summaryToStr } = props;
    const mapPrompt = ChatPromptTemplate.fromMessages([
        "user",
        `You are a professional technical summarizer. Your task is to merge the following ${countSource} summaries into a single cohesive, well-structured, and comprehensive summary.

Each summary is separated by the marker:
"-----|==|-----"

Input summaries:

{context}

Output requirements:

1. Structure:
   - Produce a clear, logically organized Markdown document.
   - Use headings (##) for major sections if applicable.
   - Use bullet points (-) for key concepts or takeaways.
   - Include sub-bullets when appropriate for details.

2. Style & Clarity:
   - Preserve all essential ideas from the original summaries.
   - Avoid repetition, filler, or irrelevant content.
   - Keep the tone factual, neutral, and professional.
   - Highlight important terms, technologies, or concepts using **bold**.

3. Readability:
   - Ensure the Markdown output is clean, scannable, and visually clear.
   - Paragraphs should be concise and coherent.
   - Lists should be indented and properly formatted.

4. Output:
   - Only return Markdown content; do not include explanations outside of Markdown.`
    ]);

    const prompt = await mapPrompt.invoke({context: summaryToStr});
    const response = await invokeWithRetry(() => llm.invoke(prompt)) as any;
    const llmFinalSummary = response?.content;
    console.log("Merged summaries....")
    return llmFinalSummary;
}