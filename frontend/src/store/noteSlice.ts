


import { getNotes } from "@/api/notes";
import type { NoteServerData } from "@/types/note-types";
import { createSlice, createAsyncThunk, type PayloadAction, } from "@reduxjs/toolkit";
import { makeHttpReq } from "@/helper/makeHttpReq";


// Wrap API call in an async thunk
export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async ({ page = 1, search = "", isArchived = false, sortBy = "updatedAt", sortOrder = "desc", folderId }: 
    { page: number, search: string, isArchived?: boolean, sortBy?: string, sortOrder?: string, folderId?: string | null }) => {
      const queryParams: Record<string, string> = {
          page: page.toString(),
          search,
          isArchived: isArchived.toString(),
          sortBy,
          sortOrder
      };
      
      if (folderId !== undefined) {
          queryParams.folderId = folderId === null ? "null" : folderId;
      }

      const query = new URLSearchParams(queryParams).toString();
      
      const data = await makeHttpReq('GET', `notes?${query}`) as NoteServerData;
      return data;
  }
);

interface NotesState extends NoteServerData {

  loading: boolean;
  error: string | null;
}

const initialState: NotesState = {
  notes: [],
  loading: false,
  error: null,
};

const notesSlice = createSlice({
  name: "note",
  initialState,
  reducers: {


  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action: PayloadAction<NoteServerData>) => {
        state.notes = action.payload?.notes;
        state.pagination = action.payload.pagination;
        state.loading = false;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notes";
      });
  },
});

export default notesSlice.reducer
