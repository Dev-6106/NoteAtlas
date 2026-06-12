import React, { useState, useEffect } from "react";
import { X, FileText, Quote, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { makeHttpReq } from "@/helper/makeHttpReq";
import { getUserData } from "@/helper/getUserData";
import { useParams } from "react-router";
import { getAnnotations, createAnnotation, deleteAnnotation, askAIAboutSelection } from "@/api/annotations";
import type { Annotation } from "@/api/annotations";

export interface Citation {
    title: string;
    docId: string;
    page?: number;
    lines?: string;
}

interface SourceViewerModalProps {
    citations: Citation[];
    onClose: () => void;
    initialDocId?: string | null;
    initialPage?: number;
    initialLines?: string;
}

interface DocContent {
    docId: string;
    title: string;
    content?: string;
    sourceUrl?: string;
    source_type?: string;
}

export const SourceViewerModal = ({ 
    citations, 
    onClose, 
    initialDocId, 
    initialPage, 
    initialLines 
}: SourceViewerModalProps) => {
    const [selectedDocId, setSelectedDocId] = useState<string | null>(initialDocId ?? null);
    const [activeCitation, setActiveCitation] = useState<{ page?: number; lines?: string } | null>(
        (initialPage || initialLines) ? { page: initialPage, lines: initialLines } : null
    );
    const [docContent, setDocContent] = useState<DocContent | null>(null);
    const [textContent, setTextContent] = useState<string | null>(null);
    const [fetchingText, setFetchingText] = useState(false);
    const [loading, setLoading] = useState(false);

    const { noteId } = useParams<{ noteId: string }>();
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [activeTab, setActiveTab] = useState<"citations" | "document" | "annotations">("citations");

    // Selection state
    const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);
    const [askAIQuery, setAskAIQuery] = useState("");
    const [isAskingAI, setIsAskingAI] = useState(false);
    const [showAskInput, setShowAskInput] = useState(false);

    useEffect(() => {
        if (initialDocId) {
            setSelectedDocId(initialDocId);
            setActiveCitation({ page: initialPage, lines: initialLines });
            setActiveTab("document");
        }
    }, [initialDocId, initialPage, initialLines]);

    useEffect(() => {
        if (selectedDocId) {
            loadDoc(selectedDocId);
        }
    }, [selectedDocId]);

    // Scroll to highlighted lines in plain text rendering
    useEffect(() => {
        const linesStr = activeCitation?.lines;
        const targetText = textContent || docContent?.content;
        if (activeTab === "document" && linesStr && targetText) {
            const timer = setTimeout(() => {
                const parts = linesStr.split("-");
                const firstLineNum = parseInt(parts[0].trim());
                const element = document.getElementById(`line-${firstLineNum}`);
                if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [activeTab, activeCitation, textContent, docContent]);

    const loadDoc = async (docId: string) => {
        try {
            setLoading(true);
            setDocContent(null);
            setTextContent(null);
            const userData = getUserData();
            const data = await makeHttpReq("GET", `notes/docs/${docId}/source?userId=${userData?._id}`) as DocContent;
            setDocContent(data);

            if (data.sourceUrl && data.source_type !== "pdf") {
                try {
                    setFetchingText(true);
                    const res = await fetch(data.sourceUrl);
                    if (res.ok) {
                        const txt = await res.text();
                        setTextContent(txt);
                    }
                } catch (e) {
                    console.error("Failed to fetch text content:", e);
                } finally {
                    setFetchingText(false);
                }
            }
        } catch {
            setDocContent({ docId, title: "Error", content: "Could not load document source.", source_type: undefined });
        } finally {
            setLoading(false);
        }

        // Fetch annotations
        if (noteId) {
            getAnnotations(noteId, docId).then(setAnnotations).catch(e => console.error("Failed to load annotations", e));
        }
    };

    const handleMouseUp = () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.toString().trim()) {
            if (!showAskInput) {
                setSelection(null);
            }
            return;
        }

        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // Calculate position for toolbar relative to the viewport
        // The modal is fixed, so viewport coords are fine, or we can adjust for modal container
        setSelection({
            text: sel.toString().trim(),
            top: rect.top - 40, // 40px above selection
            left: rect.left + rect.width / 2,
        });
    };

    const handleCreateAnnotation = async (type: "highlight" | "bookmark") => {
        if (!noteId || !selectedDocId || !selection) return;
        try {
            const newAnn = await createAnnotation(noteId, selectedDocId, {
                type,
                selectedText: selection.text,
            });
            setAnnotations(prev => [newAnn, ...prev]);
            setSelection(null);
        } catch (e) {
            console.error("Failed to create annotation", e);
        }
    };

    const handleAskAI = async () => {
        if (!noteId || !selectedDocId || !selection || !askAIQuery.trim()) return;
        setIsAskingAI(true);
        try {
            const newAnn = await askAIAboutSelection(noteId, selectedDocId, askAIQuery, selection.text);
            setAnnotations(prev => [newAnn, ...prev]);
            setSelection(null);
            setShowAskInput(false);
            setAskAIQuery("");
            setActiveTab("annotations"); // switch to annotations tab to see result
        } catch (e) {
            console.error("Failed to ask AI", e);
        } finally {
            setIsAskingAI(false);
        }
    };

    const isLineHighlighted = (lineNum: number) => {
        if (!activeCitation?.lines) return false;
        const parts = activeCitation.lines.split("-");
        if (parts.length === 1) {
            return lineNum === parseInt(parts[0].trim());
        }
        const from = parseInt(parts[0].trim());
        const to = parseInt(parts[1].trim());
        return lineNum >= from && lineNum <= to;
    };

    const getSourceUrlWithPage = () => {
        if (!docContent?.sourceUrl) return "";
        if (activeCitation?.page) {
            return `${docContent.sourceUrl}#page=${activeCitation.page}`;
        }
        return docContent.sourceUrl;
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0, zIndex: 9000,
                    background: "rgba(0,0,0,0.55)",
                    backdropFilter: "blur(4px)",
                }}
            />

            {/* Panel */}
            <div style={{
                position: "fixed", right: 0, top: 0, bottom: 0, zIndex: 9001,
                width: 480, maxWidth: "92vw",
                background: "var(--bg-elevated)",
                borderLeft: "1px solid var(--border-default)",
                display: "flex", flexDirection: "column",
                animation: "slideInRight 0.22s ease-out",
                boxShadow: "-8px 0 40px rgba(0,0,0,0.4)",
            }}>
                <style>{`@keyframes slideInRight{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

                {/* Header */}
                <div style={{
                    padding: "18px 20px",
                    borderBottom: "1px solid var(--border-default)",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    flexShrink: 0,
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: 9,
                            background: "var(--primary-glow)",
                            border: "1px solid var(--primary-border)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <BookOpen size={16} style={{ color: "var(--primary-brand)" }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>Sources</h3>
                            <p style={{ fontSize: 11.5, color: "var(--text-4)" }}>{citations.length} citation{citations.length !== 1 ? "s" : ""} found</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "var(--text-3)", borderRadius: 8, padding: 6,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                    }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-card)"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = "transparent"}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tab Bar */}
                <div style={{
                    display: "flex", gap: 0,
                    borderBottom: "1px solid var(--border-default)",
                    padding: "0 20px",
                    flexShrink: 0,
                }}>
                    {(["citations", "document", "annotations"] as const).map((tab) => (
                        <button key={tab} onClick={() => setActiveTab(tab)} style={{
                            padding: "10px 16px",
                            background: "transparent", border: "none",
                            borderBottom: activeTab === tab ? "2px solid var(--primary-brand)" : "2px solid transparent",
                            color: activeTab === tab ? "var(--primary-brand)" : "var(--text-3)",
                            fontSize: 13, fontWeight: 600,
                            cursor: "pointer",
                            marginBottom: -1,
                            display: "flex", alignItems: "center", gap: 6,
                            transition: "color 0.15s",
                            textTransform: "capitalize",
                        }}>
                            {tab === "citations" && <Quote size={13} />}
                            {tab === "document" && <FileText size={13} />}
                            {tab === "annotations" && <BookOpen size={13} />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
                    {activeTab === "citations" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {citations.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-4)" }}>
                                    <Quote size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <p style={{ fontSize: 13 }}>No citations in this response.</p>
                                </div>
                            ) : (
                                citations.map((c) => (
                                    <div key={`${c.docId}-${c.page}-${c.lines}`} style={{
                                        padding: "12px 14px",
                                        borderRadius: 12,
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border-default)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                        onClick={() => { 
                                            setSelectedDocId(c.docId); 
                                            setActiveCitation({ page: c.page, lines: c.lines });
                                            setActiveTab("document"); 
                                        }}
                                        onMouseEnter={e => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-accent)";
                                            (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card-hover)";
                                        }}
                                        onMouseLeave={e => {
                                            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-default)";
                                            (e.currentTarget as HTMLDivElement).style.background = "var(--bg-card)";
                                        }}
                                    >
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                <FileText size={14} style={{ color: "var(--primary-brand)", flexShrink: 0 }} />
                                                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>{c.title}</span>
                                            </div>
                                            <ExternalLink size={12} style={{ color: "var(--text-4)", flexShrink: 0 }} />
                                        </div>
                                        <p style={{ fontSize: 11.5, color: "var(--text-4)", marginTop: 4, marginLeft: 22 }}>
                                            {c.page && `Page ${c.page}`}
                                            {c.page && c.lines && ` • `}
                                            {c.lines && `Lines ${c.lines}`}
                                            {(!c.page && !c.lines) && `Click to view document`}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "document" && (
                        <div>
                            {loading ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 10, color: "var(--text-3)" }}>
                                    <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                                    <span style={{ fontSize: 13 }}>Loading document…</span>
                                </div>
                            ) : docContent ? (
                                <div>
                                    <div style={{
                                        padding: "12px 14px", borderRadius: 12,
                                        background: "var(--primary-glow)",
                                        border: "1px solid var(--primary-border)",
                                        marginBottom: 16,
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                            <FileText size={14} style={{ color: "var(--primary-brand)" }} />
                                            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)" }}>{docContent.title}</span>
                                        </div>
                                        {docContent.source_type && (
                                            <span style={{
                                                display: "inline-block", marginTop: 6, marginLeft: 22,
                                                fontSize: 11, color: "var(--text-4)",
                                                padding: "2px 8px", borderRadius: 999,
                                                background: "var(--bg-elevated)",
                                                border: "1px solid var(--border-default)",
                                                textTransform: "uppercase", letterSpacing: "0.06em"
                                            }}>
                                                {docContent.source_type}
                                            </span>
                                        )}
                                    </div>
                                    {docContent.source_type === "pdf" && docContent.sourceUrl ? (
                                        <div style={{
                                            height: "calc(100vh - 200px)", minHeight: 400,
                                            background: "var(--bg-card)",
                                            border: "1px solid var(--border-default)",
                                            borderRadius: 12,
                                            overflow: "hidden",
                                        }}>
                                            <iframe
                                                key={getSourceUrlWithPage()}
                                                src={getSourceUrlWithPage()}
                                                style={{ width: "100%", height: "100%", border: "none" }}
                                                title={docContent.title}
                                            />
                                        </div>
                                    ) : fetchingText ? (
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", gap: 10, color: "var(--text-3)" }}>
                                            <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} />
                                            <span style={{ fontSize: 13 }}>Fetching text content…</span>
                                        </div>
                                    ) : (textContent || docContent.content) ? (
                                        <div
                                            onMouseUp={handleMouseUp}
                                            style={{
                                            fontSize: 13, color: "var(--text-2)",
                                            lineHeight: 1.75,
                                            background: "var(--bg-card)",
                                            border: "1px solid var(--border-default)",
                                            borderRadius: 12,
                                            padding: "16px 18px",
                                            maxHeight: "calc(100vh - 200px)",
                                            overflowY: "auto",
                                        }}>
                                            {(textContent || docContent.content || "").split("\n").map((line, idx) => {
                                                const lineNum = idx + 1;
                                                const isHighlighted = isLineHighlighted(lineNum);
                                                return (
                                                    <div 
                                                        key={lineNum} 
                                                        id={`line-${lineNum}`}
                                                        style={{
                                                            background: isHighlighted ? "rgba(234, 179, 8, 0.15)" : "transparent",
                                                            borderLeft: isHighlighted ? "3px solid var(--primary-brand)" : "3px solid transparent",
                                                            paddingLeft: 8,
                                                            display: "flex",
                                                            gap: 12,
                                                            transition: "background 0.3s ease",
                                                        }}
                                                    >
                                                        <span style={{ color: "var(--text-4)", width: 24, textAlign: "right", userSelect: "none" }}>{lineNum}</span>
                                                        <span>{line}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-4)" }}>
                                            <p style={{ fontSize: 13 }}>No content available for this document.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-4)" }}>
                                    <FileText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <p style={{ fontSize: 13 }}>Select a citation to view its document.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === "annotations" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            {!selectedDocId ? (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-4)" }}>
                                    <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <p style={{ fontSize: 13 }}>Select a citation or document to view its annotations.</p>
                                </div>
                            ) : annotations.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-4)" }}>
                                    <BookOpen size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <p style={{ fontSize: 13 }}>No annotations yet.</p>
                                    <p style={{ fontSize: 12, marginTop: 4 }}>Select text in the Document tab to add notes.</p>
                                </div>
                            ) : (
                                annotations.map((ann) => (
                                    <div key={ann._id} style={{
                                        padding: "12px 14px",
                                        borderRadius: 12,
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border-default)",
                                        display: "flex", flexDirection: "column", gap: 8
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                            <span style={{ 
                                                fontSize: 11, fontWeight: 600, color: "var(--text-3)",
                                                textTransform: "uppercase", letterSpacing: "0.05em",
                                                display: "flex", alignItems: "center", gap: 4
                                            }}>
                                                {ann.type === "highlight" && <FileText size={12} />}
                                                {ann.type === "bookmark" && <BookOpen size={12} />}
                                                {ann.type === "question" && <Quote size={12} />}
                                                {ann.type}
                                            </span>
                                        </div>
                                        {ann.selectedText && (
                                            <div style={{
                                                padding: "8px 10px", borderRadius: 8,
                                                background: "var(--bg-base)", borderLeft: "3px solid var(--primary-brand)",
                                                fontSize: 12, color: "var(--text-2)", fontStyle: "italic"
                                            }}>
                                                "{ann.selectedText}"
                                            </div>
                                        )}
                                        {ann.aiResponse && (
                                            <div style={{ fontSize: 13, color: "var(--text-1)", marginTop: 4, lineHeight: 1.5 }}>
                                                <strong>AI:</strong> {ann.aiResponse}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Floating Selection Toolbar */}
            {selection && (
                <div style={{
                    position: "fixed",
                    top: selection.top,
                    left: selection.left,
                    transform: "translateX(-50%)",
                    zIndex: 9002,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    alignItems: "center",
                    animation: "slideUp 0.15s ease-out",
                }}>
                    <style>{`@keyframes slideUp{from{opacity:0;transform:translate(-50%, 10px)}to{opacity:1;transform:translate(-50%, 0)}}`}</style>
                    <div style={{
                        display: "flex",
                        background: "var(--bg-elevated)",
                        border: "1px solid var(--border-default)",
                        borderRadius: 12,
                        padding: 4,
                        boxShadow: "var(--shadow-lg)",
                        backdropFilter: "blur(12px)",
                    }}>
                        <button onClick={() => handleCreateAnnotation("highlight")} style={{
                            background: "transparent", border: "none", cursor: "pointer",
                            padding: "6px 10px", borderRadius: 8,
                            color: "var(--text-1)", fontSize: 12, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <FileText size={14} /> Highlight
                        </button>
                        <button onClick={() => handleCreateAnnotation("bookmark")} style={{
                            background: "transparent", border: "none", cursor: "pointer",
                            padding: "6px 10px", borderRadius: 8,
                            color: "var(--text-1)", fontSize: 12, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <BookOpen size={14} /> Bookmark
                        </button>
                        <button onClick={() => setShowAskInput(true)} style={{
                            background: "transparent", border: "none", cursor: "pointer",
                            padding: "6px 10px", borderRadius: 8,
                            color: "var(--primary-brand)", fontSize: 12, fontWeight: 600,
                            display: "flex", alignItems: "center", gap: 6,
                        }}>
                            <Quote size={14} /> Ask AI
                        </button>
                    </div>

                    {showAskInput && (
                        <div style={{
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-default)",
                            borderRadius: 12,
                            padding: 8,
                            boxShadow: "var(--shadow-lg)",
                            display: "flex",
                            gap: 8,
                            width: 280,
                        }}>
                            <input
                                autoFocus
                                value={askAIQuery}
                                onChange={e => setAskAIQuery(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleAskAI()}
                                placeholder="Ask about this selection..."
                                style={{
                                    flex: 1, background: "var(--bg-base)", border: "1px solid var(--border-default)",
                                    borderRadius: 8, padding: "6px 10px", color: "var(--text-1)", fontSize: 12,
                                    outline: "none"
                                }}
                            />
                            <button
                                onClick={handleAskAI}
                                disabled={isAskingAI || !askAIQuery.trim()}
                                style={{
                                    background: "var(--primary-brand)", color: "#fff", border: "none",
                                    borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 600,
                                    cursor: "pointer", opacity: (isAskingAI || !askAIQuery.trim()) ? 0.5 : 1
                                }}
                            >
                                {isAskingAI ? <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> : "Ask"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
};
