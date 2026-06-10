import GoogleIcon from '@/assets/google.png'
import { T } from "@/components/ThemeTokens";

import { LogoSvg } from "@/components/base/LogoSvg";
import { apiUrl } from "@/config/get-env";
import { auth } from '@/config/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';

function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (isLoading) return;
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const idToken = await result.user.getIdToken(true);
      const res = await fetch(`${apiUrl}/api/v1/auth/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        const { _id, name, email, image } = data.authData;
        localStorage.setItem('userData', JSON.stringify({ _id, name, email, image }));
        window.location.href = '/notes';
      } else {
        console.error('Failed to sync user data', await res.text());
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error', error);
      setIsLoading(false);
    }
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
      userSelect: "none", // Prevent accidental blue text selection while authenticating
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        .la0{animation:fadeUp 0.5s 0s ease both}
        .la1{animation:fadeUp 0.5s 0.1s ease both}
        .la2{animation:fadeUp 0.5s 0.2s ease both}
        .la3{animation:fadeUp 0.5s 0.32s ease both}
        .google-btn:hover:not(:disabled){
          background:var(--bg-card-hover) !important;
          border-color:var(--border-accent) !important;
          transform:translateY(-1px) !important;
          box-shadow:var(--shadow-card-hover) !important;
        }
        .google-btn:focus {
          outline: none;
        }
        .google-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
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
            disabled={isLoading}
            className="google-btn"
            style={{
              width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
              padding: "14px 20px", borderRadius: 12,
              background: "var(--bg-surface)",
              border: `1px solid ${T.border}`,
              color: T.text1, fontSize: 15, fontWeight: 600,
              cursor: isLoading ? "wait" : "pointer",
              transition: "all 0.25s",
              fontFamily: T.fontSans,
            }}
          >
            {isLoading ? (
              <span className="spin" style={{ display: "inline-block", width: 20, height: 20, border: "2px solid var(--primary-mid)", borderTopColor: "var(--primary-brand)", borderRadius: "50%" }} />
            ) : (
              <img src={GoogleIcon} alt="Google" width={20} height={20} style={{ flexShrink: 0 }} />
            )}
            {isLoading ? "Authenticating..." : "Continue with Google"}
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