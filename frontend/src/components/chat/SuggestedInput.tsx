"use client";

import { useEffect, useRef, useState } from "react";

export function SuggestedInput({
  questions,
  selectQuestion,
}: {
  questions: string[];
  selectQuestion: (question: string) => void;
}) {
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;

    const check = () => {
      setShowArrows(el.scrollWidth > el.clientWidth + 4);
    };

    check();
    window.addEventListener("resize", check);

    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", check);
      mo.disconnect();
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    chipsRef.current?.scrollBy({
      left: dir * Math.max(200, chipsRef.current.clientWidth * 0.6),
      behavior: "smooth",
    });
  };

  if (!questions?.length) return null;

  return (
    <div style={{ position: "relative", padding: "10px 0 4px" }}>
      {/* Left arrow */}
      {showArrows && (
        <button
          onClick={() => scroll(-1)}
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-3)",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
          <ArrowLeft />
        </button>
      )}

      {/* Chips container */}
      <div
        ref={chipsRef}
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          scrollbarWidth: "none",
          padding: showArrows ? "0 32px" : "0 2px",
          msOverflowStyle: "none",
        }}
      >
        <style>{`
          .suggested-chips-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        {questions.map((q, i) => (
          <SuggestionChip
            key={i}
            text={q}
            onClick={() => selectQuestion(q)}
          />
        ))}
      </div>

      {/* Right arrow */}
      {showArrows && (
        <button
          onClick={() => scroll(1)}
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 10,
            width: 28,
            height: 28,
            borderRadius: "50%",
            border: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-3)",
            transition: "all 0.2s",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
          <ArrowRight />
        </button>
      )}
    </div>
  );
}

/* ── Suggestion chip ── */
const SuggestionChip = ({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      whiteSpace: "nowrap",
      borderRadius: 20,
      padding: "6px 14px",
      fontSize: 12,
      fontWeight: 500,
      border: "1px solid var(--border-default)",
      background: "transparent",
      color: "var(--text-2)",
      cursor: "pointer",
      transition: "all 0.2s",
      flexShrink: 0,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--border-accent)";
      e.currentTarget.style.background = "var(--primary-glow)";
      e.currentTarget.style.color = "var(--primary-brand)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border-default)";
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "var(--text-2)";
    }}
  >
    {text}
  </button>
);

/* ── Arrow icons ── */
const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);