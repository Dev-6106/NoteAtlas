// MiddlePanel.tsx — Premium chat experience
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import {
  Copy,
  Loader2,
  SendHorizonal,
  ArrowDown,
  Sparkles,
} from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import {
  sendChatMessage,
  type chatHistoryType,
  type messageType,
  type questionAndDocOverviewType,
} from "@/api/notes";
import { addMessageInChatHistory } from "@/store/chatHistorySlice";
import type { NoteType } from "@/types/note-types";
import { showError } from "@/util/toast-notification";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SuggestedInput } from "./SuggestedInput";
import { ChatInput } from "./ChatInput";

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
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  async function sendUserMessage({
    newMessage,
  }: {
    newMessage: messageType;
  }) {
    setLoading(true);
    dispatch(addMessageInChatHistory(newMessage));
    const data = await sendChatMessage({
      userId,
      noteId,
      query: inputValue || newMessage?.content,
    });
    setLoading(false);
    setTimeout(scrollToBottom, 100);
    if (data?.message) {
      dispatch(addMessageInChatHistory(data.message));
    }
  }

  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    const newMessage: messageType = {
      role: "user",
      content: inputValue,
      userId,
      noteId,
    };
    await sendUserMessage({ newMessage });
  };

  async function selectQuestion(question: string) {
    const newMessage: messageType = {
      role: "user",
      content: question,
      userId,
      noteId,
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
        {chatHistory?.chatHistory?.filter(Boolean).map((msg, index) => (
          <ChatMessage key={index} msg={msg} />
        ))}

        {/* Loading indicator */}
        {loading && (
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
              <Sparkles size={14} style={{ color: "#fff" }} />
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
                    animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
            <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.85)}50%{opacity:1;transform:scale(1.1)}}`}</style>
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
              border: "1px solid var(--border-accent)",
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
              e.currentTarget.style.color = "#fff";
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
              color: "var(--text-3)",
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
                ? "var(--text-3)"
                : "linear-gradient(135deg, var(--primary-brand) 0%, var(--primary-light) 100%)",
              transition: "all 0.25s",
              transform: "scale(1)",
              boxShadow: loading
                ? "none"
                : "0 2px 8px rgba(109, 95, 246, 0.3)",
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
                style={{ color: "#fff" }}
              />
            ) : (
              <SendHorizonal size={15} style={{ color: "#fff" }} />
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
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = aiResult?.aiResult?.doc_overview || "";
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginBottom: 16 }} className="fade-in-up">
      {note?.image && (
        <span style={{ fontSize: "3rem", lineHeight: 1.2 }}>
          {note.image}
        </span>
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

      <button
        onClick={handleCopy}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "6px 12px",
          borderRadius: 8,
          border: "1px solid var(--border-default)",
          background: "transparent",
          color: "var(--text-3)",
          fontSize: 12,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "var(--border-accent)";
          e.currentTarget.style.color = "var(--primary-brand)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "var(--border-default)";
          e.currentTarget.style.color = "var(--text-3)";
        }}
      >
        <Copy size={13} />
        {copied ? "Copied!" : "Copy"}
      </button>

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

const ChatMessage = memo(({ msg }: { msg: Msg }) => {
  if (!msg || !msg.content) return null;
  const isAI = msg.role === "ai";

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
          color: isAI ? "var(--text-1)" : "#fff",
          fontSize: 14,
          lineHeight: 1.65,
          boxShadow: isAI
            ? "none"
            : "0 2px 8px rgba(109, 95, 246, 0.18)",
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
                      ? "var(--bg-card)"
                      : "rgba(0,0,0,0.15)",
                    overflowX: "auto",
                    margin: "6px 0",
                    fontSize: 13,
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
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

export default MiddlePannel;