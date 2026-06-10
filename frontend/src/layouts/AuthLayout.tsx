import { Link, Outlet } from "react-router";
import { MoveLeft } from "lucide-react";

import { T } from "@/components/ThemeTokens";
import { LogoSvg } from "@/components/base/LogoSvg";

export default function AuthLayout() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      background: T.bg,
      fontFamily: T.fontSans,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#080a12}
        ::-webkit-scrollbar-thumb{background:#2d2760;border-radius:3px}
        @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-70px)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,45px)}}
        @keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(35px,55px)}}
      `}</style>

      {/* Mesh orbs */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-15%", left: "-8%", width: 700, height: 700, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(109,95,246,0.13) 0%, transparent 65%)",
          filter: "blur(40px)", animation: "orb1 14s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", bottom: "-5%", right: "-5%", width: 550, height: 550, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,112,246,0.09) 0%, transparent 65%)",
          filter: "blur(40px)", animation: "orb2 17s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", top: "38%", right: "22%", width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(78,58,180,0.07) 0%, transparent 65%)",
          filter: "blur(30px)", animation: "orb3 21s ease-in-out infinite",
        }} />
      </div>

      {/* Grid lines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(rgba(109,95,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(109,95,246,0.04) 1px, transparent 1px)`,
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 50%, black 30%, transparent 100%)",
      }} />

      {/* Header */}
      <header style={{
        padding: "0 32px", height: 60, zIndex: 10, position: "relative",
        display: "flex", alignItems: "center", gap: 12,
        borderBottom: `1px solid ${T.border}`,
        background: T.glassBg,
        backdropFilter: "blur(20px)",
        flexShrink: 0,
      }}>
        <Link
          to="/"
          style={{
            width: 34, height: 34, borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--bg-surface)",
            border: `1px solid ${T.border}`,
            color: T.text3, textDecoration: "none",
            transition: "all 0.2s", flexShrink: 0,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "rgba(109,95,246,0.12)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(109,95,246,0.4)";
            (e.currentTarget as HTMLAnchorElement).style.color = "#a78bfa";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-surface)";
            (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
            (e.currentTarget as HTMLAnchorElement).style.color = T.text3;
          }}
        >
          <MoveLeft size={14} />
        </Link>

        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
          <LogoSvg size={36} />
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text1, letterSpacing: "-0.4px", fontFamily: T.fontSans }}>
            Note<span style={{ color: "#3b82f6" }}>Atlas</span>
          </span>
        </Link>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 24px 80px",
        position: "relative", zIndex: 1,
      }}>
        <Outlet />
      </div>
    </div>
  );
}