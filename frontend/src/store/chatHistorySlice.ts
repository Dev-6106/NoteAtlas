import { getNoteChats, getConversationsApi, type chatHistoryType } from '@/api/notes';
import { createSlice, configureStore, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'



export const fetchChats = createAsyncThunk(
  "chats/history",
  async ({userId,noteId,conversationId}:{userId:string,noteId:string,conversationId?:string}) => getNoteChats(userId,noteId,conversationId)
);

export const fetchConversations = createAsyncThunk(
  "chats/conversations",
  async (noteId: string) => {
    const data = await getConversationsApi(noteId);
    return data as { conversations: any[] };
  }
);

type ChatState = {
  chatHistory: chatHistoryType | null|undefined;
  conversations: any[];
  activeConversationId: string | null;
  isNewChatDraft: boolean;
  loading: boolean;
  error: string | null;
};


const chatState :ChatState= {
  chatHistory: null,
  conversations: [],
  activeConversationId: null,
  isNewChatDraft: false,
  loading: false,
  error: null,
};


const chatHistorySlice = createSlice({
  name: 'chatHistory',
  initialState: {
 
    ...chatState
  },
  reducers: {
    setActiveConversation: (state, action: PayloadAction<string | null>) => {
      state.activeConversationId = action.payload;
      if (action.payload !== null) {
        state.isNewChatDraft = false;
      }
      // Clear history when switching conversations before fetching
      state.chatHistory = null;
    },
    setIsNewChatDraft: (state, action: PayloadAction<boolean>) => {
      state.isNewChatDraft = action.payload;
      if (action.payload) {
        state.activeConversationId = null;
        state.chatHistory = null;
      }
    },


    addMessageInChatHistory: (state, action) => {
      if (state.chatHistory) {
        state.chatHistory.chatHistory = [
          ...(state.chatHistory.chatHistory ?? []),
          action.payload,
        ];
      } else {
        // Initialize if chatHistory hasn't loaded yet
        state.chatHistory = { chatHistory: [action.payload] };
      }
    },


  },
  extraReducers: (builder) => {
    builder .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action: PayloadAction<chatHistoryType | undefined>) => {
        state.chatHistory = action.payload;
        state.loading = false;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch notes";
      })
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchConversations.fulfilled, (state, action: PayloadAction<{ conversations: any[] }>) => {
        state.conversations = action.payload?.conversations || [];
        state.loading = false;
        
        // Auto-select the first conversation if none is active AND we are not drafting a new chat
        if (!state.activeConversationId && !state.isNewChatDraft && state.conversations.length > 0) {
            state.activeConversationId = state.conversations[0]._id;
        }
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch conversations";
      });
      
  },
})

export const { addMessageInChatHistory, setActiveConversation, setIsNewChatDraft} = chatHistorySlice.actions



export default chatHistorySlice.reducer