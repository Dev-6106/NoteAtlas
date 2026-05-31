import { addPaymentMethod } from "@/api/payment";
import { Loader2, WalletIcon, Zap, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "../ui/button";
import { getUserData } from "@/helper/getUserData";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "@/store";
import { togglePaymentModal } from "@/store/chatSlice";
import type { CreditMenuStateType } from "@/store/creditMenuSlice";

export const CreditMenu = ({ result }: { result: CreditMenuStateType }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { payment } = useSelector((state: RootState) => state.chat);
  const [loading, setLoading] = useState(false);
  const userData = getUserData();

  const addPayment = async () => {
    try {
      setLoading(true);
      await addPaymentMethod({ userId: userData?._id, email: userData?.email });
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

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
          background: menuOpen ? "rgba(99,102,241,0.15)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${menuOpen ? "rgba(99,102,241,0.45)" : "rgba(255,255,255,0.09)"}`,
          color: "#c7d2fe", fontSize: 13, fontWeight: 600,
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
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)";
          }
        }}
      >
        <Zap size={13} style={{ color: "#818cf8" }} />
        <span style={{ color: "#94a3b8", fontWeight: 500 }}>Credits:</span>
        <span style={{ color: "#f1f5f9" }}>{result?.credits?.toFixed(1)}</span>
        <ChevronDown
          size={13}
          style={{
            color: "#64748b",
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
          background: "rgba(10,13,26,0.97)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 16,
          boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 20px 48px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.08)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          animation: "dropIn 0.18s ease forwards",
        }}>

          {/* Top accent */}
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, #6366f1 40%, #8b5cf6 60%, transparent)",
          }} />

          {/* Credit Summary */}
          <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
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
                <Zap size={18} style={{ color: "#818cf8" }} />
              </div>
              <div>
                <p style={{ fontSize: 26, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-1px", lineHeight: 1 }}>
                  {result?.credits?.toFixed(1)}
                </p>
                <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>credit balance</p>
              </div>
            </div>
          </div>

          {/* Action Area */}
          <div style={{ padding: "16px 20px" }}>
            {result?.paymentType ? (
              <button
                onClick={() => dispatch(togglePaymentModal())}
                style={{
                  width: "100%", padding: "11px", borderRadius: 10,
                  background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                  border: "none", cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(99,102,241,0.35)",
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
            ) : (
              <button
                disabled={loading}
                onClick={addPayment}
                style={{
                  width: "100%", padding: "11px", borderRadius: 10,
                  background: loading ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.06)",
                  color: loading ? "#475569" : "#94a3b8",
                  border: "1px solid rgba(255,255,255,0.09)",
                  fontSize: 13, fontWeight: 600,
                  cursor: loading ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.3)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
                  }
                }}
                onMouseLeave={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)";
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.09)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
                  }
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                    Adding payment…
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </>
                ) : (
                  <>
                    <WalletIcon size={14} />
                    Add Payment Method
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};