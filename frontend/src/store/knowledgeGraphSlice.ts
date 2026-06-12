import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit";
import {
  getKnowledgeGraph as fetchGraphApi,
  getEntityDetail as fetchEntityApi,
  generateKnowledgeGraph as generateGraphApi,
  getGraphStats as fetchStatsApi,
  type GraphNode,
  type GraphLink,
  type EntityDetail,
  type GraphStats,
} from "@/api/knowledgeGraph";

// ─── Types ───────────────────────────────────────────────

interface KnowledgeGraphState {
  nodes: GraphNode[];
  links: GraphLink[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  sourceDocs: { id: string; title: string }[];

  // Entity detail panel
  selectedEntityId: string | null;
  entityDetail: EntityDetail | null;
  entityLoading: boolean;

  // Stats
  stats: GraphStats | null;

  // Filters
  activeFilters: string[]; // entity types to show
  activeDocFilters: string[]; // doc ids to show
  searchQuery: string;
}

const initialState: KnowledgeGraphState = {
  nodes: [],
  links: [],
  loading: false,
  generating: false,
  error: null,
  sourceDocs: [],
  selectedEntityId: null,
  entityDetail: null,
  entityLoading: false,
  stats: null,
  activeFilters: [],
  activeDocFilters: [],
  searchQuery: "",
};

// ─── Async Thunks ────────────────────────────────────────

export const fetchKnowledgeGraph = createAsyncThunk(
  "knowledgeGraph/fetch",
  async (noteId: string) => {
    return await fetchGraphApi(noteId);
  },
);

export const fetchEntityDetail = createAsyncThunk(
  "knowledgeGraph/fetchEntity",
  async ({ noteId, entityId }: { noteId: string; entityId: string }) => {
    return await fetchEntityApi(noteId, entityId);
  },
);

export const generateGraph = createAsyncThunk(
  "knowledgeGraph/generate",
  async ({ noteId, force }: { noteId: string; force?: boolean }) => {
    return await generateGraphApi(noteId, force);
  },
);

export const fetchGraphStats = createAsyncThunk(
  "knowledgeGraph/fetchStats",
  async (noteId: string) => {
    return await fetchStatsApi(noteId);
  },
);

// ─── Slice ───────────────────────────────────────────────

const knowledgeGraphSlice = createSlice({
  name: "knowledgeGraph",
  initialState,
  reducers: {
    selectEntity: (state, action: PayloadAction<string | null>) => {
      state.selectedEntityId = action.payload;
      if (!action.payload) {
        state.entityDetail = null;
      }
    },
    setActiveFilters(state, action: PayloadAction<string[]>) {
      state.activeFilters = action.payload;
    },
    setActiveDocFilters(state, action: PayloadAction<string[]>) {
      state.activeDocFilters = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
    },
    clearGraph: (state) => {
      state.nodes = [];
      state.links = [];
      state.selectedEntityId = null;
      state.entityDetail = null;
      state.stats = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch graph
      .addCase(fetchKnowledgeGraph.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchKnowledgeGraph.fulfilled, (state, action) => {
        state.loading = false;
        state.nodes = action.payload.nodes;
        state.links = action.payload.links;
        if (action.payload.sourceDocs) {
          state.sourceDocs = action.payload.sourceDocs;
        }
      })
      .addCase(fetchKnowledgeGraph.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to load knowledge graph";
      })
      // Fetch entity
      .addCase(fetchEntityDetail.pending, (state) => {
        state.entityLoading = true;
      })
      .addCase(fetchEntityDetail.fulfilled, (state, action) => {
        state.entityLoading = false;
        state.entityDetail = action.payload;
      })
      .addCase(fetchEntityDetail.rejected, (state) => {
        state.entityLoading = false;
      })
      // Generate
      .addCase(generateGraph.pending, (state) => {
        state.generating = true;
      })
      .addCase(generateGraph.fulfilled, (state) => {
        state.generating = false;
      })
      .addCase(generateGraph.rejected, (state) => {
        state.generating = false;
      })
      // Stats
      .addCase(fetchGraphStats.fulfilled, (state, action) => {
        state.stats = action.payload;
      });
  },
});

export const { selectEntity, setActiveFilters, setActiveDocFilters, setSearchQuery, clearGraph } =
  knowledgeGraphSlice.actions;
export default knowledgeGraphSlice.reducer;
