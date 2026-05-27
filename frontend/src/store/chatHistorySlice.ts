import { getNoteChats, type MessageType } from "@/api/notes";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export const fetchChats = createAsyncThunk(
  "chatHistory/fetchChats",
  async ({ userId, noteId }: { userId: string; noteId: string }) =>
    getNoteChats(userId, noteId)
);

interface ChatHistoryState {
  chatHistory: MessageType[];
  loading: boolean;
  error: string | null;
}

const initialState: ChatHistoryState = {
  chatHistory: [],
  loading: false,
  error: null,
};

const chatHistorySlice = createSlice({
  name: "chatHistory",
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<MessageType>) => {
      state.chatHistory.push(action.payload);
    },
    clearChatHistory: (state) => {
      state.chatHistory = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chatHistory = action.payload?.chatHistory ?? [];
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch chats";
      });
  },
});

export const { addMessage, clearChatHistory } = chatHistorySlice.actions;
export default chatHistorySlice.reducer;