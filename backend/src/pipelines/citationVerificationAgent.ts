import { END, START, StateGraph, Annotation } from "@langchain/langgraph";
import { z } from "zod";
import { ChatGroq } from "@langchain/groq";
import { queryVectorDB } from "./retreiver";
import { TavilySearch } from "@langchain/tavily";

const llm = new ChatGroq({
  model: "llama-3.3-70b-versatile",
  temperature: 0,
});

const StateAnnotation = Annotation.Root({
  documentText: Annotation<string>({ reducer: (p, n) => n || p || "" }),
  userId: Annotation<string>({ reducer: (p, n) => n || p || "" }),
  noteId: Annotation<string>({ reducer: (p, n) => n || p || "" }),
  claims: Annotation<string[]>({ reducer: (p, n) => n || p || [] }),
  verifications: Annotation<string[]>({
    default: () => [],
    reducer: (p, n) => p.concat(n),
  }),
  report: Annotation<string>({ reducer: (p, n) => n || p || "" }),
});

const extractClaims = async (state: typeof StateAnnotation.State) => {
  const schema = z.object({
    claims: z.array(z.string()).max(3).describe("Top 3 most important factual claims made in the text"),
  });
  const structuredLlm = llm.withStructuredOutput(schema);
  const prompt = `Extract the top 3 most important factual claims from the following text that need verification:\n\n${state.documentText.slice(0, 5000)}`;
  
  const result = await structuredLlm.invoke([{ role: "user", content: prompt }]);
  return { claims: result.claims };
};

const verifyClaims = async (state: typeof StateAnnotation.State) => {
  const verifications: string[] = [];
  const tavily = new TavilySearch({ tavilyApiKey: process.env.TAVILY_API_KEY });

  for (const claim of state.claims) {
    let dbEvidence = "No internal evidence found.";
    try {
      const dbResult = await queryVectorDB(claim, state.userId, state.noteId);
      if (dbResult && dbResult.length > 0) {
        dbEvidence = dbResult.map((d: any) => d.pageContent).join("\n\n");
      }
    } catch (e) {
      console.warn("Vector DB error:", e);
    }

    let webEvidence = "No web evidence found.";
    try {
      const webDocs = await tavily.invoke({ query: `Fact check: ${claim}` });
      if (webDocs?.results) {
        webEvidence = webDocs.results.map((d: any) => d.content).join("\n\n");
      }
    } catch (e) {
      console.warn("Tavily Search error:", e);
    }

    const verificationPrompt = `You are a Fact-Checking Agent.
Verify the following claim: "${claim}"

[INTERNAL EVIDENCE (Vector DB)]
${dbEvidence}

[EXTERNAL EVIDENCE (Web Search)]
${webEvidence}

Provide a concise verification result including:
- Verdict (Supported / Contradicted / Mixed / Unverifiable)
- Confidence Score (0-100%)
- Explanation (1 paragraph referencing the evidence)
`;

    const result = await llm.invoke(verificationPrompt);
    verifications.push(`### Claim: ${claim}\n\n${result.content}\n`);
  }

  return { verifications };
};

const generateFinalReport = async (state: typeof StateAnnotation.State) => {
  const report = `# Citation & Fact Verification Report

We extracted the top claims from your document and verified them against both your personal knowledge base (Vector DB) and the public web.

${state.verifications.join("\n---\n")}
`;
  return { report };
};

const builder = new StateGraph(StateAnnotation)
  .addNode("extractClaims", extractClaims)
  .addNode("verifyClaims", verifyClaims)
  .addNode("generateFinalReport", generateFinalReport)
  .addEdge(START, "extractClaims")
  .addEdge("extractClaims", "verifyClaims")
  .addEdge("verifyClaims", "generateFinalReport")
  .addEdge("generateFinalReport", END);

export const citationVerificationGraph = builder.compile();

export async function runCitationVerification(
  documentText: string, 
  userId: string, 
  noteId: string,
  onProgress?: (stepIndex: number, message: string) => void
): Promise<string> {
  if (onProgress) onProgress(1, "Extracting top factual claims from the text...");
  
  const stream = await citationVerificationGraph.stream({ documentText, userId, noteId });
  let report = "";

  for await (const chunk of stream) {
    if (chunk.extractClaims && onProgress) {
      onProgress(1, "Verifying claims against Vector DB and Web Search...");
    }
    if (chunk.verifyClaims && onProgress) {
      onProgress(2, "Compiling final verification report...");
    }
    if (chunk.generateFinalReport) {
      report = chunk.generateFinalReport.report;
    }
  }
  
  return report;
}
