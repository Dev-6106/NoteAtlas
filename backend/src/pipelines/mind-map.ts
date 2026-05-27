import z from "zod";
import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { PromptTemplate } from "@langchain/core/prompts";
import zodToJsonSchema from "zod-to-json-schema";
import { Runnable } from "@langchain/core/runnables";

const MindElixirNode = z.object({
  id: z.string(),
  topic: z.string(),
  children: z.array(
    z.object({
      id: z.string(),
      topic: z.string(),
      children: z.array(
        z.object({
          id: z.string(),
          topic: z.string(),
          children: z.array(
            z.object({
              id: z.string(),
              topic: z.string(),
              children: z.array(z.any()).optional(),
            }),
          ),
        }),
      ),
    }),
  ),
});

const MindElixitData = z.object({
  nodeData: MindElixirNode
});

// const llm = new ChatFireworks({
//   model:
//     "accounts/fireworks/models/deepseek-v4-pro",
//   temperature: 0,
//   maxRetries: 5,
//   apiKey: process.env.CHATFIREWORK_API_KEY,
// });

export async function generateMindMap<T extends Runnable>(llm: T, studguide: string) {

  const prompt = PromptTemplate.fromTemplate(`
You are an expert-level tutor in the education department. Your task is to create a **Mind Map** that enhances studying, improves recall, and organizes information in a highly structured way.

The Mind Map must be:
- Deeply organized
- Visually hierarchical
- Educationally effective
- Easy to memorize
- Accurate and comprehensive

Accuracy, clarity, and relevance are core success factors.

Follow these rules strictly:

1. Begin by asking the user up to 5 pertinent questions to gather essential specifics for personalization.
2. Take a step back and think about the task thoroughly. Consider success factors, evaluation criteria, and the optimal structure before generating the output.
3. Use the user's details and key references to craft the Mind Map.
4. Present the Mind Map in **valid MindElixir JSON format**, using short node names (1–5 words). Move long explanations into deeper child nodes.
5. Include core Prompt Engineering techniques if relevant:
   - Zero-Shot
   - Few-Shot
   - Chain-of-Thought
   - Tree-of-Thought
   - Self-Consistency
   - Reflection
   - Retrieval-Augmented Generation (RAG)
   - ReAct
6. After generating the Mind Map, **evaluate your work** using a table with:
   - Criteria
   - Rating (1–10)
   - Reasons for the score
   - Suggested improvements
7. Provide **post-evaluation options** for refining the Mind Map.
8. Append a **CHANGE LOG** section for revisions.
9. Always conclude with:
   "🧠 Would You Like Me To Evaluate This Work ☝️ and Provide Options to Improve It? Yes or No"
10. Ensure the structure matches MindElixir format exactly.
11. Do not include any text outside JSON.
12. Output only raw JSON.
13. Use recursive child nodes for deep hierarchy.
14. Every node must contain:
   - "id"
   - "topic"
   - optional "children"
15. Keep topics concise and optimized for visual readability.
16. Avoid duplicate nodes.
17. Maintain strong semantic grouping.
18. The root node should summarize the entire study guide.
19. Generate a balanced tree structure with evenly distributed branches.
20. Ensure the JSON is directly parsable by MindElixir without modification.

MindElixir Structure Reference:

o=open curly brace
c=close curly brace

o
  "nodeData": o
    "id": "root",
    "topic": "<Main Topic>",
    "children": [
      o
        "id": "<unique_id>",
        "topic": "<Short Node Name>",
        "children": [ ... recursive subtopics ... ]
      c
    ]
  c
c

Key References:
- Tony Buzan, "The Mind Map Book" (2003)
- Peter C. Brown et al., "Make It Stick" (2014)
- Amy E. Herman, "Visual Intelligence" (2016)

Study Guide:
"""
{study_guide_text}
"""

Output the Mind Map as JSON only, fully compatible with MindElixir.
`);

  const responseFormat = z.object({
    nodeData: MindElixirNode
  });

  const structuredLlm = (llm as any).withStructuredOutput(responseFormat);

  const chain = prompt.pipe(structuredLlm);

  const chainResult = await chain.invoke({ study_guide_text: studguide });

  // withStructuredOutput automatically parses the response into the Zod object format!
  const mindMap = JSON.stringify(chainResult, null, 2);
  return mindMap;
};