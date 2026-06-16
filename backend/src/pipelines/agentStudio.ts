import "dotenv/config";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { Runnable } from "@langchain/core/runnables";
import { lengthFunction, splitListOfDocs, deduplicateDocs, cachedInvoke } from "./pipelineUtils";

const MAX_TOKENS = 32000;

export const AGENT_PROMPTS: Record<string, { map: string, reduce: string }> = {
  RESEARCH_REPORT: {
    map: `Extract all key concepts, facts, and evidence relevant for a comprehensive research report.\n\nCRITICAL: Append a citation [Source: {doc_name}] to every extracted fact.\n\nTEXT:\n{context}`,
    reduce: `Combine the following extracted notes into a formal, highly-structured Research Report.\n\nInclude the following sections:\n1. Introduction\n2. Architecture & Concepts\n3. Benefits\n4. Limitations\n5. Best Practices\n6. Conclusion\n\nFormat beautifully in Markdown. You MUST preserve the inline citations [Source: ...] from the notes and include a Bibliography at the end.\n\nNOTES:\n{docs}`
  },
  STUDY_PLAN: {
    map: `Identify all important topics, sub-topics, and estimate their learning complexity.\n\nTEXT:\n{context}`,
    reduce: `Create a detailed Study Plan based on the provided topic list.\n\nSpecifications (Timeframe, Focus Areas, etc): {input}\n\nFor each day, provide:\n- The specific topics to cover\n- A brief explanation of the goal\n- 3 short quiz questions to test knowledge.\n\nFormat as a structured day-by-day Markdown schedule.\n\nTOPICS:\n{docs}`
  },
  KNOWLEDGE_GAP: {
    map: `Extract all topics and concepts covered in the text.\n\nTEXT:\n{context}`,
    reduce: `Compare the extracted topics against the provided curriculum/syllabus/topic: "{input}".\n\nProvide:\n1. A Coverage Percentage.\n2. A list of Covered Topics (with a brief summary).\n3. A list of MISSING Concepts (topics in the syllabus but not found in the notes).\n4. Recommendations and links to study the missing concepts.\n\nFormat beautifully in Markdown.\n\nEXTRACTED TOPICS:\n{docs}`
  },
  CROSS_DOC_DEBATE: {
    map: `Extract the primary claims, methodologies, and results from this document chunk.\n\nTEXT:\n{context}`,
    reduce: `Compare the extracted claims from the provided documents.\n\nGenerate a Cross-Document Debate Report containing:\n1. Points of Agreement\n2. Points of Contradiction / Disagreement\n3. Methodology Comparison\n4. Results Comparison\n\nFormat beautifully in Markdown.\n\nCLAIMS:\n{docs}`
  },
  RESEARCH_ASSISTANT: {
    map: `Extract key concepts and logical learning steps.\n\nTarget specifications: {input}\n\nTEXT:\n{context}`,
    reduce: `Act as a tutor.\n\nTarget specifications (Subject, Difficulty): {input}\n\nBased on the extracted text, generate an Automatic Research Assistant Guide:\n1. A logical Learning Roadmap.\n2. Summaries for each step.\n3. A final quiz to test understanding.\n\nFormat beautifully in Markdown.\n\nCONCEPTS:\n{docs}`
  },
  SOURCE_VERIFICATION: {
    map: `Find any evidence, quotes, or data that supports or refutes the following statement: "{input}".\n\nTEXT:\n{context}`,
    reduce: `Determine if the statement "{input}" is supported by the documents.\n\nProvide:\n1. A CLEAR "Supported: YES / NO / PARTIAL" verdict.\n2. A Confidence Score (0-100%).\n3. Evidence and exact quotes supporting the verdict.\n\nFormat beautifully in Markdown.\n\nEVIDENCE EXTRACTED:\n{docs}`
  },
  MEETING_MINUTES: {
    map: `Extract participants, decisions made, and action items discussed.\n\nTEXT:\n{context}`,
    reduce: `Generate formal Meeting Minutes.\n\nContext/Date: {input}\n\nInclude:\n1. Executive Summary\n2. Decisions Made\n3. Action Items (with assignees and deadlines if mentioned)\n\nFormat beautifully in Markdown.\n\nNOTES:\n{docs}`
  },
  TIMELINE_GEN: {
    map: `Extract all dates, years, and chronological events.\n\nTEXT:\n{context}`,
    reduce: `Create a Chronological Timeline of all events extracted from the documents.\n\nFormat as a bulleted list ordered from oldest to newest.\n\nEVENTS:\n{docs}`
  },
  PRESENTATION_GEN: {
    map: `Extract the main points suitable for a slide presentation.\n\nTarget specifications (Slide Count, Audience): {input}\n\nTEXT:\n{context}`,
    reduce: `Generate a Slide-by-Slide Presentation outline.\n\nTarget specifications (Slide Count, Audience): {input}\n\nFor each slide, provide:\n- Slide Title\n- Bullet Points\n- Speaker Notes\n\nFormat beautifully in Markdown.\n\nMAIN POINTS:\n{docs}`
  },
  CONTENT_PIPELINE: {
    map: `Extract the most interesting insights, statistics, and hooks.\n\nTarget specifications (Platform, Tone): {input}\n\nTEXT:\n{context}`,
    reduce: `Turn these insights into a highly engaging content piece.\n\nTarget specifications (Platform, Tone): {input}\n\nGenerate the content ONLY for the specified platform, matching the specified tone. Do not generate content for other platforms.\n\nINSIGHTS:\n{docs}`
  }
};

export async function generateAgentStudioArtifact<T extends Runnable>(
  llm: T,
  splitDocs: Document[],
  agentType: string,
  input: string = "",
  onProgress?: (stepIndex: number, message: string) => void
): Promise<string> {
  if (!splitDocs.length) throw new Error("No documents provided.");

  let parsedInput = input;
  try {
    const inputObj = JSON.parse(input);
    if (Object.keys(inputObj).length > 0) {
      parsedInput = Object.entries(inputObj).map(([k, v]) => `${k}: ${v}`).join(', ');
    } else {
      parsedInput = "";
    }
  } catch (e) {
    // If not JSON, leave it as is
  }

  const prompts = AGENT_PROMPTS[agentType];
  if (!prompts) throw new Error(`Unknown agentType: ${agentType}`);

  const dedupedDocs = deduplicateDocs(splitDocs);

  const mapPrompt = ChatPromptTemplate.fromMessages([
    ["user", prompts.map]
  ]);
  const reducePrompt = ChatPromptTemplate.fromMessages([
    ["user", prompts.reduce]
  ]);

  if (onProgress) onProgress(1, `Mapping insights from ${dedupedDocs.length} chunks...`);
  console.log(`[AgentStudio - ${agentType}] MAP phase: ${dedupedDocs.length} chunks...`);
  const mappedChunks: string[] = [];

  for (let i = 0; i < dedupedDocs.length; i++) {
    const docName = dedupedDocs[i].metadata?.source || "Document";
    const prompt = await mapPrompt.invoke({ context: dedupedDocs[i].pageContent, input: parsedInput, doc_name: docName });
    const text = await cachedInvoke(llm, prompt);
    mappedChunks.push(text);
  }

  let collapsedDocs = mappedChunks.map((s) => new Document({ pageContent: s }));

  let collapseRound = 0;
  while (lengthFunction(collapsedDocs) > MAX_TOKENS) {
    collapseRound++;
    const groups = splitListOfDocs(collapsedDocs, MAX_TOKENS);
    if (onProgress) onProgress(1, `Collapsing ${groups.length} groups to fit context window...`);
    console.log(`[AgentStudio - ${agentType}] COLLAPSE round ${collapseRound}: ${groups.length} groups...`);

    const newDocs: Document[] = [];
    for (let i = 0; i < groups.length; i++) {
      const docsText = groups[i].map((d) => d.pageContent).join("\n\n");
      const prompt = await reducePrompt.invoke({ docs: docsText, input: parsedInput });
      const text = await cachedInvoke(llm, prompt);
      newDocs.push(new Document({ pageContent: text }));
    }
    collapsedDocs = newDocs;
  }

  if (onProgress) onProgress(2, `Synthesizing final document...`);
  console.log(`[AgentStudio - ${agentType}] REDUCE phase...`);
  const finalDocsText = collapsedDocs.map((d) => d.pageContent).join("\n\n");
  const finalPrompt = await reducePrompt.invoke({ docs: finalDocsText, input: parsedInput });
  const finalOutput = await cachedInvoke(llm, finalPrompt);

  return finalOutput;
}
