import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { makeHttpReq } from '@/helper/makeHttpReq';
import { showError } from '@/util/toast-notification';

interface FlashcardItem {
  _id: string;
  front: string;
  back: string;
}

interface FlashcardSet {
  _id: string;
  title: string;
  cards: FlashcardItem[];
}

interface FlashcardState {
  activeFlashcardSet: FlashcardSet | null;
  history: FlashcardSet[];
  loading: boolean;
  generating: boolean;
}

const initialState: FlashcardState = {
  activeFlashcardSet: null,
  history: [],
  loading: false,
  generating: false,
};

export const generateFlashcardAction = createAsyncThunk(
  'flashcard/generate',
  async ({ noteId, docIds, count }: any) => {
    try {
      const res = await makeHttpReq(
        'POST',
        '/api/v1/notes/flashcards/generate',
        { noteId, docIds, count }
      ) as any;
      return res.flashcards;
    } catch (error: any) {
      showError(error.message || "Failed to generate flashcards");
      throw error;
    }
  }
);

export const fetchFlashcardHistoryAction = createAsyncThunk(
  'flashcard/history',
  async (noteId: string) => {
    try {
      const res = await makeHttpReq(
        'GET',
        `/api/v1/notes/flashcards?noteId=${noteId}`
      ) as any;
      return res.flashcards;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);

const flashcardSlice = createSlice({
  name: 'flashcard',
  initialState,
  reducers: {
    setActiveFlashcardSet: (state, action: PayloadAction<FlashcardSet | null>) => {
      state.activeFlashcardSet = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateFlashcardAction.pending, (state) => {
        state.generating = true;
      })
      .addCase(generateFlashcardAction.fulfilled, (state, action) => {
        state.generating = false;
        state.activeFlashcardSet = action.payload;
        state.history.unshift(action.payload);
      })
      .addCase(generateFlashcardAction.rejected, (state) => {
        state.generating = false;
      })
      .addCase(fetchFlashcardHistoryAction.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchFlashcardHistoryAction.fulfilled, (state, action) => {
        state.loading = false;
        state.history = action.payload;
      })
      .addCase(fetchFlashcardHistoryAction.rejected, (state) => {
        state.loading = false;
      });
  }
});

export const { setActiveFlashcardSet } = flashcardSlice.actions;
export default flashcardSlice.reducer;
