import { LLM } from "@/app/llm/llm";
import { NextFunction, Request, Response } from "express";
import { SourceRepository } from "../notes/repository/sourceRepository";
import { DocRepository } from "../notes/repository/DocRepository";
import { Document } from "@langchain/core/documents";
import { generateMindMap } from "@/pipelines/mind-map";
import { generateTitle } from "../notes/helpers/TitleGeneration";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";

export async function generateMindMapFromSources(req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, noteId, docIds } = req.body as { userId: string, noteId: string, docIds: string[] };

        if (!userId || !noteId) return res.status(400).json({ message: "UserId and NoteId required" });
        if (docIds.length === 0) return res.status(400).json({ message: "Select a source" });

        const llm = LLM.getInstance();

        const sourceRepo = SourceRepository.getInstance();
        const docRepo = DocRepository.getInstance();

        const studyguides = [] as Array<{ title: string | null | undefined, studyguide: string | null | undefined }>;

        for (const docId of docIds) {
            const doc = await docRepo.getSingleDoc2({ _id: docId, userId, noteId });
            if (doc) studyguides.push({
                title: doc?.title,
                studyguide: doc?.studyGuide
            });
        };

        if (studyguides.length > 0) {
            if (studyguides.length === 1) {
                const title = await generateTitle(llm, [new Document({ pageContent: studyguides[0]?.studyguide as string })]);
                const mindMap = await generateMindMap(llm, studyguides[0]?.studyguide as string);

                await sourceRepo.createSource({ userId, noteId, title, source_type: "mindMap", content: mindMap, total_sources: 1 });
                return res.status(200).send({ message: "Finished creating mindmap..." });
            } else {
                const countSource = studyguides.length;
                const studyGuideToStr = formatStudyGuides(studyguides);

                const llmFinalStudyGuide = await mergeStudyGuide({ countSource, llm, studyGuideToStr });

                const title = await generateTitle(llm, [new Document({ pageContent: studyGuideToStr as string })]);
                const mindMap = await generateMindMap(llm, llmFinalStudyGuide);

                await sourceRepo.createSource({ userId, noteId, title, source_type: "mindMap", content: mindMap, total_sources: countSource });
                return res.status(200).send({ message: "Finished creating mindmap..." });
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

async function mergeStudyGuide(props: { llm: ChatFireworks, countSource: number, studyGuideToStr: string }): Promise<string> {
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

    const prompt = await mapPrompt.invoke({ context: studyGuideToStr });
    const response = await llm.invoke(prompt);
    const llmFinalStudyGuide = response?.content;
    console.log("Merged Study Guides....")
    return llmFinalStudyGuide as string;
}
