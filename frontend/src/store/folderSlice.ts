import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import * as folderApi from '@/api/folders';
import type { FolderType } from '@/api/folders';

interface FolderState {
    folders: FolderType[];
    loading: boolean;
    error: string | null;
}

const initialState: FolderState = {
    folders: [],
    loading: false,
    error: null,
};

export const fetchFolders = createAsyncThunk(
    'folders/fetchAll',
    async () => {
        const response = await folderApi.getFolders();
        return response.folders;
    }
);

export const createNewFolder = createAsyncThunk(
    'folders/create',
    async (name: string) => {
        const response = await folderApi.createFolder(name);
        return response.folder;
    }
);

export const renameFolder = createAsyncThunk(
    'folders/rename',
    async ({ id, name }: { id: string; name: string }) => {
        const response = await folderApi.renameFolder(id, name);
        return response.folder;
    }
);

export const removeFolder = createAsyncThunk(
    'folders/delete',
    async (id: string) => {
        const response = await folderApi.deleteFolder(id);
        return response.folderId;
    }
);

export const moveNote = createAsyncThunk(
    'folders/moveNote',
    async ({ noteId, folderId }: { noteId: string; folderId: string | null }) => {
        await folderApi.moveNoteToFolder(noteId, folderId);
        return { noteId, folderId };
    }
);

const folderSlice = createSlice({
    name: 'folders',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchFolders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchFolders.fulfilled, (state, action) => {
                state.loading = false;
                state.folders = action.payload;
            })
            .addCase(fetchFolders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Failed to fetch folders';
            })
            .addCase(createNewFolder.fulfilled, (state, action) => {
                state.folders.unshift(action.payload);
            })
            .addCase(renameFolder.fulfilled, (state, action) => {
                const index = state.folders.findIndex(f => f._id === action.payload._id);
                if (index !== -1) {
                    state.folders[index] = action.payload;
                }
            })
            .addCase(removeFolder.fulfilled, (state, action) => {
                state.folders = state.folders.filter(f => f._id !== action.payload);
            });
    },
});

export default folderSlice.reducer;
