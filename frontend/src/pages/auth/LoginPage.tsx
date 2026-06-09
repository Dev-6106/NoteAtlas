import GoogleIcon from '@/assets/google.png'
import { T } from "@/components/ThemeTokens";

import { LogoSvg } from "@/components/base/LogoSvg";

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      minHeight: "100vh",
      background: T.bg,
      fontFamily: T.fontSans,
      padding: 24,
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .la0{animation:fadeUp 0.5s 0s ease both}
        .la1{animation:fadeUp 0.5s 0.1s ease both}
        .la2{animation:fadeUp 0.5s 0.2s ease both}
        .la3{animation:fadeUp 0.5s 0.32s ease both}
        .google-btn:hover{
          background:var(--bg-card-hover) !important;
          border-color:var(--border-accent) !important;
          transform:translateY(-1px) !important;
          box-shadow:var(--shadow-card-hover) !important;
        }
      `}</style>

      {/* Decorative Background Glow */}
      <div style={{
        position: "absolute",
        top: "30%", left: "50%",
        width: "60vw", height: "60vw",
        maxWidth: 800, maxHeight: 800,
        background: "radial-gradient(circle, var(--primary-mid) 0%, transparent 70%)",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      {/* Card */}
      <div style={{
        width: "100%",
        maxWidth: 440,
        background: "var(--bg-card)",
        border: `1px solid ${T.borderDefault}`,
        borderRadius: 24,
        padding: "48px 40px",
        backdropFilter: "blur(24px)",
        boxShadow: "var(--shadow-xl)",
        position: "relative",
        zIndex: 10,
        overflow: "hidden",
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, var(--primary-brand) 40%, var(--primary-light) 60%, transparent)",
        }} />

        {/* Logo */}
        <div className="la0" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 36 }}>
          <LogoSvg size={48} />
          <span style={{ fontSize: 22, fontWeight: 700, color: T.text1, letterSpacing: "-0.5px" }}>
            Note<span style={{ color: "var(--primary-light)" }}>Atlas</span>
          </span>
        </div>

        {/* Heading */}
        <div className="la1" style={{ textAlign: "center", marginBottom: 12 }}>
          <h1 style={{
            fontSize: 28, fontWeight: 700, color: T.text1,
            letterSpacing: "-0.8px", marginBottom: 10,
            fontFamily: "'Instrument Serif', Georgia, serif",
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 15, color: T.text3, lineHeight: 1.65 }}>
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Accent divider */}
        <div className="la2" style={{
          width: 40, height: 3, margin: "24px auto 32px",
          background: "linear-gradient(90deg, var(--primary-brand), var(--primary-light))",
          borderRadius: 2,
        }} />

        {/* Google Button */}
        <div className="la3">
          <button
            onClick={handleGoogleLogin}
            className="google-btn"
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "14px 20px", borderRadius: 12,
              background: "var(--bg-surface)",
              border: `1px solid ${T.border}`,
              color: T.text1, fontSize: 15, fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.25s",
              fontFamily: T.fontSans,
            }}
          >
            <img src={GoogleIcon} alt="Google" width={20} height={20} style={{ flexShrink: 0 }} />
            Continue with Google
          </button>
        </div>

        {/* Separator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 14, margin: "28px 0 0",
        }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.text3, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600 }}>Secured by OAuth 2.0</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 24, fontSize: 13, color: T.text3,
          textAlign: "center", lineHeight: 1.6,
        }}>
          By continuing, you agree to our{" "}
          <span style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: 500, textDecoration: "underline", textDecorationColor: "var(--border-default)" }}>Terms</span>
          {" & "}
          <span style={{ color: "var(--primary-light)", cursor: "pointer", fontWeight: 500, textDecoration: "underline", textDecorationColor: "var(--border-default)" }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;