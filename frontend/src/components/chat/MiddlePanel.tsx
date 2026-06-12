// MiddlePanel.tsx — Premium chat experience
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  Copy,
  Loader2,
  SendHorizonal,
  ArrowDown,
  Sparkles,
  BookOpen,
  FileText,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
  sendChatMessageStream,
  createConversationApi,
  type chatHistoryType,
  type messageType,
  type questionAndDocOverviewType,
} from "@/api/notes";
import { addMessageInChatHistory, fetchConversations, setActiveConversation } from "@/store/chatHistorySlice";
import type { NoteType } from "@/types/note-types";
import { showError } from "@/util/toast-notification";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SuggestedInput } from "./SuggestedInput";
import { ChatInput } from "./ChatInput";
import { type Citation } from "./SourceViewerModal";
import { togglePaymentModal } from "@/store/chatSlice";
import { openSourceViewer, closeSourceViewer } from "@/store/rightPanelSlice";

const MiddlePannel = ({
  chatHistory,
  userId,
  note,
  aiResult,
}: {
  chatHistory: chatHistoryType;
  userId: string;
  note: NoteType;
  aiResult: questionAndDocOverviewType;
}) => {
  const noteId = note?._id;
  const dispatch = useDispatch<AppDispatch>();
  const { middlePanelDefaultWidth } = useSelector(
    (state: RootState) => state.chat
  );
  const { docIds } = useSelector((state: RootState) => state.rightPanel);
  const { activeConversationId } = useSelector((state: RootState) => state.chatHistory);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState("");
  const chatContainerRef = useRef<HTMLElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  // Citation state: maps message index → citations array
  const [citationsMap, setCitationsMap] = useState<Record<number, Citation[]>>({});
  const activeSourceViewer = useSelector((state: RootState) => state.rightPanel.activeSourceViewer);

  async function sendUserMessage({
    newMessage,
  }: {
    newMessage: messageType;
  }) {
    setLoading(true);
    
    let targetConversationId = activeConversationId;
    
    if (!targetConversationId) {
      const promptText = inputValue || newMessage?.content || "New Chat";
      const newTitle = promptText.length > 30 ? promptText.substring(0, 30) + '...' : promptText;
      try {
        const res = await createConversationApi(noteId, newTitle);
        if (res && res.conversation) {
          targetConversationId = res.conversation._id;
          newMessage.conversationId = targetConversationId;
          dispatch(fetchConversations(noteId));
          dispatch(setActiveConversation(targetConversationId));
        }
      } catch (error) {
        console.error("Failed to auto-create conversation", error);
      }
    }
    
    dispatch(addMessageInChatHistory(newMessage));
    
    setIsStreaming(true);
    setStreamingMessage("");
    let fullResponse = "";
    let streamCitations: Citation[] = [];

    try {
      await sendChatMessageStream({
        userId,
        noteId,
        docIds,
        query: inputValue || newMessage?.content,
        conversationId: targetConversationId || undefined
      }, (chunk) => {
          fullResponse += chunk;
          setStreamingMessage(fullResponse);
          scrollToBottom();
      }, (citations) => {
          streamCitations = citations;
      });

      if (fullResponse) {
        const msgIndex = (chatHistory?.chatHistory?.length ?? 0);
        // Store citations keyed by the AI message index (after user msg)
        if (streamCitations.length > 0) {
          setCitationsMap(prev => ({ ...prev, [msgIndex]: streamCitations }));
        }
        dispatch(addMessageInChatHistory({
          role: "ai",
          content: fullResponse,
          userId,
          noteId,
          conversationId: targetConversationId
        }));
      }
    } catch (error: any) {
      // 402 = insufficient credits
      if (error?.message?.includes('402') || error?.status === 402) {
        showError("You have run out of credits. Please buy more to continue.");
        dispatch(togglePaymentModal());
      } else {
        console.error("Streaming error:", error);
        showError("Failed to fetch response");
      }
    } finally {
      setIsStreaming(false);
      setStreamingMessage("");
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const newMessage: messageType = {
      role: "user",
      content: inputValue,
      userId,
      noteId,
      conversationId: activeConversationId || undefined
    };
    await sendUserMessage({ newMessage });
  };

  async function selectQuestion(question: string) {
    const newMessage: messageType = {
      role: "user",
      content: question,
      userId,
      noteId,
      conversationId: activeConversationId || undefined
    };
    await sendUserMessage({ newMessage });
  }

  const onKeyDownMessage = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newMessage: messageType = {
        role: "user",
        content: inputValue,
        userId,
        noteId,
        conversationId: activeConversationId || undefined
      };
      setInputValue("");
      await sendUserMessage({ newMessage });
    }
  };

  const scrollToBottom = () => {
    const container = chatContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 50;
      setShowScrollButton(!isAtBottom);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* ── Chat header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px 10px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "var(--text-2)",
          }}
        >
          Chat
        </span>
      </div>
      <div
        style={{
          height: 1,
          background: "var(--border-default)",
          margin: "0 20px",
          flexShrink: 0,
        }}
      />

      {/* ── Messages area ── */}
      <div
        ref={chatContainerRef as any}
        className="studio-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        {/* Note header / overview */}
        <NoteHeader
          note={note}
          docIds={docIds}
          aiResult={aiResult}
        />

        {/* Messages */}
        {activeConversationId && chatHistory?.chatHistory?.filter(Boolean).map((msg, index) => (
          <ChatMessage
            key={index}
            msg={msg}
            citations={citationsMap[index]}
            onOpenSource={(citations, docId, page, lines) => 
              dispatch(openSourceViewer({ citations, initialDocId: docId, initialPage: page, initialLines: lines }))
            }
          />
        ))}

        {/* Empty State */}
        {(!activeConversationId || !chatHistory?.chatHistory || chatHistory.chatHistory.length === 0) && !isStreaming && !loading && (
          <div className="fade-up" style={{ 
            display: "flex", flexDirection: "column", alignItems: "center", 
            justifyContent: "center", padding: "60px 20px 40px", textAlign: "center" 
          }}>
            <div style={{ marginBottom: 24, position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 18C41.5 30 46 34.5 58 36C46 37.5 41.5 42 40 54C38.5 42 34 37.5 22 36C34 34.5 38.5 30 40 18Z" fill="#E0D4FF"/>
                <path d="M22 46C22.5 50 24 51.5 28 52C24 52.5 22.5 54 22 58C21.5 54 20 52.5 16 52C20 51.5 21.5 50 22 46Z" fill="#E0D4FF"/>
                <path d="M60 46C60.5 50 62 51.5 66 52C62 52.5 60.5 54 60 58C59.5 54 58 52.5 54 52C58 51.5 59.5 50 60 46Z" fill="#E0D4FF"/>
                <path d="M30 20C30.5 22.5 31.5 23.5 34 24C31.5 24.5 30.5 25.5 30 28C29.5 25.5 28.5 24.5 26 24C28.5 23.5 29.5 22.5 30 20Z" fill="#E0D4FF"/>
                <path d="M52 24C52.5 26.5 53.5 27.5 56 28C53.5 28.5 52.5 29.5 52 32C51.5 29.5 50.5 28.5 48 28C50.5 27.5 51.5 26.5 52 24Z" fill="#E0D4FF"/>
                <path d="M42 6C42.5 8.5 43.5 9.5 46 10C43.5 10.5 42.5 11.5 42 14C41.5 11.5 40.5 10.5 38 10C40.5 9.5 41.5 8.5 42 6Z" fill="#E0D4FF"/>
              </svg>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 12, letterSpacing: "-0.4px" }}>
              Your AI research assistant is ready
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 320, lineHeight: 1.6 }}>
              Ask anything about your sources and get accurate, cited answers.
            </p>
          </div>
        )}

        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <ChatMessage msg={{ role: "ai", content: streamingMessage }} />
        )}

        {/* Loading indicator */}
        {loading && !isStreaming && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 0",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background:
                  "linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-light) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={14} style={{ color: "var(--text-1)" }} />
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: "var(--primary-brand)",
                    opacity: 0.5,
                    animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <style>{`@keyframes dotPulse{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}`}</style>
          </div>
        )}
      </div>

      {/* ── Jump to bottom ── */}
      {showScrollButton && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "0 0 8px",
          }}
        >
          <button
            onClick={scrollToBottom}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 16px",
              borderRadius: 20,
              border: `1px solid var(--border-accent)`,
              background: "var(--primary-glow)",
              color: "var(--primary-brand)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              backdropFilter: "blur(12px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--primary-brand)";
              e.currentTarget.style.color = "var(--text-1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--primary-glow)";
              e.currentTarget.style.color = "var(--primary-brand)";
            }}
          >
            <ArrowDown size={14} />
            <span>Jump to bottom</span>
          </button>
        </div>
      )}

      {/* ── Chat input area ── */}
      <div style={{ padding: "8px 16px 6px", flexShrink: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            borderRadius: 16,
            border: "1px solid var(--border-default)",
            background: "var(--bg-card)",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px var(--primary-glow)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onKeyDownMessage={onKeyDownMessage}
          />

          <span
            style={{
              fontSize: 11,
              color: "var(--text-4)",
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
          >
            {docIds?.length || 0} sources
          </span>

          <button
            onClick={sendMessage}
            disabled={loading}
            aria-label="Send"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading ? "not-allowed" : "pointer",
              flexShrink: 0,
              background: loading
                ? "var(--text-4)"
                : "linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-light) 100%)",
              transition: "all 0.25s",
              transform: "scale(1)",
              boxShadow: loading
                ? "none"
                : "var(--shadow-primary)",
            }}
            onMouseEnter={(e) => {
              if (!loading)
                e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            {loading ? (
              <Loader2
                className="spin"
                size={16}
                style={{ color: "var(--text-on-primary)" }}
              />
            ) : (
              <SendHorizonal size={15} style={{ color: "var(--text-on-primary)" }} />
            )}
          </button>
        </div>

        {/* Suggested questions */}
        <SuggestedInput
          selectQuestion={selectQuestion}
          questions={aiResult?.aiResult?.questions}
        />
      </div>
    </div>
  </>
  );
};

/* ═══════════════════════════════════════
   Note Header
   ═══════════════════════════════════════ */
const NoteHeader = ({
  note,
  docIds,
  aiResult,
}: {
  note: NoteType;
  docIds: string[];
  aiResult: questionAndDocOverviewType;
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ marginBottom: 16 }} className="fade-in-up">
      {note?.image && (
        note.image.startsWith("http") && !imgError ? (
          <img
            src={note.image}
            alt=""
            onError={() => setImgError(true)}
            style={{ width: 64, height: 64, borderRadius: 12, opacity: 0.9, objectFit: "cover", marginBottom: 12 }}
          />
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, borderRadius: 12, background: "var(--primary-glow)", border: "1px solid var(--border-default)", marginBottom: 12, fontSize: "2rem" }}>
            {imgError || !note.image ? <BookOpen size={32} style={{ color: "var(--primary-brand)" }} /> : note.image}
          </div>
        )
      )}

      <h1
        style={{
          fontSize: "clamp(1.5rem, 3vw, 1.875rem)",
          fontWeight: 700,
          color: "var(--text-1)",
          margin: "8px 0 6px",
          lineHeight: 1.25,
        }}
      >
        {note?.title}
      </h1>

      <span
        style={{
          fontSize: 12,
          color: "var(--text-3)",
          fontWeight: 500,
        }}
      >
        {docIds?.length || 0} sources
      </span>

      {aiResult?.aiResult?.doc_overview && (
        <p
          style={{
            fontSize: 14,
            color: "var(--text-2)",
            lineHeight: 1.6,
            margin: "10px 0 12px",
          }}
        >
          {aiResult.aiResult.doc_overview}
        </p>
      )}

      <div
        style={{
          height: 1,
          background: "var(--border-default)",
          margin: "16px 0 8px",
        }}
      />
    </div>
  );
};

/* ═══════════════════════════════════════
   Chat Message
   ═══════════════════════════════════════ */
type Msg = { role: "ai" | "user"; content: string };

const ChatMessage = memo(({ msg, citations, onOpenSource }: {
  msg: Msg;
  citations?: Citation[];
  onOpenSource?: (citations: Citation[], docId: string, page?: number, lines?: string) => void;
}) => {
  if (!msg || !msg.content) return null;
  const isAI = msg.role === "ai";
  const extractedCitations: Citation[] = [];

  if (isAI && msg.content) {
    const regex = /\[Source:\s*([^\|]+)\|\s*ID:\s*([^\|\]]+)(?:\|\s*Page:\s*([^\|\]]+))?(?:\|\s*Lines:\s*([^\|\]]+))?\]/g;
    let match;
    const seen = new Set<string>();
    const regexClone = new RegExp(regex);
    while ((match = regexClone.exec(msg.content)) !== null) {
        const title = match[1].trim();
        const docId = match[2].trim();
        const pageVal = match[3]?.trim();
        const page = pageVal ? parseInt(pageVal) : undefined;
        const lines = match[4]?.trim();

        const key = `${docId}-${page}-${lines}`;
        if (!seen.has(key)) {
            seen.add(key);
            extractedCitations.push({ 
                title, 
                docId, 
                page: (page !== undefined && !isNaN(page)) ? page : undefined, 
                lines 
            });
        }
    }
  }
  
  const finalCitations = citations && citations.length > 0 ? citations : extractedCitations;

  // Convert citation markers to markdown links for inline rendering
  const cleanContent = isAI
    ? msg.content.replace(/\[Source:\s*([^\|]+)\|\s*ID:\s*([^\|\]]+)(?:\|\s*Page:\s*([^\|\]]+))?(?:\|\s*Lines:\s*([^\|\]]+))?\]/g, (match, title, docId, page, lines) => {
        let query = `id=${docId.trim()}`;
        if (page) query += `&page=${page.trim()}`;
        if (lines) query += `&lines=${lines.trim()}`;
        return `[${title.trim()}](#cite?${query})`;
      })
    : msg.content;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isAI ? "flex-start" : "flex-end",
        marginBottom: 4,
      }}
    >
      <div
        style={{
          maxWidth: "88%",
          padding: isAI ? "8px 4px" : "12px 16px",
          borderRadius: isAI ? "4px" : "16px 16px 4px 16px",
          background: isAI
            ? "transparent"
            : "linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-light) 100%)",
          color: isAI ? "var(--text-1)" : "var(--text-on-primary)",
          fontSize: 14,
          lineHeight: 1.65,
          boxShadow: isAI
            ? "none"
            : "var(--shadow-primary)",
        }}
      >
        <div
          style={{
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            overflowX: "hidden",
          }}
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, href, children, ...props }) => {
                if (href?.startsWith("#cite?")) {
                  const urlParams = new URLSearchParams(href.replace("#cite?", ""));
                  const docId = urlParams.get("id") || "";
                  const page = urlParams.get("page") ? parseInt(urlParams.get("page")!) : undefined;
                  const lines = urlParams.get("lines") || undefined;
                  
                  if (finalCitations.length === 0) return <span style={{ color: "var(--primary-brand)", fontWeight: 600 }}>[{children}]</span>;
                  
                  return (
                    <button
                      onClick={() => onOpenSource?.(finalCitations, docId, page, lines)}
                      style={{
                        display: "inline-flex", alignItems: "center", justifyContent: "center",
                        verticalAlign: "middle",
                        height: 20, padding: "0 6px", margin: "0 2px",
                        borderRadius: 6,
                        background: "var(--primary-glow)",
                        border: "1px solid var(--primary-border)",
                        color: "var(--primary-brand)",
                        fontSize: 11, fontWeight: 700,
                        cursor: "pointer", transition: "all 0.15s",
                        fontFamily: "var(--font-mono, monospace)",
                        maxWidth: "140px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap"
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-mid)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-glow)";
                      }}
                      title="View Source"
                    >
                      {children}
                    </button>
                  );
                }

                const isRealLink = href?.startsWith("http") || href?.startsWith("mailto:");
                if (!isRealLink) {
                  // If remarkGfm auto-linked something like "file.pdf", render it as plain text
                  return <span style={{ fontWeight: 600 }} {...props}>{children}</span>;
                }
                return (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                    style={{
                      color: isAI ? "var(--primary-brand)" : "#c4b5fd",
                      textDecoration: "underline",
                    }}
                  >
                    {children}
                  </a>
                );
              },
              ul: ({ node, ...props }) => (
                <ul
                  style={{
                    listStyle: "disc",
                    paddingLeft: 20,
                    margin: "4px 0",
                  }}
                  {...props}
                />
              ),
              ol: ({ node, ...props }) => (
                <ol
                  style={{
                    listStyle: "decimal",
                    paddingLeft: 20,
                    margin: "4px 0",
                  }}
                  {...props}
                />
              ),
              li: ({ node, ...props }) => (
                <li style={{ marginBottom: 0 }} {...props} />
              ),
              p: ({ node, ...props }) => (
                <p style={{ margin: isAI ? "4px 0" : "2px 0" }} {...props} />
              ),
              h1: ({ node, ...props }) => (
                <h1
                  style={{
                    fontSize: "1.35rem",
                    fontWeight: 700,
                    margin: "8px 0 4px",
                  }}
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: 600,
                    margin: "8px 0 4px",
                  }}
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  style={{
                    fontSize: "1.05rem",
                    fontWeight: 600,
                    margin: "6px 0 4px",
                  }}
                  {...props}
                />
              ),
              strong: ({ node, ...props }) => (
                <strong style={{ fontWeight: 700 }} {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre
                  style={{
                    padding: 10,
                    borderRadius: 8,
                    background: isAI
                      ? "var(--bg-elevated)"
                      : "rgba(0,0,0,0.15)",
                    overflowX: "auto",
                    margin: "6px 0",
                    fontSize: 13,
                    border: isAI ? "1px solid var(--border-default)" : "none",
                  }}
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  style={{ fontFamily: "var(--font-mono, monospace)" }}
                  {...props}
                />
              ),
            }}
          >
            {cleanContent}
          </ReactMarkdown>
        </div>

        {/* Citation chips (AI messages only) */}
        {isAI && finalCitations && finalCitations.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {(() => {
              const uniqueCitations: Citation[] = [];
              const seenDocIds = new Set<string>();
              for (const c of finalCitations) {
                if (!seenDocIds.has(c.docId)) {
                  seenDocIds.add(c.docId);
                  uniqueCitations.push(c);
                }
              }
              const displayCitations = uniqueCitations.slice(0, 3);
              const hasMore = uniqueCitations.length > 3;

              return (
                <>
                  {displayCitations.map((c) => (
                    <button
                      key={c.docId}
                      onClick={() => onOpenSource?.(finalCitations, c.docId, c.page, c.lines)}
                      style={{
                        display: "flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", borderRadius: 999,
                        background: "var(--primary-glow)",
                        border: "1px solid var(--primary-border)",
                        color: "var(--primary-brand)", fontSize: 11.5, fontWeight: 600,
                        cursor: "pointer", transition: "all 0.15s",
                        maxWidth: "100%",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-mid)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-glow)";
                      }}
                    >
                      <FileText size={11} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {c.title}
                      </span>
                    </button>
                  ))}
                  {hasMore && (
                    <span style={{ color: "var(--text-4)", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", padding: "0 4px" }}>
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => onOpenSource?.(finalCitations)}
                    style={{
                      display: "flex", alignItems: "center", gap: 5,
                      padding: "4px 10px", borderRadius: 999,
                      background: "transparent",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-4)", fontSize: 11.5, fontWeight: 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-accent)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.color = "var(--text-4)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-default)";
                    }}
                  >
                    <BookOpen size={11} />
                    View all sources
                  </button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
});

export default MiddlePannel;