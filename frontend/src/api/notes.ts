import { getUserData } from "@/helper/getUserData";
import { makeHttpReq } from "@/helper/makeHttpReq";
import type { NoteServerData, NoteType } from "@/types/note-types";
import { showError, showSuccess } from "@/util/toast-notification";
import { apiUrl } from "@/config/get-env";

export async function getNotes(page = 1, search: string = ''): Promise<NoteServerData> {

    const data = await makeHttpReq('GET', `notes?page=${page}&search=${search}`) as NoteServerData
    return data


}


export async function getSingleNote(id: string): Promise<{ note: NoteType }> {
    const data = await makeHttpReq('GET', `notes/${id}`) as { note: NoteType }
    return data


}


const downloadFileInDrive = async (fileId: string, noteId?: string) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/drive-files`,
            { fileId, userId, noteId }) as any
        console.log(data)
        return data

    } catch (error) {
        console.log('error : ', error)
        showError('Failed to upload drive file')
        return null
    }

};


export const uploadPickedFiles = async (docs: any[], noteId: string) => {
    if (Array.isArray(docs)) {
        const results = []
        for (const doc of docs) {
            const result = await downloadFileInDrive(doc.id, noteId);
            results.push(result)
        }
        if (results.some(r => r !== null)) {
            showSuccess('Drive file(s) uploaded successfully')
        }
        return results
    }
    return []
};


export const sendWeblink = async (webLink: string, noteId?: string) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/weblinkdata`,
            { webLink, userId, noteId })
        console.log('add weblink : ', data)

    } catch (error) {
        console.log('error : ', error)
    }

};


export const sendTextData = async (text: string, noteId?: string) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/text-data`,
            { text, userId, noteId })
        console.log('add text : ', data)

    } catch (error) {
        console.log('error : ', error)
    }

};






export const searchWeb = async (query: string,userId:string) => {
    try {

        const data = await makeHttpReq('GET', `notes/search/web?query=${query}&userId=${userId}`)
        return data
    } catch (error) {
        showError(error?.error?.message)
    }

};




export const updateNote = async (noteId: string, title?: string, isArchived?: boolean) => {
    try {

        const data = await makeHttpReq('PUT', `notes`,
            { title, id: noteId, isArchived })
        console.log('note updated : ', data)
        showSuccess(data?.message as string)

    } catch (error) {
        console.log('error : ', error)
    }

};



export const createSummary = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/summary`,
            { userId, noteId, docIds })

        //it means we already have summaries for all selected sources(docs)
        if (data.status == 'ready_to_generate_source') {
            await generateSummarySource(userId, noteId, docIds)
        }
    } catch (error) {
        console.log('error : ', error)
    }

};


export const generateSummarySource = async (userId: string, noteId: string, docIds: string[]) => {
    try {

        const data = await makeHttpReq('POST', `notes/add/sources`,
            { userId, noteId, docIds })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }

}




// faq


export const createFAQ = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/faq`,
            { userId, noteId, docIds })

        //it means we already have summaries for all selected sources(docs)
        if (data.status == 'ready_to_generate_source') {
            await generateFAQSource(userId, noteId, docIds)
        }
    } catch (error) {
        console.log('error : ', error)
    }

};


export const generateFAQSource = async (userId: string, noteId: string, docIds: string[]) => {
    try {

        const data = await makeHttpReq('POST', `notes/add/faq/sources`,
            { userId, noteId, docIds })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }

}


// end faq




// study guide



export const createStudyGuide = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/studyguide`,
            { userId, noteId, docIds })

        //it means we already have summaries for all selected sources(docs)
        if (data.status == 'ready_to_generate_source') {
            await generateStudyguide(userId, noteId, docIds)
        }
    } catch (error) {
        console.log('error : ', error)
    }

};


export const generateStudyguide = async (userId: string, noteId: string, docIds: string[]) => {
    try {

        const data = await makeHttpReq('POST', `notes/add/studyguide/sources`,
            { userId, noteId, docIds })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }

}



// briefing doc










export const createBriefingDoc = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/briefingdoc`,
            { userId, noteId, docIds, type: 'briefing-doc' })

        //it means we already have summaries for all selected sources(docs)
        if (data.status == 'ready_to_generate_source') {
            await generateBriefingDoc(userId, noteId, docIds)
        }
    } catch (error) {
        console.log('error : ', error)
    }

};


export const generateBriefingDoc = async (userId: string, noteId: string, docIds: string[]) => {
    try {

        const data = await makeHttpReq('POST', `notes/add/briefingdoc/sources`,
            { userId, noteId, docIds, type: 'briefing-doc' })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }

}

// flashcards

export const createFlashcards = async (noteId: string, docIds: string[], count: number = 10) => {
    try {
        const userData = getUserData();
        const userId = userData?._id;

        const data = await makeHttpReq('POST', `notes/flashcards/generate`,
            { userId, noteId, docIds, count });
        showSuccess(data?.message || 'Flashcards generated successfully');
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};

export const getFlashcards = async (noteId: string) => {
    try {
        const data = await makeHttpReq('GET', `notes/flashcards?noteId=${noteId}`);
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};

// ppt

export const createPPT = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData();
        const userId = userData?._id;

        const data = await makeHttpReq('POST', `notes/ppt/generate`,
            { userId, noteId, docIds });
        showSuccess(data?.message || 'Presentation generated successfully');
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};




export async function getSourceResults(noteId: string) {
    const userData = getUserData()
    const userId = userData?._id
    const data = await makeHttpReq('GET', `notes/source/results?noteId=${noteId}&userId=${userId}`)
    return data


}




// mindMap

export const createMindMap = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/mindmap`,
            { userId, noteId, docIds })

        //it means we already have summaries for all selected sources(docs)
        if (data.status == 'ready_to_generate_source') {
            await generateMindMap(userId, noteId, docIds)
        }
    } catch (error) {
        console.log('error : ', error)
    }

};


export const generateMindMap = async (userId: string, noteId: string, docIds: string[]) => {
    try {

        const data = await makeHttpReq('POST', `notes/add/mindmap/sources`,
            { userId, noteId, docIds })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }

}


// end


// Audio Overview

export const createAudioOverview = async (noteId: string, docIds: string[]) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        // Note: For audio overviews, we'll directly generate it (skipping the "check if exists" step for now,
        // or simulating the same pattern if we had an audio overview endpoint). 
        // For simplicity we go straight to generation.
        await generateAudioOverview(userId as string, noteId as string, docIds)
    } catch (error) {
        console.log('error : ', error)
    }
};

export const generateAudioOverview = async (userId: string, noteId: string, docIds: string[]) => {
    try {
        const data = await makeHttpReq('POST', `notes/add/audio/sources`,
            { userId, noteId, docIds })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }
}

export const getAudioUrl = async (key: string) => {
    try {
        const data = await makeHttpReq('GET', `notes/audio/url?key=${encodeURIComponent(key)}`) as { url: string };
        return data.url;
    } catch (error) {
        console.log('error : ', error);
        return null;
    }
}
// end


// end


// Podcast (TTS Narration)

export const createPodcast = async (noteId: string, docIds: string[] = []) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        await generatePodcast(userId as string, noteId as string, docIds)
    } catch (error) {
        console.log('error : ', error)
    }
};

export const generatePodcast = async (userId: string, noteId: string, docIds: string[]) => {
    try {
        const data = await makeHttpReq('POST', `notes/add/podcast/sources`,
            { userId, noteId, docIds })

        showSuccess(data?.message)
    } catch (error) {
        console.log('error : ', error)
    }
}

// end



// chats


export type messageType={ role: 'ai' | 'user', noteId: string, userId: string, content: string, conversationId?: string }
export type chatHistoryType = { chatHistory: Array<messageType> }
export const getNoteChats = async (userId: string, noteId: string, conversationId?: string) => {
    try {
        let url = `chats/history?userId=${userId}&noteId=${noteId}`;
        if (conversationId) url += `&conversationId=${conversationId}`;
        
        const data = await makeHttpReq('GET', url) as chatHistoryType;
        return data

    } catch (error) {
        console.log('error : ', error)
    }

}


export const sendChatMessage = async ({userId,noteId,docIds,query, conversationId}:{userId: string, noteId: string, docIds?: string[], query:string, conversationId?: string}) => {
    try {

        const data = await makeHttpReq('POST', `chats`,
            { userId, noteId, docIds, query, conversationId }) as {message:messageType}
            return data
    } catch (error) {
        console.log('error : ', error)
    }

}

export const sendChatMessageStream = async (
    {userId,noteId,docIds,query, conversationId}: {userId: string, noteId: string, docIds?: string[], query:string, conversationId?: string},
    onChunk: (chunk: string) => void,
    onCitations?: (citations: Array<{ title: string; docId: string }>) => void,
) => {
    const url = `${apiUrl}/api/v1/chats`;
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "Accept": "text/event-stream",
        },
        body: JSON.stringify({userId, noteId, docIds, query, conversationId}),
    });

    if (!res.ok) {
        const err: any = new Error("Failed to start chat stream");
        err.status = res.status;
        throw err;
    }

    if (!res.body) {
        throw new Error("No response body");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
            const chunkText = decoder.decode(value, { stream: true });
            const lines = chunkText.split("\n");
            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    try {
                        const data = JSON.parse(line.substring(6));
                        if (data.chunk) {
                            onChunk(data.chunk);
                        }
                        if (data.done) {
                            done = true;
                            if (data.citations && onCitations) {
                                onCitations(data.citations);
                            }
                        }
                        if (data.error && data.code === 402) {
                            const err: any = new Error(data.error);
                            err.status = 402;
                            throw err;
                        }
                    } catch (e: any) {
                        if (e?.status === 402) throw e;
                        console.error("Error parsing SSE line", e);
                    }
                }
            }
        }
    }
}

// Multi-chat Conversation APIs
export const createConversationApi = async (noteId: string, title: string) => {
    const userData = getUserData();
    const userId = userData?._id;
    return await makeHttpReq('POST', `chats/conversations`, { userId, noteId, title });
};

export const getConversationsApi = async (noteId: string) => {
    const userData = getUserData();
    const userId = userData?._id;
    return await makeHttpReq('GET', `chats/conversations?userId=${userId}&noteId=${noteId}`);
};

export const renameConversationApi = async (conversationId: string, title: string) => {
    return await makeHttpReq('PUT', `chats/conversations/${conversationId}/rename`, { title });
};

export const deleteConversationApi = async (conversationId: string) => {
    return await makeHttpReq('DELETE', `chats/conversations/${conversationId}`);
};

export const duplicateConversationApi = async (conversationId: string) => {
    return await makeHttpReq('POST', `chats/conversations/${conversationId}/duplicate`);
};

export type questionAndDocOverviewType= {aiResult:{questions:string[],doc_overview:string}}

export const getQuestionsAndDocOverview = async (noteId:string) => {
    try {

        const data = await makeHttpReq('GET', `notes/docs/overview?noteId=${noteId}`) as questionAndDocOverviewType
        console.log(' :  ',data)
            return data
    } catch (error) {
        console.log('error : ', error)
    }

}



export const createBlankNote = async () => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `blank/notes`,
            { userId }) as{newNote: {_id:string,title:string}}
       return data

    } catch (error) {
        console.log('error : ', error)
    }

};

export const deleteNoteApi = async (noteId: string) => {
    try {
        const data = await makeHttpReq('DELETE', `notes/${noteId}`);
        showSuccess(data?.message || 'Note deleted successfully');
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};

export const duplicateNoteApi = async (noteId: string) => {
    try {
        const userData = getUserData()
        const userId = userData?._id

        const data = await makeHttpReq('POST', `notes/${noteId}/duplicate`, { userId });
        showSuccess(data?.message || 'Note duplicated successfully');
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};

export const deleteSourceApi = async (docId: string) => {
    try {
        const data = await makeHttpReq('DELETE', `notes/sources/${docId}`);
        showSuccess(data?.message || 'Source deleted successfully');
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};

export const renameSourceApi = async (docId: string, displayName: string) => {
    try {
        const data = await makeHttpReq('PUT', `notes/sources/${docId}/rename`, { displayName });
        showSuccess(data?.message || 'Source renamed successfully');
        return data;
    } catch (error) {
        console.log('error : ', error);
        throw error;
    }
};

export const uploadFilesApi = async (files: FileList, noteId: string) => {
    const formData = new FormData();
    const userData = getUserData();
    const userId = userData?._id;
    Array.from(files).forEach((file) => {
        formData.append("doc", file);
        formData.append("userId", userId);
        formData.append("noteId", noteId);
    });

    try {
        const response = await fetch(`${apiUrl}/api/v1/notes/upload-files`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        showSuccess('File(s) uploaded successfully');
        return data;
    } catch (error) {
        console.error("Error uploading files:", error);
        showError('Failed to upload file(s)');
        throw error;
    }
};

// Trigger Vite HMR
