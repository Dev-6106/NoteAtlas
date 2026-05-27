import { getSourceResults } from "@/api/notes";
import type { SourceResultType } from "@/types/note-types";
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";

export const fetchNoteSourceResult = createAsyncThunk(
  "rightPanel/fetchSourceResults",
  async (noteId: string) => getSourceResults(noteId)
);

interface SourceModalState {
  modal: boolean;
  title: string;
  content: string;
  source_type: string;
}

interface AudioCardState {
  show: boolean;
  content: string;
  title: string;
}

interface MindMapModalState {
  modal: boolean;
  content: string;
  title: string;
}

interface RightPanelState {
  sources: SourceResultType[];
  loading: boolean;
  error: string | null;
  docIds: string[];
  sourceModal: SourceModalState;
  audioCard: AudioCardState;
  mindMapModal: MindMapModalState;
}

const initialState: RightPanelState = {
  sources: [],
  loading: false,
  error: null,
  docIds: [],
  sourceModal: { modal: false, title: "", content: "", source_type: "" },
  audioCard: { show: false, content: "", title: "" },
  mindMapModal: { modal: false, content: "", title: "" },
};

const rightPanelSlice = createSlice({
  name: "rightPanel",
  initialState,
  reducers: {
    setDocIds: (state, action: PayloadAction<string[]>) => {
      state.docIds = action.payload;
    },
    addDocIds: (state, action: PayloadAction<string>) => {
      if (!state.docIds.includes(action.payload)) {
        state.docIds.push(action.payload);
      }
    },
    removeDocId: (state, action: PayloadAction<string>) => {
      state.docIds = state.docIds.filter((id) => id !== action.payload);
    },
    showSourceModalContent: (state, action: PayloadAction<SourceResultType>) => {
      const { title, content, source_type } = action.payload;

      if (source_type?.toLowerCase().includes("mindmap")) {
        state.mindMapModal = {
          modal: true,
          title: title,
          content: content,
        };
      } else {
        state.sourceModal = {
          modal: true,
          title: title,
          content: content,
          source_type: source_type,
        };
      }
    },
    closeSourceModal: (state) => {
      state.sourceModal.modal = false;
    },
    closeMindMap: (state) => {
      state.mindMapModal.modal = false;
    },
    showAudioCard: (
      state,
      action: PayloadAction<{ content: string; title: string }>
    ) => {
      state.audioCard = {
        show: true,
        content: action.payload.content,
        title: action.payload.title,
      };
    },
    closeAudioCard: (state) => {
      state.audioCard.show = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNoteSourceResult.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNoteSourceResult.fulfilled, (state, action) => {
        state.loading = false;
        state.sources = action.payload as SourceResultType[];

        const audioSource = (action.payload as SourceResultType[])?.find(
          (s) =>
            s.source_type === "audio_briefing" || s.source_type === "audio"
        );
        if (audioSource) {
          state.audioCard = {
            show: true,
            content: audioSource.content,
            title: audioSource.title,
          };
        }
      })
      .addCase(fetchNoteSourceResult.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? "Failed to fetch sources";
      });
  },
});

export const {
  setDocIds,
  addDocIds,
  removeDocId,
  showSourceModalContent,
  closeSourceModal,
  closeMindMap,
  showAudioCard,
  closeAudioCard,
} = rightPanelSlice.actions;

export default rightPanelSlice.reducer;
