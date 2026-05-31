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

  return (
    <div style={{ position: "relative", padding: "8px 16px" }}>
      <style>{`
        .suggested-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {showArrows && (
        <button
          onClick={() => scroll(-1)}
          style={{
            position: "absolute", left: 4, top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: 28, height: 28, borderRadius: "50%",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#818cf8", cursor: "pointer", transition: "all 0.2s",
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowLeft />
        </button>
      )}

      <div
        ref={chipsRef}
        className="suggested-scroll"
        style={{
          display: "flex", gap: 8,
          overflowX: "auto", padding: "0 24px",
        }}
      >
        {questions?.map((q, i) => (
          <button
            key={i}
            onClick={() => selectQuestion(q)}
            style={{
              whiteSpace: "nowrap", borderRadius: 999,
              padding: "7px 14px", fontSize: 13, fontWeight: 500,
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8", cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
              (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
              (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
            }}
          >
            {q}
          </button>
        ))}
      </div>

      {showArrows && (
        <button
          onClick={() => scroll(1)}
          style={{
            position: "absolute", right: 4, top: "50%", transform: "translateY(-50%)",
            zIndex: 10, width: 28, height: 28, borderRadius: "50%",
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(99,102,241,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#818cf8", cursor: "pointer", transition: "all 0.2s",
            backdropFilter: "blur(8px)",
          }}
        >
          <ArrowRight />
        </button>
      )}
    </div>
  );
}

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 24 24">
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
  <svg width="14" height="14" viewBox="0 0 24 24">
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
