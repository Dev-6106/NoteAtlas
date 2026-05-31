import { getAuthUserData } from "@/api/auth"
import { useEffect } from "react"
import { Sparkles } from "lucide-react"

function AuthCallbackPage() {

    const getUserData = async () => {
        try {
            const data = await getAuthUserData()
            console.log("Auth data received:", data)
            if (data) {
                const { _id, name, email, image, googleAccessToken, ...resProps } = data
                const user = { _id, name, email, image, googleAccessToken }
                console.log("Saving user to localStorage:", user)
                localStorage.setItem('userData', JSON.stringify(user))
                window.location.href = '/notes'
            }
        } catch (error) {
            console.error("Failed to get auth user data:", error)
        }
    }

    useEffect(() => {
        getUserData()
    }, [])

    return (
        <div style={{
            minHeight: "100vh",
            background: "#080b14",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            overflow: "hidden",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-40px)} }
                @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-28px,32px)} }
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
                @keyframes dotBounce {
                    0%,80%,100% { transform: translateY(0); opacity: 0.4; }
                    40%         { transform: translateY(-6px); opacity: 1; }
                }
            `}</style>

            {/* Orbs */}
            <div style={{
                position: "absolute", top: "-15%", left: "-10%",
                width: 500, height: 500, borderRadius: "50%", pointerEvents: "none",
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

            {/* Card */}
            <div style={{
                position: "relative", zIndex: 1,
                display: "flex", flexDirection: "column", alignItems: "center", gap: 28,
                background: "rgba(10,13,26,0.85)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 24, padding: "44px 52px",
                backdropFilter: "blur(24px)",
                boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 24px 60px rgba(0,0,0,0.55), 0 0 60px rgba(99,102,241,0.08)",
                animation: "fadeUp 0.5s ease both",
                minWidth: 300, textAlign: "center",
            }}>
                {/* Top accent */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg, transparent, #6366f1 40%, #8b5cf6 60%, transparent)",
                    borderRadius: "24px 24px 0 0",
                }} />

                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                    <div style={{
                        width: 34, height: 34, borderRadius: 10,
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 18px rgba(99,102,241,0.5)",
                    }}>
                        <Sparkles size={16} color="#fff" />
                    </div>
                    <span style={{ fontSize: 17, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.4px" }}>
                        NotebookLM
                    </span>
                </div>

                {/* Spinner ring */}
                <div style={{ position: "relative", width: 56, height: 56 }}>
                    {/* Outer ring */}
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "2px solid rgba(99,102,241,0.15)",
                    }} />
                    {/* Spinning arc */}
                    <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        border: "2px solid transparent",
                        borderTopColor: "#6366f1",
                        borderRightColor: "#8b5cf6",
                        animation: "spin 0.9s linear infinite",
                    }} />
                    {/* Center dot */}
                    <div style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <div style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                            boxShadow: "0 0 8px rgba(99,102,241,0.6)",
                            animation: "pulse 1.5s ease-in-out infinite",
                        }} />
                    </div>
                </div>

                {/* Text */}
                <div>
                    <p style={{ fontSize: 16, fontWeight: 700, color: "#f1f5f9", letterSpacing: "-0.3px", marginBottom: 6 }}>
                        Authenticating
                    </p>
                    <p style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
                        Verifying your credentials,<br />please wait…
                    </p>
                </div>

                {/* Bouncing dots */}
                <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: 6, height: 6, borderRadius: "50%",
                            background: "#6366f1",
                            animation: `dotBounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                        }} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default AuthCallbackPage