import { env } from "@/config/env";
import { getUserData } from "@/helper/getUserData";
import { makeHttpReq } from "@/helper/makeHttpReq";
import type { NoteServerData, NoteType } from "@/types/note-types";
import { showError, showSuccess } from "@/util/toast-notification";

// ─── Notes CRUD ───────────────────────────────────────────

export async function getNotes(page = 1, search = "", userId = ""): Promise<NoteServerData> {
  const queryParams = new URLSearchParams({
    page: page.toString(),
    search,
  });
  if (userId) {
    queryParams.append("userId", userId);
  }
  const { data } = await makeHttpReq<NoteServerData>(
    `/api/v1/notes?${queryParams.toString()}`
  );
  return data;
}

export async function getSingleNote(id: string): Promise<{ note: NoteType }> {
  const { data } = await makeHttpReq<{ note: NoteType }>(`/api/v1/notes/${id}`);
  return data;
}

export const updateNote = async (noteId: string, title: string) => {
  try {
    const { data } = await makeHttpReq<{ message: string }>("/api/v1/notes", {
      method: "PUT",
      body: { title, id: noteId },
    });
    showSuccess(data?.message);
  } catch (error: any) {
    showError(error?.message ?? "Failed to update note");
  }
};

export const createBlankNote = async () => {
  const userData = getUserData();
  const { data } = await makeHttpReq<{ newNote: { _id: string; title: string } }>(
    "/api/v1/blank/notes",
    { method: "POST", body: { userId: userData?._id } }
  );
  return data;
};

export const createNoteWithDoc = async (formData: FormData) => {
  const userData = getUserData();
  if (userData?._id) {
    formData.append("userId", userData._id);
  }
  const { data } = await makeHttpReq<{ newNote: { _id: string; title: string }, message: string }>(
    "/api/v1/notes",
    { method: "POST", body: formData }
  );
  return data;
};

// ─── Source Upload ─────────────────────────────────────────

const downloadFileInDrive = async (fileId: string, noteId?: string) => {
  const userData = getUserData();
  await makeHttpReq("/api/v1/notes/drive-files", {
    method: "POST",
    body: { fileId, userId: userData?._id, noteId },
  });
};

export const uploadPickedFiles = async (docs: any[], noteId: string) => {
  if (!Array.isArray(docs)) return;
  for (const doc of docs) {
    await downloadFileInDrive(doc.id, noteId);
  }
};

export const sendWeblink = async (webLink: string, noteId?: string) => {
  const userData = getUserData();
  await makeHttpReq("/api/v1/notes/weblinkdata", {
    method: "POST",
    body: { webLink, userId: userData?._id, noteId },
  });
};

export const sendTextData = async (text: string, noteId?: string) => {
  const userData = getUserData();
  await makeHttpReq("/api/v1/notes/text-data", {
    method: "POST",
    body: { text, userId: userData?._id, noteId },
  });
};

export const sendYoutubeLink = async (youtubeLink: string, noteId?: string) => {
  const userData = getUserData();
  await makeHttpReq("/api/v1/notes/youtube-link", {
    method: "POST",
    body: { youtubeLink, userId: userData?._id, noteId },
  });
};

// ─── AI Generation ────────────────────────────────────────

export const searchWeb = async (query: string, userId: string) => {
  try {
    const { data } = await makeHttpReq(
      `/api/v1/notes/search/web?query=${encodeURIComponent(query)}&userId=${userId}`
    );
    return data;
  } catch (error: any) {
    showError(error?.message ?? "Web search failed");
  }
};

// Summary
export const createSummary = async (noteId: string, docIds: string[]) => {
  const userData = getUserData();
  const userId = userData?._id as string;
  const { data } = await makeHttpReq<any>("/api/v1/notes/summary", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  if (data.status === "ready_to_generate_source") {
    await generateSummarySource(userId, noteId, docIds);
  }
};

export const generateSummarySource = async (userId: string, noteId: string, docIds: string[]) => {
  const { data } = await makeHttpReq<{ message: string }>("/api/v1/notes/add/sources", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  showSuccess(data?.message);
};

// FAQ
export const createFAQ = async (noteId: string, docIds: string[]) => {
  const userData = getUserData();
  const userId = userData?._id as string;
  const { data } = await makeHttpReq<any>("/api/v1/notes/faq", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  if (data.status === "ready_to_generate_source") {
    await generateFAQSource(userId, noteId, docIds);
  }
};

export const generateFAQSource = async (userId: string, noteId: string, docIds: string[]) => {
  const { data } = await makeHttpReq<{ message: string }>("/api/v1/notes/add/faq/sources", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  showSuccess(data?.message);
};

// Study Guide
export const createStudyGuide = async (noteId: string, docIds: string[]) => {
  const userData = getUserData();
  const userId = userData?._id as string;
  const { data } = await makeHttpReq<any>("/api/v1/notes/studyguide", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  if (data.status === "ready_to_generate_source") {
    await generateStudyguide(userId, noteId, docIds);
  }
};

export const generateStudyguide = async (userId: string, noteId: string, docIds: string[]) => {
  const { data } = await makeHttpReq<{ message: string }>("/api/v1/notes/add/studyguide/sources", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  showSuccess(data?.message);
};

// Briefing Doc
export const createBriefingDoc = async (
  noteId: string,
  docIds: string[],
  type: "audio" | "briefing-doc"
) => {
  const userData = getUserData();
  const userId = userData?._id as string;
  const { data } = await makeHttpReq<any>("/api/v1/notes/briefingdoc", {
    method: "POST",
    body: { userId, noteId, docIds, type },
  });
  if (data.status === "ready_to_generate_source") {
    await generateBriefingDoc(userId, noteId, docIds, type);
  }
};

export const generateBriefingDoc = async (
  userId: string,
  noteId: string,
  docIds: string[],
  type: "audio" | "briefing-doc"
) => {
  const { data } = await makeHttpReq<{ message: string }>("/api/v1/notes/add/briefingdoc/sources", {
    method: "POST",
    body: { userId, noteId, docIds, type },
  });
  showSuccess(data?.message);
};

// Mind Map
export const createMindMap = async (noteId: string, docIds: string[]) => {
  const userData = getUserData();
  const userId = userData?._id as string;
  const { data } = await makeHttpReq<any>("/api/v1/notes/mindmap", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  if (data.status === "ready_to_generate_source") {
    await generateMindMap(userId, noteId, docIds);
  }
};

export const generateMindMap = async (userId: string, noteId: string, docIds: string[]) => {
  const { data } = await makeHttpReq<{ message: string }>("/api/v1/notes/add/mindmap/sources", {
    method: "POST",
    body: { userId, noteId, docIds },
  });
  showSuccess(data?.message);
};

// Source Results
export async function getSourceResults(noteId: string) {
  const userData = getUserData();
  const { data } = await makeHttpReq(
    `/api/v1/notes/source/results?noteId=${noteId}&userId=${userData?._id}`
  );
  return data;
}

// ─── Chat ─────────────────────────────────────────────────

export type MessageType = {
  role: "ai" | "user";
  noteId: string;
  userId: string;
  content: string;
};

export type ChatHistoryType = {
  chatHistory: Array<MessageType>;
};

export type QuestionAndDocOverviewType = {
  aiResult: { questions: string[]; doc_overview: string };
};

export const getNoteChats = async (userId: string, noteId: string) => {
  const { data } = await makeHttpReq<ChatHistoryType>(
    `/api/v1/chats/history?userId=${userId}&noteId=${noteId}`
  );
  return data;
};

export const sendChatMessage = async ({
  userId,
  noteId,
  query,
}: {
  userId: string;
  noteId: string;
  query: string;
}) => {
  const { data } = await makeHttpReq<{ message: MessageType }>("/api/v1/chats", {
    method: "POST",
    body: { userId, noteId, query },
  });
  return data;
};

export const getQuestionsAndDocOverview = async (noteId: string) => {
  const { data } = await makeHttpReq<QuestionAndDocOverviewType>(
    `/api/v1/notes/docs/overview?noteId=${noteId}`
  );
  return data;
};
