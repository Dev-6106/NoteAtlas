import { Link } from "react-router";
import { MoveLeft } from "lucide-react";
import { LogoSvg } from "@/components/base/LogoSvg";

export default function NotFoundPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      fontFamily: "var(--font-sans)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      padding: "24px",
    }}>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
        @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-28px,32px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes flicker {
          0%,100% { opacity: 1; text-shadow: 0 0 40px var(--primary-glow), 0 0 80px var(--primary-glow); }
          45%     { opacity: 0.85; text-shadow: 0 0 20px var(--primary-glow); }
          50%     { opacity: 1; text-shadow: 0 0 60px var(--primary-brand), 0 0 100px var(--primary-light); }
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
        background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
        animation: "orbA 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", bottom: "-10%", right: "-5%",
        width: 400, height: 400, borderRadius: "50%", pointerEvents: "none",
        background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
        animation: "orbB 18s ease-in-out infinite",
      }} />

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(var(--primary-glow) 1px, transparent 1px),
          linear-gradient(90deg, var(--primary-glow) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, textAlign: "center", maxWidth: 480 }}>

        {/* Logo */}
        <div className="anim-d0" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 9, marginBottom: 48 }}>
          <LogoSvg size={38} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>NoteAtlas</span>
        </div>

        {/* 404 */}
        <div className="anim-d1" style={{
          fontSize: "clamp(96px, 20vw, 148px)",
          fontWeight: 800,
          letterSpacing: "-6px",
          lineHeight: 1,
          color: "var(--text-1)",
          animation: "flicker 5s ease-in-out infinite",
          marginBottom: 8,
          background: "linear-gradient(135deg, var(--text-1) 0%, var(--primary-brand) 40%, var(--primary-light) 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          404
        </div>

        {/* Divider */}
        <div className="anim-d2" style={{
          width: 48, height: 2, margin: "20px auto 28px",
          background: "linear-gradient(90deg, var(--primary-brand), var(--primary-light))",
          borderRadius: 2,
        }} />

        {/* Text */}
        <h1 className="anim-d2" style={{
          fontSize: "clamp(18px, 3vw, 22px)", fontWeight: 700,
          color: "var(--text-1)", letterSpacing: "-0.4px", marginBottom: 12,
        }}>
          Page Not Found
        </h1>
        <p className="anim-d2" style={{
          fontSize: 15, color: "var(--text-4)", lineHeight: 1.7, marginBottom: 36,
        }}>
          Oops! The page you're looking for doesn't exist or may have been moved.
        </p>

        {/* CTA */}
        <div className="anim-d3">
          <Link to="/" style={{ textDecoration: "none" }}>
            <button
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "16px 36px", borderRadius: 14,
                background: "linear-gradient(135deg, var(--primary-brand), var(--primary-light))",
                color: "var(--text-on-primary)", fontSize: 15, fontWeight: 700,
                border: "none", cursor: "pointer",
                boxShadow: "var(--shadow-primary)",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-primary-lg)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-primary)";
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