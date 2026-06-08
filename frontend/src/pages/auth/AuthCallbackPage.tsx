import { getAuthUserData } from "@/api/auth"
import { useEffect } from "react"
import { LogoSvg } from "@/components/base/LogoSvg";

function AuthCallbackPage() {
  const getUserData = async () => {
    try {
      const data = await getAuthUserData()
      if (data) {
        const { _id, name, email, image, googleAccessToken } = data
        localStorage.setItem('userData', JSON.stringify({ _id, name, email, image, googleAccessToken }))
        window.location.href = '/notes'
      }
    } catch (error) {
      console.error("Failed to get auth user data:", error)
    }
  }

  useEffect(() => { getUserData() }, [])

  return (
    <div style={{
      minHeight: "100vh",
      background: "#05060d",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap');
        *{box-sizing:border-box}
        @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-70px)}}
        @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,45px)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes dotBounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-7px);opacity:1}}
      `}</style>

      {/* Orbs */}
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
      </div>

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
        backgroundImage: `linear-gradient(rgba(109,95,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(109,95,246,0.04) 1px, transparent 1px)`,
        backgroundSize: "72px 72px",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)",
      }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
        background: "rgba(10,12,23,0.88)",
        border: "1px solid rgba(109,95,246,0.4)",
        borderRadius: 20, padding: "44px 52px",
        backdropFilter: "blur(24px)",
        boxShadow: "0 0 0 1px rgba(109,95,246,0.06), 0 32px 64px rgba(0,0,0,0.55), 0 0 64px rgba(109,95,246,0.09)",
        animation: "fadeUp 0.5s ease both",
        minWidth: 300, textAlign: "center",
      }}>
        {/* Top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: "linear-gradient(90deg, transparent, #6d5ff6 40%, #a78bfa 60%, transparent)",
          borderRadius: "20px 20px 0 0",
        }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <LogoSvg size={32} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "#f0eeff", letterSpacing: "-0.4px" }}>
            Note<span style={{ color: "var(--primary-brand)" }}>Atlas</span>
          </span>
        </div>

        {/* Spinner */}
        <div style={{ position: "relative", width: 52, height: 52 }}>
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid rgba(109,95,246,0.12)",
          }} />
          <div style={{
            position: "absolute", inset: 0, borderRadius: "50%",
            border: "2px solid transparent",
            borderTopColor: "#6d5ff6",
            borderRightColor: "#a78bfa",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "linear-gradient(135deg,#6d5ff6,#a78bfa)",
              boxShadow: "0 0 8px rgba(109,95,246,0.7)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          </div>
        </div>

        {/* Text */}
        <div>
          <p style={{ fontSize: 16, fontWeight: 600, color: "#f0eeff", letterSpacing: "-0.3px", marginBottom: 6 }}>
            Authenticating
          </p>
          <p style={{ fontSize: 13, color: "#4e4872", lineHeight: 1.65 }}>
            Verifying your credentials,<br />please wait…
          </p>
        </div>

        {/* Bouncing dots */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%",
              background: "#6d5ff6",
              animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage