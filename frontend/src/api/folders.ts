import { makeHttpReq } from "@/helper/makeHttpReq";

export interface FolderType {
    _id: string;
    name: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export async function getFolders(): Promise<{ folders: FolderType[] }> {
    const data = await makeHttpReq('GET', 'folders') as { folders: FolderType[] };
    return data;
}

export async function createFolder(name: string): Promise<{ folder: FolderType }> {
    const data = await makeHttpReq('POST', 'folders', { name }) as { folder: FolderType };
    return data;
}

export async function renameFolder(folderId: string, name: string): Promise<{ folder: FolderType }> {
    const data = await makeHttpReq('PUT', `folders/${folderId}`, { name }) as { folder: FolderType };
    return data;
}

export async function deleteFolder(folderId: string): Promise<{ message: string, folderId: string }> {
    const data = await makeHttpReq('DELETE', `folders/${folderId}`) as { message: string, folderId: string };
    return data;
}

export async function moveNoteToFolder(noteId: string, folderId: string | null): Promise<any> {
    const data = await makeHttpReq('PATCH', `notes/${noteId}/move`, { folderId }) as any;
    return data;
}
