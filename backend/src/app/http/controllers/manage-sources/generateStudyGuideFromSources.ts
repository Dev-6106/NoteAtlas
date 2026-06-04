import { Runnable } from "@langchain/core/runnables";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { Document } from "@langchain/core/documents";
import { NextFunction, Request, Response } from "express";
import { LLM } from "@/app/llm/llm";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { invokeWithRetry } from "@/util/invokeWithRetry";
export async function generateStudyGuideSources(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, docIds } = req.body as { userId: string, noteId: string, docIds: string[] };

        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });

        const llm = LLM.getInstance();
        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const studyGuides = [] as Array<{ title: string | null | undefined, studyGuide: string | null | undefined }>;

        const docs = await docRepo.getDocsByIds({ docIds, userId, noteId });
        for (const doc of docs) {
            if (!doc.studyGuide) {
                return res.status(500).json({ message: `Study Guide for document '${doc.title}' was not generated successfully. Please try again.` });
            }
            studyGuides.push({ title: doc.title, studyGuide: doc.studyGuide });
        }

        console.log("Sources StudyGuide: ", studyGuides.map(s => s.title));
        if (studyGuides.length > 0) {
            if (studyGuides.length === 1) {
                const title = await generateTitle(llm, [new Document({ pageContent: studyGuides[0]?.studyGuide as string })]);

                await sourceRepo.createSource({
                    userId, noteId, title, source_type: 'study-guide', content: studyGuides[0]?.studyGuide as string, total_source: 1
                });
                console.log("Finished Study Guide... \n\n Title: ", title);
                return res.status(200).send({ message: "Finished creating Study Guide" });
            } else {
                const countSource = studyGuides.length;
                const studyGuideToStr = formatStudyGuides(studyGuides);
                
                const llmFinalStudyGuide = await mergeStudyGuide({ countSource, llm, studyGuideToStr }) as string;
                const title = await generateTitle(llm, [new Document({ pageContent: studyGuideToStr as string })]);
                
                await sourceRepo.createSource({
                    userId, noteId, title, source_type: 'study-guide', content: llmFinalStudyGuide, total_source: countSource
                });
                console.log("Finished Study Guide... \n\n Title: ", title);
                return res.status(200).json({ message: "Finished creating Study Guides" }); 
            }
        }

    } catch (error) {
        next(error);
    }
}

type StudyGuideItem = {
    title?: string | null,
    studyGuide?: string | null
};

function formatStudyGuides(studyGuides: StudyGuideItem[]): string {
    return studyGuides.map((item) => `title: ${item.title ?? ""} \n\n, studyGuide: ${item.studyGuide ?? ""}`).join("----=====|====----");
}

async function mergeStudyGuide(props: { llm: Runnable, countSource: number, studyGuideToStr: string }) {
    const { llm, countSource, studyGuideToStr } = props;
    const mapPrompt = ChatPromptTemplate.fromMessages([
        "user",
        `You are a professional educational assistant. Your task is to merge the following ${countSource} study guides into a single cohesive, well-structured, and comprehensive master study guide.

Each study guide is separated by the marker:
"-----|==|-----"

Input Study Guides:

{context}

Output requirements:

1. Structure:
   - Produce a clear, logically organized Markdown document.
   - Use headings (##) to structure topics, key concepts, vocabulary, etc.
   - Use bullet points (-) and bold text (**) for emphasis.

2. Style & Clarity:
   - Preserve all essential concepts, facts, and definitions from the original study guides.
   - Combine overlapping concepts to avoid repetition.
   - Keep the tone educational, structured, and easy to review.

3. Readability:
   - Ensure the Markdown output is clean, scannable, and visually appealing for a student preparing for an exam.

4. Output:
   - Only return Markdown content; do not include explanations outside of Markdown.`
    ]);

    const prompt = await mapPrompt.invoke({context: studyGuideToStr});
    const response = await invokeWithRetry(() => llm.invoke(prompt)) as any;
    const llmFinalStudyGuide = response?.content;
    console.log("Merged Study Guides....")
    return llmFinalStudyGuide;
}
