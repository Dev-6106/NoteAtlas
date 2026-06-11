import { Runnable } from "@langchain/core/runnables";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { Document } from "@langchain/core/documents";
import { NextFunction, Request, Response } from "express";
import { LLM } from "@/app/llm/llm";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { invokeWithRetry } from "@/util/invokeWithRetry";
export async function generateFAQSources(req: Request, res: Response, next: NextFunction) {
    try {
        const { noteId, docIds } = req.body as { noteId: string, docIds: string[] };
        const userId = req.userId as string;

        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });

        const llm = LLM.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const faqs = [] as Array<{ title: string | null | undefined, faq: string | null | undefined }>;

        const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });
        for (const doc of docs) {
            if (!doc.FAQ) {
                return res.status(500).json({ message: `FAQ for document '${doc.title}' was not generated successfully. Please try again.` });
            }
            faqs.push({ title: doc.title, faq: doc.FAQ });
        }

        console.log("Sources FAQ: ", faqs.map(f => f.title));
        if (faqs.length > 0) {
            if (faqs.length === 1) {
                const title = await generateTitle(llm, [new Document({ pageContent: faqs[0]?.faq as string })]);

                await sourceRepo.createSource({
                    userId, noteId, title, source_type: 'faq', content: faqs[0]?.faq as string, total_source: 1
                });
                console.log("Finished FAQ... \n\n Title: ", title);
                return res.status(200).send({ message: "Finished creating FAQ" });
            } else {
                const countSource = faqs.length;
                const faqToStr = formatFAQs(faqs);
                
                const llmFinalFaq = await mergeFAQ({ countSource, llm, faqToStr }) as string;
                const title = await generateTitle(llm, [new Document({ pageContent: faqToStr as string })]);
                
                await sourceRepo.createSource({
                    userId, noteId, title, source_type: 'faq', content: llmFinalFaq, total_source: countSource
                });
                console.log("Finished FAQ... \n\n Title: ", title);
                return res.status(200).json({ message: "Finished creating FAQs" }); 
            }
        }

    } catch (error) {
        next(error);
    }
}

type FAQItem = {
    title?: string | null,
    faq?: string | null
};

function formatFAQs(faqs: FAQItem[]): string {
    return faqs.map((item) => `title: ${item.title ?? ""} \n\n, faq: ${item.faq ?? ""}`).join("----=====|====----");
}

async function mergeFAQ(props: { llm: Runnable, countSource: number, faqToStr: string }) {
    const { llm, countSource, faqToStr } = props;
    const mapPrompt = ChatPromptTemplate.fromMessages([
        "user",
        `You are a professional educational assistant. Your task is to merge the following ${countSource} FAQs into a single cohesive, well-structured, and comprehensive FAQ document.

Each FAQ is separated by the marker:
"-----|==|-----"

Input FAQs:

{context}

Output requirements:

1. Structure:
   - Produce a clear, logically organized Markdown document.
   - Use headings (##) to categorize questions if applicable.
   - Present questions in bold (**Q:**) and answers clearly (**A:**).

2. Style & Clarity:
   - Preserve all essential questions from the original FAQs.
   - Remove duplicate or highly similar questions. Combine their answers if necessary.
   - Keep the tone helpful, clear, and professional.

3. Readability:
   - Ensure the Markdown output is clean, scannable, and visually clear.

4. Output:
   - Only return Markdown content; do not include explanations outside of Markdown.`
    ]);

    const prompt = await mapPrompt.invoke({context: faqToStr});
    const response = await invokeWithRetry(() => llm.invoke(prompt)) as any;
    const llmFinalFaq = response?.content;
    console.log("Merged FAQs....")
    return llmFinalFaq;
}
