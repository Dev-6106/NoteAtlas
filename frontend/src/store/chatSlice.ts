import {
  getQuestionsAndDocOverview,
  getSingleNote,
  type QuestionAndDocOverviewType,
} from "@/api/notes";
import type { NoteType } from "@/types/note-types";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

// ─── Async Thunks ─────────────────────────────────────────

export const fetchSingleNote = createAsyncThunk(
  "chat/fetchSingleNote",
  async (id: string) => getSingleNote(id)
);

export const fetchDocOverviewAndQuestions = createAsyncThunk(
  "chat/fetchDocOverview",
  async (noteId: string) => getQuestionsAndDocOverview(noteId)
);

// ─── State ────────────────────────────────────────────────

interface ChatState {
  note: NoteType;
  loading: boolean;
  error: string | null;
  aiResult: QuestionAndDocOverviewType;
  leftPanelOpen: boolean;
  rightPanelOpen: boolean;
  middlePanelDefaultWidth: number;
  payment: { modal: boolean };
}

const initialState: ChatState = {
  note: {} as NoteType,
  loading: false,
  error: null,
  aiResult: {} as QuestionAndDocOverviewType,
  leftPanelOpen: true,
  rightPanelOpen: true,
  middlePanelDefaultWidth: 50,
  payment: { modal: false },
};

// ─── Slice ────────────────────────────────────────────────

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    attribNoteVal: (state, action: PayloadAction<NoteType>) => {
      state.note = action.payload;
    },
    togglePaymentModal: (state) => {
      state.payment.modal = !state.payment.modal;
    },
    addExtraWidth: (state) => {
      state.middlePanelDefaultWidth += 21;
    },
    reduceExtraWidth: (state) => {
      state.middlePanelDefaultWidth -= 21;
    },
    toggleLeftPanel: (state) => {
      state.leftPanelOpen = !state.leftPanelOpen;
    },
    toggleRightPanel: (state) => {
      state.rightPanelOpen = !state.rightPanelOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSingleNote.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSingleNote.fulfilled, (state, action) => {
        state.note = action.payload.note;
        state.loading = false;
      })
      .addCase(fetchSingleNote.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch note";
      })
      .addCase(fetchDocOverviewAndQuestions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocOverviewAndQuestions.fulfilled, (state, action) => {
        state.aiResult = action.payload;
        state.loading = false;
      })
      .addCase(fetchDocOverviewAndQuestions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch doc overview";
      });
  },
});

export const {
  addExtraWidth,
  attribNoteVal,
  toggleLeftPanel,
  toggleRightPanel,
  reduceExtraWidth,
  togglePaymentModal,
} = chatSlice.actions;

export default chatSlice.reducer;