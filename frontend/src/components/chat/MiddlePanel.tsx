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
import { SourceViewerModal, type Citation } from "./SourceViewerModal";
import { togglePaymentModal } from "@/store/chatSlice";

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
  const { _id: noteId } = note;
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
  const [sourceModal, setSourceModal] = useState<{ citations: Citation[]; initialDocId?: string } | null>(null);

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
            onOpenSource={(citations, docId) => setSourceModal({ citations, initialDocId: docId })}
          />
        ))}

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
                style={{ color: "var(--text-1)" }}
              />
            ) : (
              <SendHorizonal size={15} style={{ color: "var(--text-1)" }} />
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

    {/* Source Viewer Modal */}
    {sourceModal && (
      <SourceViewerModal
        citations={sourceModal.citations}
        initialDocId={sourceModal.initialDocId}
        onClose={() => setSourceModal(null)}
      />
    )}
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
  return (
    <div style={{ marginBottom: 16 }} className="fade-in-up">
      {note?.image && (
        note.image.startsWith("http") ? (
          <img
            src={note.image}
            alt=""
            style={{ width: 64, height: 64, borderRadius: 12, opacity: 0.9, objectFit: "cover", marginBottom: 12 }}
          />
        ) : (
          <span style={{ fontSize: "3rem", lineHeight: 1.2 }}>
            {note.image}
          </span>
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
  onOpenSource?: (citations: Citation[], docId?: string) => void;
}) => {
  if (!msg || !msg.content) return null;
  const isAI = msg.role === "ai";

  // Strip citation markers from displayed content for cleaner rendering
  const cleanContent = isAI
    ? msg.content.replace(/\[Source:\s*[^|]+\|\s*ID:\s*[^\]]+\]/g, "")
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
          color: isAI ? "var(--text-1)" : "var(--text-1)",
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
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  style={{
                    color: isAI ? "var(--primary-brand)" : "#c4b5fd",
                    textDecoration: "underline",
                  }}
                />
              ),
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
        {isAI && citations && citations.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
            {citations.map((c) => (
              <button
                key={c.docId}
                onClick={() => onOpenSource?.(citations, c.docId)}
                style={{
                  display: "flex", alignItems: "center", gap: 5,
                  padding: "4px 10px", borderRadius: 999,
                  background: "var(--primary-glow)",
                  border: "1px solid var(--primary-border)",
                  color: "var(--primary-brand)", fontSize: 11.5, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-mid)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-glow)";
                }}
              >
                <FileText size={11} />
                {c.title.length > 28 ? c.title.substring(0, 28) + "…" : c.title}
              </button>
            ))}
            <button
              onClick={() => onOpenSource?.(citations)}
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
          </div>
        )}
      </div>
    </div>
  );
});

export default MiddlePannel;