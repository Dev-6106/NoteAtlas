import { apiUrl } from "@/config/get-env";
import { auth } from "@/config/firebase";

export type AgentStreamEvent = {
  stepIndex?: number;
  message?: string;
  status: 'processing' | 'success' | 'error';
  data?: any;
};

export const streamAgentReport = async (
  noteId: string,
  docIds: string[],
  agentType: string,
  agentTitle: string,
  inputs: string,
  onProgress: (event: AgentStreamEvent) => void
) => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User not authenticated");
  }

  const token = await user.getIdToken();

  const url = `${apiUrl}/api/v1/notes/agents/generate`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      userId: user.uid,
      noteId,
      docIds,
      agentType,
      agentTitle,
      inputs
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  if (!response.body) {
    throw new Error("ReadableStream not yet supported in this browser.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");

  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // Process events separated by double newline
    const chunks = buffer.split('\n\n');
    buffer = chunks.pop() || ''; // Keep the last incomplete chunk in the buffer

    for (const chunk of chunks) {
      if (chunk.startsWith('data: ')) {
        const dataStr = chunk.slice(6);
        if (dataStr === '[DONE]') {
          break;
        }
        try {
          const parsed: AgentStreamEvent = JSON.parse(dataStr);
          onProgress(parsed);
          
          if (parsed.status === 'success' || parsed.status === 'error') {
            // End of stream condition
          }
        } catch (e) {
          console.error("Error parsing SSE JSON:", e);
        }
      }
    }
  }
};
