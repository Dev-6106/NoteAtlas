/**
 * KnowledgeGraphPage.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-page knowledge graph exploration view.
 * Combines the force-directed graph, entity detail panel, toolbar,
 * and empty state with premium dark-mode UX.
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, Link } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { MoveLeft, Network, Sparkles, FileText, ArrowRight } from "lucide-react";
import type { AppDispatch, RootState } from "@/store";
import {
  fetchKnowledgeGraph,
  fetchEntityDetail,
  generateGraph,
  fetchGraphStats,
  selectEntity,
  setActiveFilters,
  setActiveDocFilters,
  setSearchQuery,
} from "@/store/knowledgeGraphSlice";
import { showSourceModalContent } from "@/store/rightPanelSlice";
import KnowledgeGraphView from "@/components/knowledge-graph/KnowledgeGraphView";
import EntityDetailPanel from "@/components/knowledge-graph/EntityDetailPanel";
import { SourceModal } from "@/components/note/rightpanel/SourceModal";
import GraphToolbar from "@/components/knowledge-graph/GraphToolbar";
import { getUserData } from "@/helper/getUserData";
import { T } from "@/components/ThemeTokens";

const EMPTY_ARRAY: string[] = [];

export default function KnowledgeGraphPage() {
  const { noteId } = useParams<{ noteId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const userData = getUserData();

  const [isPolling, setIsPolling] = useState(false);

  const {
    nodes,
    links,
    loading,
    generating,
    selectedEntityId,
    entityDetail,
    entityLoading,
    activeFilters,
    activeDocFilters,
    searchQuery,
    sourceDocs,
  } = useSelector((state: RootState) => state.knowledgeGraph);

  // ── Fetch graph data on mount ──
  useEffect(() => {
    if (noteId) {
      dispatch(fetchKnowledgeGraph(noteId));
      dispatch(fetchGraphStats(noteId));
    }
  }, [dispatch, noteId]);

  // ── Handlers ──
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      dispatch(selectEntity(nodeId));
      if (noteId) {
        dispatch(fetchEntityDetail({ noteId, entityId: nodeId }));
      }
    },
    [dispatch, noteId],
  );

  const handleBackgroundClick = useCallback(() => {
    dispatch(selectEntity(null));
  }, [dispatch]);

  const handleGenerate = useCallback(
    (force: boolean) => {
      if (noteId) {
        setIsPolling(true);
        dispatch(generateGraph({ noteId, force })).then(() => {
          // Poll for graph updates since backend processes async
          let attempts = 0;
          const maxAttempts = 60; // Poll for up to 2 minutes
          const intervalId = setInterval(() => {
            attempts++;
            dispatch(fetchKnowledgeGraph(noteId)).then((res: any) => {
              if (res.payload?.nodes?.length > 0 || attempts >= maxAttempts) {
                clearInterval(intervalId);
                setIsPolling(false);
                dispatch(fetchGraphStats(noteId));
              }
            });
          }, 2000);
        });
      }
    },
    [dispatch, noteId],
  );

  const handleEntityClickInPanel = useCallback(
    (entityId: string) => {
      dispatch(selectEntity(entityId));
      if (noteId) {
        dispatch(fetchEntityDetail({ noteId, entityId }));
      }
    },
    [dispatch, noteId],
  );

  const handleEvidenceClick = useCallback(
    (sourceDoc: { id: string; title: string; content: string }) => {
      dispatch(showSourceModalContent({
        source_type: "evidence",
        title: sourceDoc.title,
        content: sourceDoc.content,
      }));
    },
    [dispatch],
  );

  const connectedEntityIds = entityDetail?.connectedEntityIds || EMPTY_ARRAY;
  const isGraphLoading = loading || generating || isPolling;
  const isEmpty = nodes.length === 0 && !loading && !isPolling;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 24px)",
        background: "var(--bg-base)",
        fontFamily: "var(--font-sans)",
        overflow: "hidden",
        color: "var(--text-1)",
        borderRadius: 16,
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
      `}</style>

      {/* ── Header ── */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
          height: 52,
          flexShrink: 0,
          background: "var(--bg-elevated)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-default)",
          zIndex: 30,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link
            to={noteId ? `/chats/${noteId}` : "/notes"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 10,
              background: "var(--bg-card)",
              border: "1px solid var(--border-default)",
              textDecoration: "none",
              color: "var(--text-2)",
              fontSize: 13,
              fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            <MoveLeft size={14} />
            Back to Chat
          </Link>

          <div style={{ width: 1, height: 20, background: "var(--border-strong)" }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Network size={18} style={{ color: "var(--primary-brand)" }} />
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)" }}>
              Knowledge Graph
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content ── */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 25,
                background: "var(--glass-bg)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "3px solid var(--border-default)",
                  borderTopColor: "var(--primary-brand)",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }} />
                <p style={{ color: "var(--text-3)", fontSize: 13 }}>
                  Loading knowledge graph...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        <AnimatePresence>
          {isEmpty && !isGraphLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                background: "var(--bg-base)",
              }}
            >
              <div style={{
                textAlign: "center",
                maxWidth: 420,
                padding: 40,
              }}>
                {/* Animated icon */}
                <div style={{
                  width: 80,
                  height: 80,
                  borderRadius: 24,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 24px",
                  animation: "float 3s ease-in-out infinite",
                }}>
                  <Network size={36} style={{ color: "var(--primary-brand)" }} />
                </div>

                <h2 style={{
                  margin: "0 0 8px",
                  fontSize: 22,
                  fontWeight: 700,
                  color: "var(--text-1)",
                }}>
                  Build Your Knowledge Graph
                </h2>

                <p style={{
                  margin: "0 0 28px",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: "var(--text-2)",
                }}>
                  Automatically extract entities, concepts, and relationships from your documents.
                  Explore connections visually.
                </p>

                <button
                  onClick={() => handleGenerate(false)}
                  disabled={isGraphLoading}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "12px 28px",
                    borderRadius: 14,
                    background: "var(--primary-brand)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-on-primary)",
                    fontFamily: "var(--font-sans)",
                    boxShadow: "var(--shadow-primary)",
                    transition: "all 0.2s",
                  }}
                >
                  <Sparkles size={16} />
                  Generate Knowledge Graph
                </button>

                <p style={{
                  margin: "16px 0 0",
                  fontSize: 11,
                  color: "var(--text-4)",
                }}>
                  Requires at least one document with a summary or study guide.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generating overlay */}
        <AnimatePresence>
          {isGraphLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 25,
                background: "var(--glass-bg)",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{
                  width: 48, height: 48, borderRadius: "50%",
                  border: "3px solid var(--border-default)",
                  borderTopColor: "var(--primary-brand)",
                  borderRightColor: "var(--primary-light)",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 20px",
                }} />
                <h3 style={{
                  margin: "0 0 6px",
                  fontSize: 16,
                  fontWeight: 600,
                  color: "var(--text-1)",
                }}>
                  Building Knowledge Graph...
                </h3>
                <p style={{
                  margin: 0,
                  fontSize: 13,
                  color: "var(--text-3)",
                  animation: "pulse 2s ease-in-out infinite",
                }}>
                  Extracting entities and relationships from your documents
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Graph */}
        {nodes.length > 0 && (
          <>
            <KnowledgeGraphView
              nodes={nodes}
              links={links}
              selectedEntityId={selectedEntityId}
              connectedEntityIds={connectedEntityIds}
              searchQuery={searchQuery}
              activeFilters={activeFilters}
              activeDocFilters={activeDocFilters}
              onNodeClick={handleNodeClick}
              onBackgroundClick={handleBackgroundClick}
            />

            <GraphToolbar
              searchQuery={searchQuery}
              onSearchChange={(q) => dispatch(setSearchQuery(q))}
              activeFilters={activeFilters}
              onFilterChange={(f) => dispatch(setActiveFilters(f))}
              activeDocFilters={activeDocFilters}
              onDocFilterChange={(f) => dispatch(setActiveDocFilters(f))}
              sourceDocs={sourceDocs}
              onGenerate={handleGenerate}
              generating={generating}
              nodeCount={nodes.length}
              linkCount={links.length}
            />
          </>
        )}

        {/* Entity detail panel */}
        <EntityDetailPanel
          detail={entityDetail}
          loading={entityLoading}
          onClose={() => dispatch(selectEntity(null))}
          onEntityClick={handleEntityClickInPanel}
          onEvidenceClick={handleEvidenceClick}
        />
      </div>

      <SourceModal />
    </div>
  );
}
