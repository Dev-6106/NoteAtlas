import { memo, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Copy, GitBranch, Loader2, Music2, NotebookTabs,
  SendHorizonal, ArrowDown, Check, Sparkles,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { createBriefingDoc, createMindMap, createSummary, sendChatMessage } from "@/api/notes";
import { addMessage } from "@/store/chatHistorySlice";
import { fetchNoteSourceResult } from "@/store/rightPanelSlice";
import { showError } from "@/util/toast-notification";
import type { NoteType } from "@/types/note-types";
import type { MessageType, QuestionAndDocOverviewType } from "@/api/notes";

import { SuggestedInput } from "./SuggestedInput";
import { ChatInput } from "./ChatInput";

interface Props {
  chatHistory: MessageType[];
  userId: string;
  note: NoteType;
  aiResult: QuestionAndDocOverviewType;
}

export default function MiddlePanel({ chatHistory, userId, note, aiResult }: Props) {
  const { _id: noteId } = note;
  const dispatch = useAppDispatch();
  const { docIds } = useAppSelector((state) => state.rightPanel);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      setShowScrollButton(!isAtBottom);
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto scroll on new messages
  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [chatHistory.length]);

  const sendUserMessage = async (content: string) => {
    if (!content.trim() || !userId || !noteId) return;

    const newMessage: MessageType = { role: "user", content, userId, noteId };
    dispatch(addMessage(newMessage));
    setInputValue("");
    setLoading(true);

    try {
      const data = await sendChatMessage({ userId, noteId, query: content });
      if (data?.message) {
        dispatch(addMessage(data.message));
      }
    } catch (err) {
      showError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  const hasChatHistory = chatHistory.length > 0;

  return (
    <div className="h-full flex flex-col relative bg-background/30">
      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto custom-scrollbar"
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
      >
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <MiddlePanelHeader aiResult={aiResult} note={note} docIds={docIds} />

          {hasChatHistory && (
            <>
              <div className="flex items-center gap-4 text-muted-foreground/40">
                <div className="h-px flex-1 bg-border/40" />
                <span className="text-[11px] font-semibold uppercase tracking-widest">
                  Conversation
                </span>
                <div className="h-px flex-1 bg-border/40" />
              </div>

              <div className="space-y-5">
                {chatHistory.map((msg, index) => (
                  <ChatMessage key={`${msg.role}-${index}`} msg={msg} />
                ))}
                {loading && <TypingIndicator />}
              </div>
            </>
          )}

          {!hasChatHistory && !loading && (
            <div className="flex flex-col items-center justify-center py-12 text-center fade-in">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center mb-4 border border-border/60">
                <Sparkles className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                Ask a question about your sources, or try one of the suggestions below.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Jump to bottom */}
      {showScrollButton && (
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={scrollToBottom}
            className="px-3.5 py-1.5 bg-secondary/90 text-foreground backdrop-blur-md shadow-lg rounded-full flex items-center gap-2 text-xs font-medium hover:bg-secondary border border-border/60 transition-all scale-in"
            aria-label="Scroll to latest message"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            New messages
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="shrink-0 border-t border-border/30 bg-background/50 backdrop-blur-md">
        <div className="max-w-3xl mx-auto px-4 py-3 space-y-2">
          <SuggestedInput
            selectQuestion={(q) => sendUserMessage(q)}
            questions={aiResult?.aiResult?.questions || []}
          />

          <div className="relative p-1 bg-card rounded-2xl flex items-end gap-2 shadow-sm border border-border/60 focus-within:border-muted-foreground/40 focus-within:ring-1 focus-within:ring-muted-foreground/20 transition-all">
            <ChatInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              onSend={() => sendUserMessage(inputValue)}
            />

            <div className="shrink-0 flex items-center gap-2.5 pr-2 pb-2">
              <span className="text-[11px] font-medium text-muted-foreground bg-secondary/60 px-2 py-0.5 rounded-md tabular-nums">
                {docIds?.length || 0} sources
              </span>
              <button
                onClick={() => sendUserMessage(inputValue)}
                disabled={loading || !inputValue.trim()}
                className="w-8 h-8 rounded-xl flex items-center justify-center bg-primary text-primary-foreground disabled:opacity-30 disabled:bg-secondary disabled:text-muted-foreground hover:opacity-90 transition-all shadow-sm active:scale-95"
                aria-label="Send message"
              >
                <SendHorizonal className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────

function MiddlePanelHeader({
  note,
  docIds,
  aiResult,
}: {
  note: NoteType;
  docIds: string[];
  aiResult: QuestionAndDocOverviewType;
}) {
  const dispatch = useAppDispatch();
  const [loadingType, setLoadingType] = useState<"summary" | "mindmap" | "audio" | null>(null);
  const [copiedOverview, setCopiedOverview] = useState(false);

  const handleAction = async (
    type: "summary" | "mindmap" | "audio",
    actionFn: () => Promise<void>
  ) => {
    if (!docIds || docIds.length === 0) {
      showError("Please select at least one source document.");
      return;
    }
    setLoadingType(type);
    try {
      await actionFn();
      dispatch(fetchNoteSourceResult(note._id));
    } catch (err) {
      showError(`Failed to generate ${type}. Please try again.`);
    } finally {
      setLoadingType(null);
    }
  };

  const copyOverview = async () => {
    const text = aiResult?.aiResult?.doc_overview;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedOverview(true);
      setTimeout(() => setCopiedOverview(false), 2000);
    } catch {
      showError("Failed to copy to clipboard.");
    }
  };

  return (
    <div className="mb-6 fade-in">
      <div className="flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-2xl shadow-glow shrink-0">
          {note?.image && !note.image.includes("uploads") ? note.image : "📓"}
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-foreground truncate">
            {note?.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {docIds?.length || 0} active sources
          </p>
        </div>
      </div>

      {aiResult?.aiResult?.doc_overview && (
        <div className="p-4 surface rounded-xl border-primary/10 bg-primary/[0.03] text-foreground text-sm leading-relaxed mb-5 relative group">
          <p className="pr-8">{aiResult.aiResult.doc_overview}</p>
          <button
            onClick={copyOverview}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-secondary text-muted-foreground hover:text-foreground"
            aria-label="Copy overview"
          >
            {copiedOverview ? (
              <Check className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2.5">
        <ActionButton
          icon={<NotebookTabs className="w-5 h-5 text-amber-400" />}
          label="Summary"
          loading={loadingType === "summary"}
          onClick={() =>
            handleAction("summary", () => createSummary(note._id, docIds))
          }
        />
        <ActionButton
          icon={<GitBranch className="w-5 h-5 text-indigo-400" />}
          label="Mind Map"
          loading={loadingType === "mindmap"}
          onClick={() =>
            handleAction("mindmap", () => createMindMap(note._id, docIds))
          }
        />
        <ActionButton
          icon={<Music2 className="w-5 h-5 text-emerald-400" />}
          label="Audio Brief"
          loading={loadingType === "audio"}
          onClick={() =>
            handleAction("audio", () =>
              createBriefingDoc(note._id, docIds, "audio")
            )
          }
        />
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  loading: boolean;
  onClick: () => void;
}

function ActionButton({ icon, label, loading, onClick }: ActionButtonProps) {
  return (
    <button
      disabled={loading}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1.5 p-3.5 surface surface-hover rounded-xl disabled:opacity-50 disabled:pointer-events-none group"
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      ) : (
        <div className="group-hover:scale-110 transition-transform">{icon}</div>
      )}
      <span className="text-[11px] font-medium text-muted-foreground group-hover:text-foreground transition-colors">
        {label}
      </span>
    </button>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start fade-in">
      <div className="bg-secondary/60 rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1.5 border border-border/40">
        <div className="w-2 h-2 rounded-full bg-muted-foreground/60 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/60 typing-dot" />
        <div className="w-2 h-2 rounded-full bg-muted-foreground/60 typing-dot" />
      </div>
    </div>
  );
}

const ChatMessage = memo(({ msg }: { msg: MessageType }) => {
  const isUser = msg.role === "user";
  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-4 py-3 text-[14.5px] leading-relaxed fade-in ${
          isUser
            ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
            : "bg-secondary/50 text-foreground rounded-2xl rounded-tl-sm border border-border/40"
        }`}
      >
        <div
          className={`
            break-words whitespace-pre-wrap
            [&_a]:underline [&_a]:text-blue-400 [&_a:hover]:text-blue-300
            [&_pre]:my-3 [&_pre]:p-3.5 [&_pre]:rounded-lg [&_pre]:bg-background/50 [&_pre]:border [&_pre]:border-border/50 [&_pre]:overflow-x-auto [&_pre]:text-sm
            [&_code]:font-mono [&_code]:text-[13px] [&_code]:bg-background/40 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:my-2
            [&_p]:mb-2 last:[&_p]:mb-0
            [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
            [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-2
            [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-3 [&_h3]:mb-1
            [&_strong]:text-foreground [&_strong]:font-semibold
            [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_blockquote]:my-2
          `}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {msg.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";
