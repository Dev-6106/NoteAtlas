// MiddlePannel.jsx
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/stores";
import { Copy, GitBranch, Loader2, NotebookTabs, SendHorizonal, ArrowDown } from "lucide-react";
import { memo, useEffect, useRef, useState } from "react";
import { createBriefingDoc, createMindMap, createSummary, sendChatMessage, type chatHistoryType, type messageType, type questionAndDocOverviewType } from "@/api/notes";
import { addMessageInChatHistory } from "@/store/chatHistorySlice";
import type { NoteType } from "@/types/note-types";
import { showError } from "@/util/toast-notification";
import { fetchNoteSourceResult } from "@/store/rightPanelSlice";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SuggestedInput } from "./SuggestedInput";
import { ChatInput } from "./ChatInput";


const MiddlePannel = ({ chatHistory, userId, note, aiResult }: { chatHistory: chatHistoryType, userId: string, note: NoteType, aiResult: questionAndDocOverviewType }) => {
    const { _id: noteId } = note;
    const dispatch = useDispatch<AppDispatch>();
    const { middlePanelDefaultWidth } = useSelector((state: RootState) => state.chat);

    const { docIds } = useSelector((state: RootState) => state.rightPanel);

    const [inputValue, setInputValue] = useState("");
    const [loading, setLoading] = useState(false);

    const chatContainerRef = useRef<HTMLElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);



    async function sendUserMessage({ newMessage }: { newMessage: messageType }) {
        setLoading(true);
        dispatch(addMessageInChatHistory(newMessage));


        const data = await sendChatMessage({ userId, noteId, query: inputValue || newMessage?.content });
        setLoading(false);
        setTimeout(scrollToBottom, 100);
        dispatch(addMessageInChatHistory(data?.message));
        
    }

    const sendMessage = async () => {
        if (!inputValue.trim()) return;

        const newMessage: messageType = {
            role: "user",
            content: inputValue,
            userId, noteId
        };

        await sendUserMessage({ newMessage });
       
    };


    async function selectQuestion(question: string) {
        const newMessage: messageType = {
            role: "user",
            content: question,
            userId, noteId
        };


        await sendUserMessage({ newMessage });

    }


    const onKeyDownMessage = async (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();

            const newMessage: messageType = {
                role: "user",
                content: inputValue,
                userId, noteId
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
            const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
            setShowScrollButton(!isAtBottom);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);



    return (
        <div
            style={{
                width: `${middlePanelDefaultWidth}%`,
                transition: "all 0.3s ease",
                height: "100%",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
        >
            <style>{`
                .mid-scroll::-webkit-scrollbar { width: 5px; }
                .mid-scroll::-webkit-scrollbar-track { background: transparent; }
                .mid-scroll::-webkit-scrollbar-thumb { background: #312e81; border-radius: 4px; }
            `}</style>

            {/* chat section */}
            <div
                ref={chatContainerRef}
                className="mid-scroll"
                style={{
                    position: "relative",
                    flex: 1,
                    overflowY: "auto",
                    marginBottom: 16,
                    paddingRight: 8,
                }}
            >
                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between",
                    alignItems: "center", marginBottom: 12, flexShrink: 0,
                }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.2px" }}>
                        Chat
                    </p>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />

                <MiddlePanelHeader aiResult={aiResult} note={note} docIds={docIds} />

                {/* messages */}
                {chatHistory?.chatHistory?.map((msg, index) => (
                    <ChatMessage key={index} msg={msg} />
                ))}

            </div>

            {/* jump-to-bottom button */}
            {showScrollButton && (
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <button
                        onClick={scrollToBottom}
                        style={{
                            display: "flex", alignItems: "center", gap: 8,
                            padding: "7px 18px", borderRadius: 999,
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            color: "#fff", fontSize: 13, fontWeight: 600,
                            border: "none", cursor: "pointer",
                            boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                            transition: "all 0.2s",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(99,102,241,0.5)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(99,102,241,0.35)";
                        }}
                    >
                        <ArrowDown size={15} />
                        <span>Jump to bottom</span>
                    </button>
                </div>
            )}

            {/* bordered chat-input card */}
            <div style={{
                position: "relative",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 16,
                padding: 12,
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(8px)",
            }}>
                {/* main input row */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   
                    <ChatInput
                        inputValue={inputValue}
                        setInputValue={setInputValue}
                        onKeyDownMessage={onKeyDownMessage}
                    />


                    <div style={{
                        fontSize: 12, color: "#475569",
                        whiteSpace: "nowrap", fontWeight: 500,
                    }}>
                        {docIds?.length} sources
                    </div>

                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        aria-label="Send"
                        style={{
                            width: 38, height: 38, borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: loading
                                ? "rgba(99,102,241,0.3)"
                                : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            boxShadow: loading ? "none" : "0 4px 14px rgba(99,102,241,0.35)",
                            transition: "all 0.2s",
                            flexShrink: 0,
                        }}
                        onMouseEnter={e => {
                            if (!loading) {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 20px rgba(99,102,241,0.5)";
                            }
                        }}
                        onMouseLeave={e => {
                            if (!loading) {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 14px rgba(99,102,241,0.35)";
                            }
                        }}
                    >
                        {loading ? (
                            <Loader2 size={16} style={{ color: "#a5b4fc", animation: "spin 1s linear infinite" }} />
                        ) : (
                            <SendHorizonal size={15} style={{ color: "#fff" }} />
                        )}
                    </button>
                </div>
            </div>

            <SuggestedInput selectQuestion={selectQuestion} questions={aiResult?.aiResult?.questions} />

            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
    );

};


const MiddlePanelHeader = ({ note, docIds, aiResult }: { note: NoteType, docIds: string[], aiResult: questionAndDocOverviewType }) => {

    const [summaryLoading, setSummaryLoading] = useState(false);
    const [mindMapLoading, setMindMapLoading] = useState(false);

    const dispatch = useDispatch<AppDispatch>();

    async function generateSummary() {
        if (docIds.length > 0) {
            setSummaryLoading(true);
            await createSummary(note?._id, docIds);
            setSummaryLoading(false);
        } else {
            showError("Please select a source");
        }
    }

    async function generateMindMap() {
        if (docIds.length > 0) {
            setMindMapLoading(true);
            await createMindMap(note?._id, docIds);
            setMindMapLoading(false);
            dispatch(fetchNoteSourceResult(note?._id));
        } else {
            showError("Please select a source");
        }
    }

    return (
        <div style={{ marginBottom: 12 }}>
            <div>
                <span style={{ fontSize: "4rem" }}>
                    {note?.image}
                </span>
            </div>
            <div style={{ marginBottom: 16 }}>
                <p style={{
                    fontSize: 24, fontWeight: 800, color: "#f1f5f9",
                    letterSpacing: "-0.5px", marginBottom: 6,
                }}>
                    {note?.title}
                </p>
                <p style={{ fontSize: 13, color: "#475569", fontWeight: 500, marginBottom: 4 }}>
                    {docIds?.length} sources
                </p>
                <p style={{
                    padding: "8px 0", fontSize: 14, color: "#94a3b8",
                    lineHeight: 1.7, marginBottom: 16,
                }}>
                    {aiResult?.aiResult?.doc_overview}
                </p>
                <button
                    style={{
                        width: 34, height: 34, borderRadius: 9,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        color: "#64748b", cursor: "pointer", transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                    }}
                >
                    <Copy size={15} />
                </button>
            </div>

            <div style={{
                display: "flex", gap: 10, marginBottom: 24,
            }}>
                <button
                    disabled={summaryLoading}
                    onClick={generateSummary}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 20px", borderRadius: 999,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8", fontSize: 13, fontWeight: 600,
                        cursor: summaryLoading ? "not-allowed" : "pointer",
                        opacity: summaryLoading ? 0.6 : 1,
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                        if (!summaryLoading) {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                            (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                    }}
                >
                    {summaryLoading ? (
                        <Loader2 size={15} style={{ animation: "spin 1s linear infinite", color: "#818cf8" }} />
                    ) : (
                        <NotebookTabs size={15} style={{ color: "#eab308" }} />
                    )}
                    <span>Summary</span>
                </button>

                <button
                    disabled={mindMapLoading}
                    onClick={generateMindMap}
                    style={{
                        display: "flex", alignItems: "center", gap: 8,
                        padding: "10px 20px", borderRadius: 999,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94a3b8", fontSize: 13, fontWeight: 600,
                        cursor: mindMapLoading ? "not-allowed" : "pointer",
                        opacity: mindMapLoading ? 0.6 : 1,
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                        if (!mindMapLoading) {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                            (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
                        }
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                    }}
                >
                    {mindMapLoading ? (
                        <Loader2 size={15} style={{ animation: "spin 1s linear infinite", color: "#818cf8" }} />
                    ) : (
                        <GitBranch size={15} style={{ color: "#818cf8" }} />
                    )}
                    <span>MindMap</span>
                </button>
            </div>
        </div>
    );
};


type Msg = { role: "ai" | "user"; content: string };

const ChatMessage = memo(({ msg }: { msg: Msg }) => {
    const isUser = msg?.role === "user";
    return (
        <div style={{
            display: "flex",
            justifyContent: isUser ? "flex-end" : "flex-start",
            marginBottom: 8,
        }}>
            <div
                style={{
                    maxWidth: "90%",
                    padding: isUser ? "12px 16px" : "8px 4px",
                    fontSize: 14,
                    borderRadius: isUser ? "16px 16px 4px 16px" : undefined,
                    background: isUser ? "rgba(99,102,241,0.15)" : "transparent",
                    border: isUser ? "1px solid rgba(99,102,241,0.2)" : "none",
                    color: isUser ? "#e0e7ff" : "#cbd5e1",
                    lineHeight: 1.7,
                }}
            >
                <div style={{
                    overflowWrap: "break-word",
                    whiteSpace: "pre-wrap",
                    overflowX: "hidden",
                }}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                            a: ({ node, ...props }) => (
                                <a style={{ color: "#818cf8", textDecoration: "underline" }} {...props} />
                            ),
                            ul: ({ node, ...props }) => (
                                <ul style={{ listStyleType: "disc", paddingLeft: 20, marginBottom: 4 }} {...props} />
                            ),
                            ol: ({ node, ...props }) => (
                                <ol style={{ paddingLeft: 20 }} {...props} />
                            ),
                            li: ({ node, ...props }) => (
                                <li style={{ marginBottom: -12 }} {...props} />
                            ),
                            p: ({ node, ...props }) => (
                                <p style={{ marginBottom: msg.role === "ai" ? 0 : undefined }} {...props} />
                            ),
                            h1: ({ node, ...props }) => (
                                <h1 style={{ fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: -16 }} {...props} />
                            ),
                            h2: ({ node, ...props }) => (
                                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e2e8f0", marginBottom: -16 }} {...props} />
                            ),
                            h3: ({ node, ...props }) => (
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e2e8f0", marginBottom: -16 }} {...props} />
                            ),
                            strong: ({ node, ...props }) => (
                                <strong style={{ fontWeight: 700, color: "#f1f5f9" }} {...props} />
                            ),
                            pre: ({ node, ...props }) => (
                                <pre style={{
                                    margin: "4px 0", padding: 8, borderRadius: 8,
                                    background: "rgba(255,255,255,0.04)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    overflowX: "auto",
                                }} {...props} />
                            ),
                            code: ({ node, ...props }) => (
                                <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "#a5b4fc" }} {...props} />
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
