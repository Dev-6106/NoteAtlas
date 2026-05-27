import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getNotes } from "@/api/notes";
import type { NoteType, PaginationType } from "@/types/note-types";

interface NoteState {
  notes: NoteType[];
  loading: boolean;
  error: string | null;
  pagination: PaginationType | null;
}

const initialState: NoteState = {
  notes: [],
  loading: false,
  error: null,
  pagination: null,
};

export const fetchNotes = createAsyncThunk(
  "notes/fetchNotes",
  async ({ page, search, userId }: { page: number; search: string; userId?: string }) => {
    return await getNotes(page, search, userId);
  }
);

const noteSlice = createSlice({
  name: "notes",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotes.fulfilled, (state, action) => {
        state.loading = false;
        state.notes = action.payload.notes;
        state.pagination = action.payload.pagination ?? null;
      })
      .addCase(fetchNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch notes";
      });
  },
});

export default noteSlice.reducer;
