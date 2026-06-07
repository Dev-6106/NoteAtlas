import GoogleIcon from '@/assets/google.png'

import { T } from "@/components/ThemeTokens";

const LogoMark = ({ size = 36 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.28),
    background: "linear-gradient(135deg,#6d5ff6,#a78bfa)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 24px rgba(109,95,246,0.48)", flexShrink: 0,
  }}>
    <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 18 18" fill="none">
      <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 12.5L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" fillOpacity="0.9" />
    </svg>
  </div>
);

function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:8000/auth/google';
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      width: "100%",
      maxWidth: 420,
      fontFamily: T.fontSans,
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .la0{animation:fadeUp 0.5s 0s ease both}
        .la1{animation:fadeUp 0.5s 0.1s ease both}
        .la2{animation:fadeUp 0.5s 0.2s ease both}
        .la3{animation:fadeUp 0.5s 0.32s ease both}
        .google-btn:hover{
          background:var(--border-default) !important;
          border-color:rgba(109,95,246,0.45) !important;
          transform:translateY(-1px) !important;
          box-shadow:0 8px 24px rgba(109,95,246,0.15) !important;
        }
      `}</style>

      {/* Card */}
      <div style={{
        width: "100%",
        background: "rgba(10,12,23,0.92)",
        border: `1px solid ${T.borderAccent}`,
        borderRadius: 20,
        padding: "44px 40px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 0 0 1px rgba(109,95,246,0.06), 0 32px 72px rgba(0,0,0,0.55), 0 0 64px rgba(109,95,246,0.08)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Top accent line */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, #6d5ff6 40%, #a78bfa 60%, transparent)",
        }} />

        {/* Logo */}
        <div className="la0" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <LogoMark size={36} />
          <span style={{ fontSize: 18, fontWeight: 700, color: T.text1, letterSpacing: "-0.5px" }}>
            Note<span style={{ color: "var(--primary-brand)" }}>Atlas</span>
          </span>
        </div>

        {/* Heading */}
        <div className="la1" style={{ textAlign: "center", marginBottom: 10 }}>
          <h1 style={{
            fontSize: 24, fontWeight: 700, color: T.text1,
            letterSpacing: "-0.6px", marginBottom: 8,
            fontFamily: "'Instrument Serif', Georgia, serif",
          }}>
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: T.text3, lineHeight: 1.65 }}>
            Sign in to continue to your workspace
          </p>
        </div>

        {/* Accent divider */}
        <div className="la2" style={{
          width: 32, height: 2, margin: "20px auto 28px",
          background: "linear-gradient(90deg,#6d5ff6,#a78bfa)",
          borderRadius: 2,
        }} />

        {/* Google Button */}
        <div className="la3">
          <button
            onClick={handleGoogleLogin}
            className="google-btn"
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 11,
              padding: "13px 20px", borderRadius: 11,
              background: "var(--bg-surface)",
              border: `1px solid ${T.border}`,
              color: T.text1, fontSize: 14, fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.22s",
              fontFamily: T.fontSans,
            }}
          >
            <img src={GoogleIcon} alt="Google" width={18} height={18} style={{ flexShrink: 0 }} />
            Continue with Google
          </button>
        </div>

        {/* Separator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12, margin: "24px 0 0",
        }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <span style={{ fontSize: 11, color: T.text3, letterSpacing: "0.08em", textTransform: "uppercase" }}>Secured by OAuth 2.0</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        {/* Footer note */}
        <p style={{
          marginTop: 20, fontSize: 12, color: T.text3,
          textAlign: "center", lineHeight: 1.6,
        }}>
          By continuing, you agree to our{" "}
          <span style={{ color: "#8b80f8", cursor: "pointer" }}>Terms</span>
          {" & "}
          <span style={{ color: "#8b80f8", cursor: "pointer" }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;