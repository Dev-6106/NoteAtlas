import { Runnable } from "@langchain/core/runnables";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { Document } from "@langchain/core/documents";
import { NextFunction, Request, Response } from "express";
import { LLM } from "@/app/llm/llm";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { invokeWithRetry } from "@/util/invokeWithRetry";
export async function generateBriefingDocSources(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, docIds, type = 'briefing-doc' } = req.body as { userId: string, noteId: string, docIds: string[], type: 'briefing-doc' };

        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });

        const llm = LLM.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const briefingDocs = [] as Array<{ title: string | null | undefined, briefingDoc: string | null | undefined }>;

        const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });
        for (const doc of docs) {
            if (!doc.briefingDoc) {
                return res.status(500).json({ message: `Briefing Doc for document '${doc.title}' was not generated successfully. Please try again.` });
            }
            briefingDocs.push({ title: doc.title, briefingDoc: doc.briefingDoc });
        }

        console.log("Sources: ", briefingDocs);
        if (briefingDocs.length > 0) {
            if (briefingDocs.length === 1) {
                const title = await generateTitle(llm, [new Document({ pageContent: briefingDocs[0]?.briefingDoc as string })]);



                if (type === 'briefing-doc') {
                    await sourceRepo.createSource({
                        userId, noteId, title, source_type: type, content: briefingDocs[0]?.briefingDoc as string, total_source: 1
                    });
                    console.log("Finished briefing doc... \n\n Title: ", title, "\n\n Briefing Doc: ", briefingDocs);
                    return res.status(200).send({ message: "Finished creating briefing doc" });
                }
            } else {
                const countSource = briefingDocs.length;
                const briefingToStr = formatBriefingDocs(briefingDocs);

                const llmFinalBriefingDoc = await mergeBriefingDocs({ countSource, llm, briefingToStr }) as string;
                const title = await generateTitle(llm, [new Document({ pageContent: briefingToStr as string })]);

                if (type === 'briefing-doc') {
                    await sourceRepo.createSource({
                        userId, noteId, title, source_type: type, content: llmFinalBriefingDoc, total_source: countSource
                    });
                    console.log("Finished briefing doc... \n\n Title: ", title, "\n\n Briefing Doc: ", llmFinalBriefingDoc);
                    return res.status(200).json({ message: "Finished creating briefing docs" });
                }
            }
        }

    } catch (error) {
        next(error);
    }
}

type BriefingDocItem = {
    title?: string | null,
    briefingDoc?: string | null
};

function formatBriefingDocs(briefingDocs: BriefingDocItem[]): string {
    return briefingDocs.map((item) => `title: ${item.title ?? ""} \n\n, briefing doc: ${item.briefingDoc ?? ""}`).join("----=====|====----");
}

async function mergeBriefingDocs(props: { llm: Runnable, countSource: number, briefingToStr: string }) {
    const { llm, countSource, briefingToStr } = props;
    const mapPrompt = ChatPromptTemplate.fromMessages([
        "user",
        `You are a professional technical summarizer. Your task is to merge the following ${countSource} briefing documents into a single cohesive, well-structured, and comprehensive briefing document.

Each document is separated by the marker:
"-----|==|-----"

Input briefing documents:

{context}

Output requirements:

1. Structure:
   - Produce a clear, logically organized Markdown document.
   - Use headings (##) for major sections if applicable.
   - Use bullet points (-) for key concepts or takeaways.
   - Include sub-bullets when appropriate for details.

2. Style & Clarity:
   - Preserve all essential ideas from the original documents.
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

    const prompt = await mapPrompt.invoke({ context: briefingToStr });
    const response = await invokeWithRetry(() => llm.invoke(prompt)) as any;
    const llmFinalBriefingDoc = response?.content;
    console.log("Merged briefing docs....")
    return llmFinalBriefingDoc;
}
