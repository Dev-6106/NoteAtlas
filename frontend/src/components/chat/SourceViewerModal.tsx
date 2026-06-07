import React, { useState, useEffect } from "react";
import { X, FileText, Quote, Loader2, BookOpen, ExternalLink } from "lucide-react";
import { makeHttpReq } from "@/helper/makeHttpReq";
import { getUserData } from "@/helper/getUserData";

export interface Citation {
    title: string;
    docId: string;
}

interface SourceViewerModalProps {
    citations: Citation[];
    onClose: () => void;
    initialDocId?: string | null;
}

interface DocContent {
    docId: string;
    title: string;
    content: string;
    source_type?: string;
}

export const SourceViewerModal = ({ citations, onClose, initialDocId }: SourceViewerModalProps) => {
    const [activeTab, setActiveTab] = useState<"citations" | "document">("citations");
    const [selectedDocId, setSelectedDocId] = useState<string | null>(initialDocId ?? null);
    const [docContent, setDocContent] = useState<DocContent | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (selectedDocId) {
            loadDoc(selectedDocId);
            setActiveTab("document");
        }
    }, [selectedDocId]);

    const loadDoc = async (docId: string) => {
        try {
            setLoading(true);
            setDocContent(null);
            const userData = getUserData();
            const data = await makeHttpReq("GET", `notes/docs/${docId}/content?userId=${userData?._id}`) as DocContent;
            setDocContent(data);
        } catch {
            setDocContent({ docId, title: "Error", content: "Could not load document content.", source_type: undefined });
        } finally {
            setLoading(false);
        }
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
                width: 460, maxWidth: "92vw",
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
                    {(["citations", "document"] as const).map((tab) => (
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
                        }}>
                            {tab === "citations" ? <Quote size={13} /> : <FileText size={13} />}
                            {tab === "citations" ? "Citations" : "Document"}
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
                                    <div key={c.docId} style={{
                                        padding: "12px 14px",
                                        borderRadius: 12,
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border-default)",
                                        cursor: "pointer",
                                        transition: "all 0.15s",
                                    }}
                                        onClick={() => { setSelectedDocId(c.docId); setActiveTab("document"); }}
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
                                            Click to view document
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
                                    <div style={{
                                        fontSize: 13.5, color: "var(--text-2)",
                                        lineHeight: 1.75,
                                        whiteSpace: "pre-wrap",
                                        background: "var(--bg-card)",
                                        border: "1px solid var(--border-default)",
                                        borderRadius: 12,
                                        padding: "16px 18px",
                                    }}>
                                        {docContent.content}
                                    </div>
                                </div>
                            ) : (
                                <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text-4)" }}>
                                    <FileText size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
                                    <p style={{ fontSize: 13 }}>Select a citation to view its document.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};
