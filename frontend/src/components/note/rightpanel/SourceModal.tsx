
import { BaseModal } from "@/components/base/BaseModal";
import { Button } from "@/components/ui/button";
import type { AppDispatch, RootState } from "@/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
import { closeSourceModal } from "@/store/rightPanelSlice";
import { getAudioUrl } from "@/api/notes";

const AudioPlayer = ({ storageKey }: { storageKey: string }) => {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (storageKey) {
      setLoading(true);
      getAudioUrl(storageKey).then((signedUrl) => {
        setUrl(signedUrl);
        setLoading(false);
      });
    }
  }, [storageKey]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, color: "var(--text-3)" }}>
        <span style={{
          width: 24, height: 24,
          border: "2px solid var(--border-strong)",
          borderTopColor: "var(--primary-brand)",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          display: "inline-block",
          marginRight: 12
        }} />
        Loading Audio...
      </div>
    );
  }

  if (!url) {
    return <p style={{ color: "#ef4444" }}>Failed to load audio.</p>;
  }

  return (
    <div style={{
      padding: 24,
      background: "var(--bg-card)",
      borderRadius: 16,
      border: "1px solid var(--border-strong)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16
    }}>
      <p style={{ color: "var(--text-2)", fontSize: 16, fontWeight: 600 }}>Audio Overview</p>
      <audio controls src={url} style={{ width: "100%", borderRadius: 8 }} />
    </div>
  );
};

 
const PodcastPlayer = ({ storageKey }: { storageKey: string }) => {
  const [url, setUrl] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (storageKey) {
      setLoading(true);
      getAudioUrl(storageKey).then((signedUrl) => {
        setUrl(signedUrl);
        setLoading(false);
      });
    }
  }, [storageKey]);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, color: "var(--text-3)" }}>
        <span style={{
          width: 24, height: 24,
          border: "2px solid var(--border-strong)",
          borderTopColor: "#f97316",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
          display: "inline-block",
          marginRight: 12
        }} />
        Loading Podcast...
      </div>
    );
  }

  if (!url) {
    return <p style={{ color: "#ef4444" }}>Failed to load podcast.</p>;
  }

  return (
    <div style={{
      padding: 24,
      background: "linear-gradient(135deg, rgba(249,115,22,0.06), rgba(249,115,22,0.02))",
      borderRadius: 16,
      border: "1px solid rgba(249,115,22,0.15)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 16
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: "rgba(249,115,22,0.15)",
          border: "1px solid rgba(249,115,22,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        </div>
        <p style={{ color: "var(--text-2)", fontSize: 16, fontWeight: 600, margin: 0 }}>Podcast Narration</p>
      </div>
      <audio controls src={url} style={{ width: "100%", borderRadius: 8 }} />
    </div>
  );
};


export const SourceModal = () => {
  const [open, setOpen] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const { sourceModal } = useSelector((state: RootState) => state.rightPanel);

  return (
    <div>
      <BaseModal
        open={sourceModal?.modal && !["quiz-generator", "quiz-player", "flashcard-generator", "flashcard-player"].includes(sourceModal?.source_type)}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) dispatch(closeSourceModal());
        }}
        title={sourceModal?.source_type}
        description=""
        width={800}
        height={700}
        footer={
          <>
            <button
              onClick={() => dispatch(closeSourceModal())}
              style={{
                padding: "9px 18px", borderRadius: 10,
                background: "var(--border-default)",
                border: "1px solid var(--border-strong)",
                color: "var(--text-3)", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--border-strong)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-accent)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "var(--border-default)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
              }}
            >
              Close Modal
            </button>
          </>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {sourceModal?.source_type === "podcast" ? (
            <PodcastPlayer storageKey={sourceModal?.content} />
          ) : sourceModal?.source_type === "audio-overview" ? (
            <AudioPlayer storageKey={sourceModal?.content} />
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node, ...props }) => (
                  <a style={{ color: "var(--primary-brand)", textDecoration: "underline" }} {...props} />
                ),
                ul: ({ node, ...props }) => (
                  <ul style={{ listStyleType: "disc", paddingLeft: 24, marginBottom: 8, color: "var(--text-2)" }} {...props} />
                ),
                ol: ({ node, ...props }) => (
                  <ol style={{ listStyleType: "decimal", paddingLeft: 24, marginBottom: 8, color: "var(--text-2)" }} {...props} />
                ),
                li: ({ node, ...props }) => (
                  <li style={{ marginBottom: 4, color: "var(--text-2)" }} {...props} />
                ),
                h1: ({ node, ...props }) => (
                  <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-1)", margin: "8px 0" }} {...props} />
                ),
                h2: ({ node, ...props }) => (
                  <h2 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-2)", margin: "8px 0" }} {...props} />
                ),
                h3: ({ node, ...props }) => (
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-2)", margin: "6px 0" }} {...props} />
                ),
                p: ({ node, ...props }) => (
                  <p style={{ color: "var(--text-2)", lineHeight: 1.7, marginBottom: 4 }} {...props} />
                ),
                strong: ({ node, ...props }) => (
                  <strong style={{ fontWeight: 700, color: "var(--text-1)" }} {...props} />
                ),
                pre: ({ node, ...props }) => (
                  <pre style={{
                    margin: "4px 0", padding: 12, borderRadius: 10,
                    background: "var(--bg-surface)",
                    border: "1px solid var(--border-default)",
                    overflowX: "auto",
                  }} {...props} />
                ),
                code: ({ node, ...props }) => (
                  <code style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--text-1)" }} {...props} />
                ),
              }}
            >
              {`
# ${sourceModal?.title}


  ${sourceModal?.content}
              `}
            </ReactMarkdown>
          )}
        </div>
      </BaseModal>
    </div>
  );
};
