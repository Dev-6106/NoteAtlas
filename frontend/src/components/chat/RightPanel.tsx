import {
  PanelRight,
  Sparkles,
  GitBranch,
  FileText,
  Music2,
  NotebookTabs,
  HelpCircle,
  BookOpen,
  FileSignature,
  Loader2,
} from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import {
  addExtraWidth,
  reduceExtraWidth,
  toggleRightPanel,
} from "@/store/chatSlice";
import "./animate.css";

import {
  createBriefingDoc,
  createFAQ,
  createMindMap,
  createStudyGuide,
  createSummary,
} from "@/api/notes";
import type { AppDispatch, RootState } from "@/store";
import { showError } from "@/util/toast-notification";
import { useState } from "react";
import {
  fetchNoteSourceResult,
  showSourceModalContent,
} from "@/store/rightPanelSlice";
import { truncateTitle } from "@/util/truncateTitle";
import { SourceModal } from "../note/rightpanel/SourceModal";
import MindMapSourceModal from "../note/rightpanel/MindMapSourceModal";
import AudioSection from "./AudioSection";
import { apiUrl } from "@/config/get-env";

/* ═══════════════════════════════════════
   Right Panel — Studio
   ═══════════════════════════════════════ */
const RightPanel = ({ noteId }: { noteId?: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rightPanelOpen } = useSelector((state: RootState) => state.chat);
  const { docIds, sources } = useSelector(
    (state: RootState) => state.rightPanel
  );
  const audioCard = (useSelector((state: RootState) => state.rightPanel) as any)?.audioCard;

  /* ── local loading states ── */
  const [audioLoading, setAudioLoading] = useState(false);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [studyGuideLoading, setStudyGuideLoading] = useState(false);
  const [briefingDocLoading, setBriefingDocLoading] = useState(false);

  function showSourceModal(source: any) {
    dispatch(showSourceModalContent(source));
  }

  function fetchSources() {
    dispatch(fetchNoteSourceResult(noteId));
  }

  function togglePanel() {
    if (rightPanelOpen) {
      dispatch(addExtraWidth());
      dispatch(toggleRightPanel());
    } else {
      dispatch(reduceExtraWidth());
      dispatch(toggleRightPanel());
    }
  }

  /* ── Generators ── */
  function requireDocs() {
    if (docIds.length === 0) {
      showError("Please select a source");
      return false;
    }
    return true;
  }

  async function generateAudio() {
    if (!requireDocs()) return;
    try {
      setAudioLoading(true);
      await createBriefingDoc(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate audio");
    } finally {
      setAudioLoading(false);
    }
  }

  async function generateMindMap() {
    if (!requireDocs()) return;
    try {
      setMindMapLoading(true);
      await createMindMap(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate mind map");
    } finally {
      setMindMapLoading(false);
    }
  }

  async function generateSummary() {
    if (!requireDocs()) return;
    try {
      setSummaryLoading(true);
      await createSummary(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate summary");
    } finally {
      setSummaryLoading(false);
    }
  }

  async function generateFAQ() {
    if (!requireDocs()) return;
    try {
      setFaqLoading(true);
      await createFAQ(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate FAQ");
    } finally {
      setFaqLoading(false);
    }
  }

  async function generateStudyGuide() {
    if (!requireDocs()) return;
    try {
      setStudyGuideLoading(true);
      await createStudyGuide(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate study guide");
    } finally {
      setStudyGuideLoading(false);
    }
  }

  async function generateBriefingDoc() {
    if (!requireDocs()) return;
    try {
      setBriefingDocLoading(true);
      await createBriefingDoc(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate briefing doc");
    } finally {
      setBriefingDocLoading(false);
    }
  }

  /* ── Action items config ── */
  const studioActions = [
    {
      key: "audio",
      label: "Audio Overview",
      icon: <Sparkles size={18} />,
      color: "#4ade80",
      bgLight: "rgba(74, 222, 128, 0.08)",
      bgHover: "rgba(74, 222, 128, 0.16)",
      loading: audioLoading,
      onClick: generateAudio,
    },
    {
      key: "mindmap",
      label: "Mind Map",
      icon: <GitBranch size={18} />,
      color: "#f59e0b",
      bgLight: "rgba(245, 158, 11, 0.08)",
      bgHover: "rgba(245, 158, 11, 0.16)",
      loading: mindMapLoading,
      onClick: generateMindMap,
    },
    {
      key: "summary",
      label: "Summary",
      icon: <NotebookTabs size={18} />,
      color: "#818cf8",
      bgLight: "rgba(129, 140, 248, 0.08)",
      bgHover: "rgba(129, 140, 248, 0.16)",
      loading: summaryLoading,
      onClick: generateSummary,
    },
    {
      key: "faq",
      label: "FAQ",
      icon: <HelpCircle size={18} />,
      color: "#f472b6",
      bgLight: "rgba(244, 114, 182, 0.08)",
      bgHover: "rgba(244, 114, 182, 0.16)",
      loading: faqLoading,
      onClick: generateFAQ,
    },
    {
      key: "study-guide",
      label: "Study Guide",
      icon: <BookOpen size={18} />,
      color: "#38bdf8",
      bgLight: "rgba(56, 189, 248, 0.08)",
      bgHover: "rgba(56, 189, 248, 0.16)",
      loading: studyGuideLoading,
      onClick: generateStudyGuide,
    },
    {
      key: "briefing-doc",
      label: "Briefing Doc",
      icon: <FileSignature size={18} />,
      color: "#a78bfa",
      bgLight: "rgba(167, 139, 250, 0.08)",
      bgHover: "rgba(167, 139, 250, 0.16)",
      loading: briefingDocLoading,
      onClick: generateBriefingDoc,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: rightPanelOpen ? "100%" : 56,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      <SourceModal />
      <MindMapSourceModal />

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: rightPanelOpen ? "space-between" : "center",
          padding: rightPanelOpen ? "16px 18px 12px" : "16px 8px 12px",
          flexShrink: 0,
        }}
      >
        {rightPanelOpen && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-2)",
            }}
          >
            Studio
          </span>
        )}
        <button
          onClick={togglePanel}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--primary-glow)";
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.color = "var(--primary-brand)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <PanelRight size={16} />
        </button>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: 1,
          background: "var(--border-default)",
          margin: "0 16px",
          flexShrink: 0,
        }}
      />

      {/* ── Action Buttons Grid ── */}
      <div
        className="studio-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: rightPanelOpen ? "16px" : "12px 6px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: rightPanelOpen ? "1fr 1fr" : "1fr",
            gap: rightPanelOpen ? 10 : 8,
          }}
        >
          {studioActions.map((action) => (
            <StudioActionButton
              key={action.key}
              action={action}
              expanded={rightPanelOpen}
            />
          ))}
        </div>

        {/* ── Audio Player ── */}
        {rightPanelOpen && audioCard?.show && (
          <div style={{ marginTop: 16 }}>
            <AudioSection
              audioUrl={`${apiUrl}/api/v1/notes/read/audios/${audioCard?.content}`}
              title={audioCard?.title}
            />
          </div>
        )}

        {/* ── Generated Sources List ── */}
        {rightPanelOpen && (
          <div style={{ marginTop: 20 }}>
            {sources?.length > 0 ? (
              <>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--text-3)",
                    marginBottom: 10,
                  }}
                >
                  Generated
                </p>
                <div
                  className="studio-scroll"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    maxHeight: audioCard?.show ? 200 : 320,
                    overflowY: "auto",
                    paddingBottom: 20,
                  }}
                >
                  {Array.isArray(sources) &&
                    sources.map((source: any) => (
                      <button
                        key={source._id}
                        onClick={() => showSourceModal(source)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: "1px solid transparent",
                          background: "transparent",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          textAlign: "left",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--bg-card-hover)";
                          e.currentTarget.style.borderColor =
                            "var(--border-default)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                      >
                        <SourceIcon type={source?.source_type} />
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                            flex: 1,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 500,
                              color: "var(--text-1)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {truncateTitle(source?.title, 30) || "No title"}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-3)",
                              marginTop: 1,
                            }}
                          >
                            {source?.source_type} · {source?.total_source}{" "}
                            sources
                          </span>
                        </div>
                      </button>
                    ))}
                </div>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px 16px",
                  textAlign: "center",
                }}
              >
                <FileText
                  size={40}
                  style={{ color: "var(--text-3)", opacity: 0.5 }}
                />
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-3)",
                    marginTop: 12,
                    lineHeight: 1.5,
                  }}
                >
                  Select sources and generate content
                  <br />
                  using the buttons above.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Collapsed view — show icon-only source list */}
        {!rightPanelOpen && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
            }}
          >
            {Array.isArray(sources) &&
              sources.slice(0, 6).map((source: any) => (
                <button
                  key={source._id}
                  onClick={() => showSourceModal(source)}
                  title={source?.title}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    border: "1px solid var(--border-default)",
                    background: "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    color: "var(--text-3)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--primary-glow)";
                    e.currentTarget.style.borderColor = "var(--border-accent)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor =
                      "var(--border-default)";
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

/* ═══════════════════════════════════════
   Studio Action Button
   ═══════════════════════════════════════ */
type ActionConfig = {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgLight: string;
  bgHover: string;
  loading: boolean;
  onClick: () => void;
};

const StudioActionButton = ({
  action,
  expanded,
}: {
  action: ActionConfig;
  expanded: boolean;
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={!action.loading ? action.onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={action.loading ? "animated-gradient-border" : ""}
      style={{
        display: "flex",
        alignItems: expanded ? "center" : "center",
        justifyContent: expanded ? "flex-start" : "center",
        flexDirection: expanded ? "row" : "column",
        gap: expanded ? 10 : 4,
        padding: expanded ? "12px 14px" : "10px 4px",
        borderRadius: 12,
        border: `1px solid ${hovered ? `${action.color}33` : "var(--border-default)"}`,
        background: hovered ? action.bgHover : action.bgLight,
        cursor: action.loading ? "not-allowed" : "pointer",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: action.loading ? 0.7 : 1,
        minHeight: expanded ? 48 : 50,
        width: "100%",
        color: action.color,
        transform: hovered && !action.loading ? "translateY(-1px)" : "none",
        boxShadow: hovered && !action.loading
          ? `0 4px 12px ${action.color}15`
          : "none",
      }}
    >
      {action.loading ? (
        <Loader2 size={18} className="spin" style={{ color: action.color }} />
      ) : (
        <span style={{ display: "flex", flexShrink: 0 }}>{action.icon}</span>
      )}

      {expanded && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "var(--text-1)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {action.loading ? "Generating…" : action.label}
        </span>
      )}
    </button>
  );
};

/* ═══════════════════════════════════════
   Source Icon
   ═══════════════════════════════════════ */
function SourceIcon({ type = "" }: { type?: string }) {
  const n = type.toLowerCase();

  if (n.includes("audio"))
    return <Music2 size={16} style={{ color: "#4ade80" }} />;
  if (n.includes("mindmap"))
    return <GitBranch size={16} style={{ color: "#f59e0b" }} />;
  if (n.includes("summary"))
    return <NotebookTabs size={16} style={{ color: "#818cf8" }} />;
  if (n.includes("faq"))
    return <HelpCircle size={16} style={{ color: "#f472b6" }} />;
  if (n.includes("study"))
    return <BookOpen size={16} style={{ color: "#38bdf8" }} />;
  if (n.includes("briefing"))
    return <FileSignature size={16} style={{ color: "#a78bfa" }} />;

  return <FileText size={16} style={{ color: "#818cf8" }} />;
}

export default RightPanel;