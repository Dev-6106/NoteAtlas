import { Loader2, WalletIcon, Zap, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { togglePaymentModal } from "@/store/chatSlice";
import type { CreditMenuStateType } from "@/store/creditMenuSlice";

export const CreditMenu = ({ result }: { result: CreditMenuStateType }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [result]);

  return (
    <div style={{ position: "relative", fontFamily: "'DM Sans', system-ui, sans-serif" }} ref={menuRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Trigger Button ── */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "7px 14px", borderRadius: 10,
          background: menuOpen ? "var(--primary-glow)" : "var(--primary-mid)",
          border: `1px solid ${menuOpen ? "var(--primary-border)" : "var(--border-strong)"}`,
          color: "var(--text-2)", fontSize: 13, fontWeight: 600,
          cursor: "pointer", transition: "all 0.2s",
          backdropFilter: "blur(8px)",
          boxShadow: menuOpen ? "0 0 16px rgba(99,102,241,0.2)" : "none",
        }}
        onMouseEnter={e => {
          if (!menuOpen) {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.3)";
          }
        }}
        onMouseLeave={e => {
          if (!menuOpen) {
            (e.currentTarget as HTMLButtonElement).style.background = "var(--primary-mid)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
          }
        }}
      >
        <Zap size={13} style={{ color: "var(--primary-brand)" }} />
        <span className="cm-hide-mobile" style={{ color: "var(--text-3)", fontWeight: 500 }}>Credits:</span>
        <span style={{ color: "var(--text-1)" }}>{result?.credits?.toFixed(1)}</span>
        <ChevronDown
          size={13}
          style={{
            color: "var(--text-3)",
            transform: menuOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* ── Dropdown Panel ── */}
      {menuOpen && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 8px)",
          width: 260, zIndex: 200,
          background: "var(--bg-elevated)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 16,
          boxShadow: "0 0 0 1px var(--primary-border), 0 20px 48px rgba(0,0,0,0.6), var(--shadow-primary)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          animation: "dropIn 0.18s ease forwards",
        }}>

          {/* Top accent */}
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, var(--primary-brand) 40%, var(--primary-light) 60%, transparent)",
          }} />

          {/* Credit Summary */}
          <div style={{ padding: "18px 20px", borderBottom: "1px solid var(--border-default)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-4)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
              Available Credits
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* Icon badge */}
              <div style={{
                width: 40, height: 40, borderRadius: 11,
                background: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <Zap size={18} style={{ color: "var(--primary-brand)" }} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1px", lineHeight: 1 }}>
                  {result?.credits?.toFixed(1)}
                </p>
                <p style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>credit balance</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div style={{ padding: "16px 20px" }}>
            <button
              onClick={() => { setMenuOpen(false); dispatch(togglePaymentModal()); }}
              style={{
                width: "100%", padding: "11px", borderRadius: 10,
                background: "linear-gradient(135deg, var(--primary-brand), var(--primary-light))",
                color: "var(--text-on-primary)", fontSize: 13, fontWeight: 700,
                border: "none", cursor: "pointer",
                boxShadow: "var(--shadow-primary)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "0.85";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.opacity = "1";
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              }}
            >
              <Zap size={14} />
              Buy Credits
            </button>
          </div>
        </div>
      )}
    </div>
  );
};