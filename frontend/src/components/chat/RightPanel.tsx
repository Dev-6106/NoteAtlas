import { PanelRight, GitBranch, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addExtraWidth, reduceExtraWidth, toggleRightPanel } from "@/store/chatSlice";
import './animate.css';

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { createBriefingDoc, createFAQ, createMindMap, createStudyGuide, createSummary, createAudioOverview } from "@/api/notes";
import type { AppDispatch, RootState } from "@/store";
import { showError } from "@/util/toast-notification";
import { useState } from "react";
import { fetchNoteSourceResult, showSourceModalContent } from "@/store/rightPanelSlice";
import { truncateTitle } from "@/util/truncateTitle";
import { SourceModal } from "../note/rightpanel/SourceModal";
import MindMapSourceModal from "../note/rightpanel/MindMapSourceModal";

// ─── Shared style constants ────────────────────────────────────────────────────

const PANEL_ITEM_BASE: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 14,
  cursor: "pointer",
  transition: "all 0.2s",
  userSelect: "none",
};

// ─── RightPanel ────────────────────────────────────────────────────────────────

const RightPanel = ({ noteId }: { noteId?: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rightPanelOpen } = useSelector((state: RootState) => state.chat);
  const { docIds, sources, sourceModal } = useSelector((state: RootState) => state.rightPanel);

  function showSourceModal(source: any) {
    dispatch(showSourceModalContent(source));
  }

  function fetchSources() {
    dispatch(fetchNoteSourceResult(noteId));
  }

  function togglePanel() {
    if (rightPanelOpen) {
      dispatch(addExtraWidth());
    } else {
      dispatch(reduceExtraWidth());
    }
    dispatch(toggleRightPanel());
  }

  const [mindMapLoading, setMindMapLoading] = useState(false);

  async function generateMindMap() {
    if (docIds.length === 0) {
      showError("Please select a source");
      return;
    }
    try {
      setMindMapLoading(true);
      await createMindMap(noteId, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate mind map");
    } finally {
      setMindMapLoading(false);
    }
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: rightPanelOpen ? 16 : 8,
        width: rightPanelOpen ? "25%" : 64,
        transition: "all 0.3s ease",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        minWidth: rightPanelOpen ? 200 : 64,
      }}
    >
      <SourceModal />
      <MindMapSourceModal />

      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: rightPanelOpen ? "space-between" : "center",
        alignItems: "center",
        marginBottom: 8,
        minHeight: 32,
      }}>
        {rightPanelOpen && (
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.2px", margin: 0 }}>
            Studio
          </p>
        )}
        <button
          onClick={togglePanel}
          style={{
            width: 32, height: 32, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748b", cursor: "pointer",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = "rgba(99,102,241,0.12)";
            e.currentTarget.style.borderColor = "rgba(99,102,241,0.35)";
            e.currentTarget.style.color = "#a5b4fc";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "rgba(255,255,255,0.05)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <PanelRight size={16} />
        </button>
      </div>

      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />

      {/* Action buttons */}
      <div style={{
        display: "grid",
        gridTemplateColumns: rightPanelOpen ? "1fr 1fr" : "1fr",
        gap: rightPanelOpen ? 12 : 10,
        marginTop: 4,
      }}>
        <PanelItem
          generateSource={generateMindMap}
          loading={mindMapLoading}
          rightPanelOpen={rightPanelOpen}
          icon={<GitBranch size={20} style={{ color: "#f59e0b" }} />}
          label="Mind Map"
          accentColor="rgba(245,158,11,0.12)"
          accentBorder="rgba(245,158,11,0.25)"
        />
        <ReportPanelItem
          rightPanelOpen={rightPanelOpen}
          fetchSources={fetchSources}
          noteId={noteId}
          docIds={docIds}
        />
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />

      {/* Sources list */}
      <div
        className="right-panel-scroll"
        style={{ flex: 1, overflowY: "auto", paddingRight: 4 }}
      >
        <style>{`
          .right-panel-scroll::-webkit-scrollbar { width: 5px; }
          .right-panel-scroll::-webkit-scrollbar-track { background: transparent; }
          .right-panel-scroll::-webkit-scrollbar-thumb { background: #312e81; border-radius: 4px; }
          @keyframes spin { to { transform: rotate(360deg); } }
          .panel-source-row:hover { background: rgba(99,102,241,0.08) !important; }
          .panel-source-icon-btn:hover { background: rgba(99,102,241,0.15) !important; border-color: rgba(99,102,241,0.3) !important; }
        `}</style>

        {rightPanelOpen ? (
          sources?.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 40 }}>
              {Array.isArray(sources) && sources.map((source) => (
                <div
                  key={source._id}
                  className="panel-source-row"
                  onClick={() => showSourceModal(source)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 8px", borderRadius: 10,
                    cursor: "pointer", transition: "background 0.15s",
                    background: "transparent",
                  }}
                >
                  <SourceIcon type={source?.source_type} />
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                    <span style={{
                      fontSize: 13, fontWeight: 500, color: "#cbd5e1",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {truncateTitle(source?.title, 35) || "No title"}
                    </span>
                    <span style={{ fontSize: 11, color: "#475569" }}>
                      {source?.source_type} · {source?.total_source} sources
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              marginTop: 40, textAlign: "center",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <FileText size={28} style={{ color: "#818cf8" }} />
              </div>
              <p style={{ fontSize: 13, color: "#475569", fontWeight: 500, margin: 0 }}>
                No sources available
              </p>
            </div>
          )
        ) : (
          <div style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", marginTop: 24, gap: 16,
          }}>
            {Array.isArray(sources) && sources.map((source) => (
              <button
                key={source._id}
                className="panel-source-icon-btn"
                onClick={() => showSourceModal(source)}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#818cf8", cursor: "pointer",
                  transition: "all 0.2s",
                  flexShrink: 0,
                }}
              >
                <SourceIcon type={source?.source_type} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PanelItem ─────────────────────────────────────────────────────────────────

const PanelItem = ({
  icon,
  label,
  rightPanelOpen,
  generateSource,
  loading = false,
  accentColor = "rgba(99,102,241,0.1)",
  accentBorder = "rgba(99,102,241,0.2)",
}: {
  icon: React.ReactNode;
  label: string;
  rightPanelOpen: boolean;
  generateSource: () => void;
  loading?: boolean;
  accentColor?: string;
  accentBorder?: string;
}) => {
  return (
    <div
      onClick={!loading ? generateSource : undefined}
      style={{
        ...PANEL_ITEM_BASE,
        flexDirection: rightPanelOpen ? "column" : "row",
        height: rightPanelOpen ? 88 : 48,
        padding: rightPanelOpen ? 16 : 12,
        background: accentColor,
        border: `1px solid ${accentBorder}`,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading ? 0.65 : 1,
        gap: 0,
      }}
      onMouseEnter={e => {
        if (!loading) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.12)";
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Icon / spinner — fixed size wrapper prevents layout shift */}
      <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {loading ? (
          <span style={{
            width: 20, height: 20,
            border: "2px solid rgba(255,255,255,0.1)",
            borderTopColor: "#818cf8",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
            display: "block",
          }} />
        ) : (
          icon
        )}
      </div>

      {rightPanelOpen && (
        <span style={{
          marginTop: 8,
          fontSize: 12,
          fontWeight: 600,
          color: "#94a3b8",
          letterSpacing: "0.01em",
        }}>
          {loading ? "Generating…" : label}
        </span>
      )}
    </div>
  );
};

// ─── ReportPanelItem ───────────────────────────────────────────────────────────

const REPORT_MENU_ITEMS = ["Summary", "Study Guide", "Briefing Doc", "FAQ", "Audio Overview"] as const;

const ReportPanelItem = ({
  rightPanelOpen,
  noteId,
  docIds,
  fetchSources,
}: {
  rightPanelOpen: boolean;
  noteId: string;
  docIds: string[];
  fetchSources: () => void;
}) => {
  const [loading, setLoading] = useState(false);

  async function generateSource(item: typeof REPORT_MENU_ITEMS[number]) {
    if (docIds.length === 0) {
      showError("Please select a source");
      return;
    }
    try {
      setLoading(true);
      if (item === "Summary")      await createSummary(noteId, docIds);
      else if (item === "FAQ")      await createFAQ(noteId, docIds);
      else if (item === "Study Guide") await createStudyGuide(noteId, docIds);
      else if (item === "Briefing Doc") await createBriefingDoc(noteId, docIds, "briefing-doc");
      else if (item === "Audio Overview") await createAudioOverview(noteId, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate report");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Outer div is the visual tile — same sizing contract as PanelItem */}
        <div
          style={{
            ...PANEL_ITEM_BASE,
            flexDirection: rightPanelOpen ? "column" : "row",
            height: rightPanelOpen ? 88 : 48,
            padding: rightPanelOpen ? 16 : 12,
            background: "rgba(59,130,246,0.1)",
            border: `1px solid ${loading ? "rgba(59,130,246,0.5)" : "rgba(59,130,246,0.2)"}`,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.65 : 1,
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(99,102,241,0.12)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {/* Fixed-size icon wrapper prevents layout shift during loading */}
          <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {loading ? (
              <span style={{
                width: 20, height: 20,
                border: "2px solid rgba(255,255,255,0.1)",
                borderTopColor: "#60a5fa",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
                display: "block",
              }} />
            ) : (
              <FileText size={20} style={{ color: "#60a5fa" }} />
            )}
          </div>

          {rightPanelOpen && (
            <span style={{
              marginTop: 8,
              fontSize: 12,
              fontWeight: 600,
              color: "#94a3b8",
              letterSpacing: "0.01em",
            }}>
              {loading ? "Generating…" : "Reports"}
            </span>
          )}
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        style={{
          width: 180,
          background: "rgba(10,13,26,0.97)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 12,
          boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 16px 40px rgba(0,0,0,0.6)",
          backdropFilter: "blur(20px)",
          padding: 4,
        }}
      >
        {REPORT_MENU_ITEMS.map((item) => (
          <DropdownMenuItem
            key={item}
            disabled={loading}
            onClick={() => generateSource(item)}
            style={{
              cursor: loading ? "not-allowed" : "pointer",
              color: "#cbd5e1",
              fontSize: 13,
              fontWeight: 500,
              padding: "8px 12px",
              borderRadius: 8,
              transition: "all 0.15s",
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.background = "rgba(99,102,241,0.12)";
                e.currentTarget.style.color = "#e0e7ff";
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#cbd5e1";
            }}
          >
            {item}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ─── SourceIcon ────────────────────────────────────────────────────────────────

function SourceIcon({ type = "" }: { type?: string }) {
  const normalized = type.toLowerCase();
  if (normalized.includes("mindmap")) {
    return <GitBranch size={18} style={{ color: "#f59e0b", flexShrink: 0 }} />;
  }
  if (normalized.includes("audio")) {
    return <FileText size={18} style={{ color: "#ec4899", flexShrink: 0 }} />;
  }
  return <FileText size={18} style={{ color: "#818cf8", flexShrink: 0 }} />;
}

export default RightPanel;