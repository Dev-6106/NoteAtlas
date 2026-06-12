import { makeHttpReq } from "@/helper/makeHttpReq";

export interface Annotation {
  _id: string;
  userId: string;
  docId: string;
  noteId: string;
  type: "highlight" | "note" | "bookmark" | "question";
  content?: string;
  selectedText?: string;
  startOffset?: number;
  endOffset?: number;
  color?: string;
  aiResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export async function createAnnotation(
  noteId: string,
  docId: string,
  data: Partial<Annotation>
): Promise<Annotation> {
  const res = await makeHttpReq("POST", `notes/${noteId}/docs/${docId}/annotations`, data) as { annotation: Annotation };
  return res.annotation;
}

export async function getAnnotations(
  noteId: string,
  docId: string
): Promise<Annotation[]> {
  const res = await makeHttpReq("GET", `notes/${noteId}/docs/${docId}/annotations`) as { annotations: Annotation[] };
  return res.annotations;
}

export async function askAIAboutSelection(
  noteId: string,
  docId: string,
  question: string,
  selectedText: string
): Promise<Annotation> {
  const res = await makeHttpReq("POST", `notes/${noteId}/docs/${docId}/annotations/ask`, {
    question,
    selectedText,
  }) as { annotation: Annotation };
  return res.annotation;
}

export async function deleteAnnotation(
  noteId: string,
  docId: string,
  annotationId: string
): Promise<void> {
  await makeHttpReq("DELETE", `notes/${noteId}/docs/${docId}/annotations/${annotationId}`);
}
