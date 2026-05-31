import React from "react";
import { Link, Outlet } from "react-router";
import { MoveLeft, Sparkles } from "lucide-react";

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: "#080b14",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1120; }
        ::-webkit-scrollbar-thumb { background: #312e81; border-radius: 3px; }
      `}</style>

      {/* ── Ambient orbs ── */}
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: 500, height: 500, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
        animation: "orbFloat1 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: 400, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        animation: "orbFloat2 18s ease-in-out infinite",
      }} />
      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 0%, black 40%, transparent 100%)",
      }} />

      <style>{`
        @keyframes orbFloat1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
        @keyframes orbFloat2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-30px,30px)} }
      `}</style>

      {/* ── Header ── */}
      <header style={{
        padding: "0 28px", height: 60,
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        background: "rgba(8,11,20,0.7)",
        backdropFilter: "blur(16px)",
        position: "relative", zIndex: 10,
        flexShrink: 0,
      }}>
        {/* Back button */}
        <Link
          to="/"
          style={{
            width: 34, height: 34, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748b", textDecoration: "none",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.12)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.35)";
            (e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLAnchorElement).style.color = "#64748b";
          }}
        >
          <MoveLeft size={15} />
        </Link>

        {/* Logo */}
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 14px rgba(99,102,241,0.4)",
            flexShrink: 0,
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px" }}>
            NotebookLM
          </span>
        </Link>
      </header>

      {/* ── Content ── */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px 80px",
        position: "relative", zIndex: 1,
      }}>
        <Outlet />
      </div>
    </div>
  );
}