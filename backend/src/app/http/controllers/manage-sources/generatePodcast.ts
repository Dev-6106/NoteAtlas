import { ChatFireworks } from "@langchain/community/chat_models/fireworks";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import z from "zod";
import zodToJsonSchema from "zod-to-json-schema";


export async function generatePodcastFromBrieifingDocs(props: { llm: ChatFireworks, context: string, title: string, userId: string, noteId: string, total_source: number }) {
    try {
        const { userId, noteId, context, total_source, title, llm } = props

        const mapPrompt = ChatPromptTemplate.fromMessages([
            [
                "user",
                `
You are a professional podcast scriptwriter and storyteller.

Your task is to create a *5-minute podcast dialogue* based on the following document context.

---
{context}
---

### Podcast Requirements:

- Write a natural, engaging conversation between two hosts:

1. **Host 1**
   - voiceId: "Xb7hH8MSUJpSbSDYk0k2"

2. **Host 2**
   - voiceId: "pqHfZKP75CvOlQylNhV4"

- Alternate between the two hosts in a back-and-forth conversation style.
- Keep the discussion friendly, clear, and full of insights related to the document.
- Use **emotion markers in square brackets** to guide tone and pacing, e.g.:
  [smiles], [laughs], [pauses], [excited], [serious]
- Write as if this will be spoken aloud, not read.
- Avoid long monologues — keep each host's line short and conversational.
- Ensure the total conversation lasts roughly **5 minutes** when spoken.

### Output Format:

Return a **JSON array** (no additional text) where each item has:

- **text** → what the speaker says
- **voiceId** → the speaker's assigned voice ID

Example:
Ar = array
o = opening brackets
c = closing brackets

Ar
  o
    "text": "[excited] Welcome back everyone!",
    "voiceId": "Xb7hH8MSUJpSbSDYk0k2"
  c,
  o
    "text": "[laughs] Today we're diving into something fascinating.",
    "voiceId": "pqHfZKP75CvOlQylNhV4"
  c
Ar

Only return valid JSON.
    `,
            ],
        ]);

        const prompt = await mapPrompt.invoke(context:context );
        const response = await llm.invoke(prompt,{
            response_format:{
                type: "json_object",
                schema: zodToJsonSchema(
                    z.object({
                        podcast:z.array(z.object({
                            text: z.string(),
                            voiceId: z.string()
                        }))
                    })
                )
            }
        } as any);

        const aiResult = response?.content;
        const conversation =  JSON.parse(aiResult as string);

        const input = conversation?.podcast;

        await generateAudio({input, title, userId, noteId, total_source});
    } catch (error) {
        console.log("Failed to generate audio..");
    }
}