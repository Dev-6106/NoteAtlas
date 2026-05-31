import { Link } from "react-router";
import { Sparkles, MoveLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080b14",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "24px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
        @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-28px,32px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flicker {
          0%,100% { opacity: 1; text-shadow: 0 0 40px rgba(99,102,241,0.6), 0 0 80px rgba(99,102,241,0.3); }
          45%     { opacity: 0.85; text-shadow: 0 0 20px rgba(99,102,241,0.3); }
          50%     { opacity: 1; text-shadow: 0 0 60px rgba(139,92,246,0.7), 0 0 100px rgba(99,102,241,0.4); }
          95%     { opacity: 0.9; }
        }
        .anim-d0 { animation: fadeUp 0.6s 0.0s ease both; }
        .anim-d1 { animation: fadeUp 0.6s 0.15s ease both; }
        .anim-d2 { animation: fadeUp 0.6s 0.3s ease both; }
        .anim-d3 { animation: fadeUp 0.6s 0.45s ease both; }
      `}</style>

      {/* Orbs */}
      <div style={{
        position: "absolute", top: "-15%", left: "-10%",
        width: 520, height: 520, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(99,102,241,0.13) 0%, transparent 70%)",
        animation: "orbA 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: 400, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        animation: "orbB 18s ease-in-out infinite",
      }} />

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>

        {/* Logo */}
        <div className="anim-d0" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 48 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(99,102,241,0.45)",
          }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px" }}>NotebookLM</span>
        </div>

        {/* 404 */}
        <div className="anim-d1" style={{
          fontSize: "clamp(96px, 20vw, 148px)",
          fontWeight: 800,
          letterSpacing: "-6px",
          lineHeight: 1,
          color: "#f1f5f9",
          animation: "flicker 5s ease-in-out infinite",
          marginBottom: 8,
          background: "linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          404
        </div>

        {/* Divider */}
        <div className="anim-d2" style={{
          width: 48, height: 2, margin: "20px auto 28px",
          background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
          borderRadius: 2,
        }} />

        {/* Text */}
        <h1 className="anim-d2" style={{
          fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700,
          color: "#f1f5f9", letterSpacing: "-0.4px", marginBottom: 12,
        }}>
          Page Not Found
        </h1>
        <p className="anim-d2" style={{
          fontSize: 15, color: "#475569", lineHeight: 1.7, marginBottom: 36,
        }}>
          Oops! The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* CTA */}
        <div className="anim-d3">
          <Link to="/" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 12,
                background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: "#fff", fontSize: 14, fontWeight: 700,
                border: "none", cursor: "pointer",
                boxShadow: "0 8px 28px rgba(99,102,241,0.38)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 14px 36px rgba(99,102,241,0.52)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 28px rgba(99,102,241,0.38)";
              }}
            >
              <MoveLeft size={15} />
              Back to Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}