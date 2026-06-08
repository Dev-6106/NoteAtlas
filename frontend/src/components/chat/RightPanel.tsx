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
  ArrowLeft,
  X,
  ExternalLink,
  Download,
  GraduationCap,
  Layers,
  MonitorPlay,
  Play,
  Pause
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
  createAudioOverview,
} from "@/api/notes";
import type { AppDispatch, RootState } from "@/store";
import { showError } from "@/util/toast-notification";
import { useState, useEffect, useRef } from "react";
import { fetchNoteSourceResult, showSourceModalContent, showAudioPlayer, closeAudioPlayer } from "@/store/rightPanelSlice";
import { fetchQuizHistoryAction, setActiveQuiz, submitQuizAction } from "@/store/quizSlice";
import { fetchFlashcardHistoryAction, setActiveFlashcardSet } from "@/store/flashcardSlice";
import { truncateTitle } from "@/util/truncateTitle";
import { SourceModal } from "../note/rightpanel/SourceModal";
import MindMapSourceModal from "../note/rightpanel/MindMapSourceModal";
import { QuizModal } from "../quiz/QuizModal";
import { FlashcardModal } from "../flashcard/FlashcardModal";
import { apiUrl } from "@/config/get-env";
import { getAudioUrl } from "@/api/notes";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const AudioPlayer = ({ storageKey, onClose, title }: { storageKey: string, onClose: () => void, title: string }) => {
  const [url, setUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (storageKey) {
      getAudioUrl(storageKey).then((signedUrl) => {
        setUrl(signedUrl);
      });
    }
  }, [storageKey]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (time: number) => {
    if (!time || isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div style={{ marginTop: 16, background: "linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%)", borderRadius: 16, padding: "16px", border: "1px solid var(--border-default)", position: "relative", boxShadow: "var(--shadow-md)" }}>
      <button
        onClick={onClose}
        style={{ position: "absolute", top: 12, right: 12, background: "transparent", border: "none", cursor: "pointer", color: "var(--text-3)", padding: 4, borderRadius: "50%", transition: "all 0.2s" }}
        onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-1)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
        title="Close Audio Player"
      >
        <X size={16} />
      </button>
      
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)", margin: 0, paddingRight: 24, letterSpacing: "-0.3px" }}>{title}</p>
        
        {url ? (
          <>
            <audio 
              ref={audioRef} 
              src={url} 
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={() => setIsPlaying(false)}
              style={{ display: 'none' }} 
            />
            
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              {/* Play/Pause Button */}
              <button 
                onClick={togglePlay}
                style={{
                  width: 44, height: 44, borderRadius: "50%",
                  background: "linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-light) 100%)",
                  border: "none", display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", color: "var(--text-on-primary)", flexShrink: 0,
                  boxShadow: "var(--shadow-primary)", transition: "transform 0.2s"
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
              >
                {isPlaying ? <Pause size={20} fill="currentColor" color="var(--text-on-primary)" /> : <Play size={20} fill="currentColor" color="var(--text-on-primary)" style={{ marginLeft: 3 }} />}
              </button>
              
              {/* Waveform Visualization */}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 3, height: 28 }}>
                  {Array.from({ length: 30 }).map((_, i) => {
                    const isActive = (progress / duration) > (i / 30);
                    const minH = 4;
                    const maxH = 28;
                    const h = minH + (Math.sin(i * 0.8) * Math.cos(i * 0.3) + 1) * 0.5 * (maxH - minH);
                    
                    return (
                      <div 
                        key={i}
                        style={{
                          flex: 1,
                          height: isPlaying ? h : 4,
                          background: isActive ? "var(--primary-brand)" : "var(--primary-surface)",
                          borderRadius: 2,
                          transition: `height 0.2s ease-in-out, background 0.2s`,
                          animation: isPlaying ? `waveAnim 1.${2 + (i % 5)}s infinite ease-in-out ${i * 0.05}s alternate` : 'none',
                        }}
                      />
                    );
                  })}
                </div>
                
                {/* Time Indicators */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, color: "var(--text-3)", fontWeight: 500, fontFamily: "var(--font-mono)" }}>
                  <span>{formatTime(progress)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
            <style>{`
              @keyframes waveAnim {
                0% { transform: scaleY(0.7); }
                100% { transform: scaleY(1.3); }
              }
            `}</style>
          </>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-3)", padding: "8px 0" }}>
            <Loader2 size={16} className="spin" /> Loading audio stream...
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   Right Panel — Studio
   ═══════════════════════════════════════ */
const RightPanel = ({ noteId }: { noteId?: string }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { rightPanelOpen } = useSelector((state: RootState) => state.chat);
  const { docIds, sources } = useSelector((state: RootState) => state.rightPanel);
  const { history } = useSelector((state: RootState) => state.quiz);
  const flashcardHistory = useSelector((state: RootState) => state.flashcard.history);
  const audioCard = (useSelector((state: RootState) => state.rightPanel) as any)?.audioCard;

  /* ── local loading states ── */
  const [audioLoading, setAudioLoading] = useState(false);
  const [mindMapLoading, setMindMapLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [faqLoading, setFaqLoading] = useState(false);
  const [studyGuideLoading, setStudyGuideLoading] = useState(false);
  const [briefingDocLoading, setBriefingDocLoading] = useState(false);
  const [quizLoading, setQuizLoading] = useState(false);
  const [pptLoading, setPptLoading] = useState(false);
  const [flashcardLoading, setFlashcardLoading] = useState(false);
  const [activeSource, setActiveSource] = useState<any | null>(null);

  function handleViewSource(source: any) {
    if (source.source_type === "audio-overview" || source.source_type === "podcast") {
      dispatch(showAudioPlayer({ title: source.title, content: source.content }));
      if (!rightPanelOpen) {
          dispatch(addExtraWidth());
          dispatch(toggleRightPanel());
      }
    } else if (source.source_type === "ppt") {
      getAudioUrl(source.content).then(url => {
        window.open(url, '_blank');
      });
    } else {
      // Show all other sources in popups
      dispatch(showSourceModalContent(source));
    }
  }

  function fetchSources() {
    dispatch(fetchNoteSourceResult(noteId));
    if (noteId) {
      dispatch(fetchQuizHistoryAction(noteId));
      dispatch(fetchFlashcardHistoryAction(noteId));
    }
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
      await createAudioOverview(noteId!, docIds);
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

  function handleOpenQuizModal() {
    if (!requireDocs()) return;
    dispatch(showSourceModalContent({ source_type: "quiz-generator", content: "" }));
  }

  function handleOpenFlashcardModal() {
    if (!requireDocs()) return;
    dispatch(showSourceModalContent({ source_type: "flashcard-generator", content: "" }));
  }

  async function generatePPT() {
    if (!requireDocs()) return;
    try {
      setPptLoading(true);
      const { createPPT } = await import("@/api/notes");
      await createPPT(noteId!, docIds);
      fetchSources();
    } catch {
      showError("Failed to generate PPT");
    } finally {
      setPptLoading(false);
    }
  }

  function handleViewQuiz(quiz: any) {
    dispatch(setActiveQuiz(quiz));
    // If the user has attempts, we could optionally show the results of the best/latest attempt.
    // For now, we'll just show the latest attempt if it exists.
    if (quiz.attempts && quiz.attempts.length > 0) {
      const latestAttempt = quiz.attempts[0];
      dispatch(submitQuizAction.fulfilled(latestAttempt, '', null));
    }
    dispatch(showSourceModalContent({ source_type: "quiz-player", content: "" }));
  }

  function handleViewFlashcards(flashcardSet: any) {
    dispatch(setActiveFlashcardSet(flashcardSet));
    dispatch(showSourceModalContent({ source_type: "flashcard-player", content: "" }));
  }

  /* ── Action items config ── */
  const studioActions = [
    {
      key: "audio",
      label: "Audio Overview",
      icon: <Sparkles size={18} />,
      color: "var(--color-success)",
      bgLight: "var(--color-success-light)",
      bgHover: "var(--color-success-border)",
      loading: audioLoading,
      onClick: generateAudio,
    },
    {
      key: "mindmap",
      label: "Mind Map",
      icon: <GitBranch size={18} />,
      color: "var(--color-warning)",
      bgLight: "var(--color-warning-light)",
      bgHover: "var(--color-warning-border)",
      loading: mindMapLoading,
      onClick: generateMindMap,
    },
    {
      key: "summary",
      label: "Summary",
      icon: <NotebookTabs size={18} />,
      color: "var(--color-info)",
      bgLight: "var(--color-info-light)",
      bgHover: "var(--color-info-border)",
      loading: summaryLoading,
      onClick: generateSummary,
    },
    {
      key: "faq",
      label: "FAQ",
      icon: <HelpCircle size={18} />,
      color: "#ec4899", // pink
      bgLight: "rgba(236, 72, 153, 0.12)",
      bgHover: "rgba(236, 72, 153, 0.25)",
      loading: faqLoading,
      onClick: generateFAQ,
    },
    {
      key: "study-guide",
      label: "Study Guide",
      icon: <BookOpen size={18} />,
      color: "#0ea5e9", // sky blue
      bgLight: "rgba(14, 165, 233, 0.12)",
      bgHover: "rgba(14, 165, 233, 0.25)",
      loading: studyGuideLoading,
      onClick: generateStudyGuide,
    },
    {
      key: "briefing-doc",
      label: "Briefing Doc",
      icon: <FileSignature size={18} />,
      color: "var(--primary-brand)",
      bgLight: "var(--primary-mid)",
      bgHover: "var(--primary-border)",
      loading: briefingDocLoading,
      onClick: generateBriefingDoc,
    },
    {
      key: "quiz",
      label: "AI Quiz",
      icon: <GraduationCap size={18} />,
      color: "#8b5cf6", // purple
      bgLight: "rgba(139, 92, 246, 0.12)",
      bgHover: "rgba(139, 92, 246, 0.25)",
      loading: quizLoading,
      onClick: handleOpenQuizModal,
    },
    {
      key: "flashcards",
      label: "Flashcards",
      icon: <Layers size={18} />,
      color: "#f59e0b", // amber
      bgLight: "rgba(245, 158, 11, 0.12)",
      bgHover: "rgba(245, 158, 11, 0.25)",
      loading: flashcardLoading,
      onClick: handleOpenFlashcardModal,
    },
    {
      key: "ppt",
      label: "Presentation",
      icon: <MonitorPlay size={18} />,
      color: "#ef4444", // red
      bgLight: "rgba(239, 68, 68, 0.12)",
      bgHover: "rgba(239, 68, 68, 0.25)",
      loading: pptLoading,
      onClick: generatePPT,
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
      <QuizModal noteId={noteId} />
      <FlashcardModal noteId={noteId} />

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
            {activeSource ? "Document Review" : "Studio"}
          </span>
        )}
        
        <div style={{ display: "flex", gap: 8 }}>
          {activeSource && rightPanelOpen && (
            <button
              onClick={() => setActiveSource(null)}
              style={{
                width: 32, height: 32, borderRadius: 8,
                border: "1px solid var(--border-default)", background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-3)",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-1)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-3)"; }}
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <button
            className="hide-on-mobile"
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
          display: "flex", flexDirection: "column",
        }}
      >
        {activeSource && rightPanelOpen ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, animation: "fadeIn 0.2s" }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>
              {activeSource.title}
            </h2>
            <div style={{
               background: "var(--bg-card)", borderRadius: 12, padding: 16, border: "1px solid var(--border-default)",
               color: "var(--text-2)", fontSize: 14, lineHeight: 1.6
            }}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({node, ...props}) => <h1 style={{fontSize: 20, fontWeight: 700, margin: "16px 0 8px", color: "var(--text-1)"}} {...props} />,
                  h2: ({node, ...props}) => <h2 style={{fontSize: 16, fontWeight: 600, margin: "12px 0 6px", color: "var(--text-1)"}} {...props} />,
                  ul: ({node, ...props}) => <ul style={{listStyle: "disc", paddingLeft: 20, margin: "8px 0"}} {...props} />,
                  li: ({node, ...props}) => <li style={{marginBottom: 4}} {...props} />,
                  pre: ({node, ...props}) => <pre style={{padding: 12, background: "var(--bg-elevated)", borderRadius: 8, overflowX: "auto", margin: "8px 0", fontSize: 13}} {...props} />,
                  code: ({node, ...props}) => <code style={{fontFamily: "var(--font-mono)", fontSize: 13}} {...props} />
                }}
              >
                {activeSource.content}
              </ReactMarkdown>
            </div>
            <Button variant="outline" style={{ marginTop: 8 }} onClick={() => setActiveSource(null)}>
              Back to Studio
            </Button>
          </div>
        ) : (
          <>
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
          <AudioPlayer 
            storageKey={audioCard?.content} 
            title={audioCard?.title || "Audio Overview"}
            onClose={() => dispatch(closeAudioPlayer())} 
          />
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
                        onClick={() => handleViewSource(source)}
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
                  
                  {Array.isArray(history) && history.map((quiz: any) => {
                    const attempts = quiz.attempts || [];
                    const bestScore = attempts.length > 0 ? Math.max(...attempts.map((a: any) => a.score)) : 0;
                    
                    return (
                      <button
                        key={quiz._id}
                        onClick={() => handleViewQuiz(quiz)}
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
                          e.currentTarget.style.background = "var(--bg-card-hover)";
                          e.currentTarget.style.borderColor = "var(--border-default)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                        }}
                      >
                        <GraduationCap size={16} style={{ color: "#8b5cf6" }} />
                        <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {truncateTitle(quiz.title, 30) || "AI Quiz"}
                          </span>
                          <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                            {quiz.questions?.length} Questions · {attempts.length > 0 ? `Best: ${bestScore}/${quiz.questions?.length}` : 'Not attempted'}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {Array.isArray(flashcardHistory) && flashcardHistory.map((flashcardSet: any) => (
                    <button
                      key={flashcardSet._id}
                      onClick={() => handleViewFlashcards(flashcardSet)}
                      style={{
                        display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10,
                        border: "1px solid transparent", background: "transparent", cursor: "pointer",
                        transition: "all 0.2s", textAlign: "left", width: "100%",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; }}
                    >
                      <Layers size={16} style={{ color: "#f59e0b" }} />
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {truncateTitle(flashcardSet.title, 30) || "AI Flashcards"}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--text-3)", marginTop: 1 }}>
                          {flashcardSet.cards?.length} Cards
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
        </>
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
                  onClick={() => handleViewSource(source)}
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
              
            {Array.isArray(history) && history.slice(0, 3).map((quiz: any) => (
               <button
                 key={quiz._id}
                 onClick={() => handleViewQuiz(quiz)}
                 title={quiz.title}
                 style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", color: "var(--text-3)" }}
                 onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-glow)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                 onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
               >
                 <GraduationCap size={16} style={{ color: "#8b5cf6" }} />
               </button>
            ))}

            {Array.isArray(flashcardHistory) && flashcardHistory.slice(0, 3).map((flashcardSet: any) => (
               <button
                 key={flashcardSet._id}
                 onClick={() => handleViewFlashcards(flashcardSet)}
                 title={flashcardSet.title}
                 style={{ width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.2s", color: "var(--text-3)" }}
                 onMouseEnter={(e) => { e.currentTarget.style.background = "var(--primary-glow)"; e.currentTarget.style.borderColor = "var(--border-accent)"; }}
                 onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "var(--border-default)"; }}
               >
                 <Layers size={16} style={{ color: "#f59e0b" }} />
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
        border: `1px solid ${hovered ? `var(--border-accent)` : "var(--border-default)"}`,
        background: hovered ? action.bgHover : action.bgLight,
        cursor: action.loading ? "not-allowed" : "pointer",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: action.loading ? 0.7 : 1,
        minHeight: expanded ? 48 : 50,
        width: "100%",
        color: action.color,
        transform: hovered && !action.loading ? "translateY(-1px)" : "none",
        boxShadow: hovered && !action.loading
          ? "var(--shadow-sm)"
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
    return <Music2 size={16} style={{ color: "var(--color-success)" }} />;
  if (n.includes("mindmap"))
    return <GitBranch size={16} style={{ color: "var(--color-warning)" }} />;
  if (n.includes("summary"))
    return <NotebookTabs size={16} style={{ color: "var(--color-info)" }} />;
  if (n.includes("faq"))
    return <HelpCircle size={16} style={{ color: "#ec4899" }} />;
  if (n.includes("study"))
    return <BookOpen size={16} style={{ color: "#0ea5e9" }} />;
  if (n.includes("briefing"))
    return <FileSignature size={16} style={{ color: "var(--primary-brand)" }} />;
  if (n.includes("ppt"))
    return <MonitorPlay size={16} style={{ color: "#ef4444" }} />;

  return <FileText size={16} style={{ color: "var(--color-info)" }} />;
}

export default RightPanel;