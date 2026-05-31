import GoogleIcon from '@/assets/google.png'
import { Sparkles } from 'lucide-react'

function LoginPage() {
    const handleGoogleLogin = () => {
        window.location.href = 'http://localhost:8000/auth/google'
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 420,
            fontFamily: "'DM Sans', system-ui, sans-serif",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
                .login-anim-0 { animation: fadeUp 0.55s 0.0s ease both; }
                .login-anim-1 { animation: fadeUp 0.55s 0.1s ease both; }
                .login-anim-2 { animation: fadeUp 0.55s 0.2s ease both; }
                .login-anim-3 { animation: fadeUp 0.55s 0.32s ease both; }
            `}</style>

            {/* Card */}
            <div style={{
                width: "100%",
                background: "rgba(10,13,26,0.92)",
                border: "1px solid rgba(99,102,241,0.2)",
                borderRadius: 24,
                padding: "44px 40px",
                backdropFilter: "blur(24px)",
                boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 24px 64px rgba(0,0,0,0.55), 0 0 60px rgba(99,102,241,0.07)",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Top accent line */}
                <div style={{
                    position: "absolute", top: 0, left: 0, right: 0, height: 2,
                    background: "linear-gradient(90deg, transparent, #6366f1 40%, #8b5cf6 60%, transparent)",
                }} />

                {/* Logo mark */}
                <div className="login-anim-0" style={{
                    display: "flex", alignItems: "center", justifyContent: "center",
                    gap: 9, marginBottom: 32,
                }}>
                    <div style={{
                        width: 38, height: 38, borderRadius: 11,
                        background: "linear-gradient(135deg,#6366f1,#8b5cf6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        boxShadow: "0 0 20px rgba(99,102,241,0.5)",
                    }}>
                        <Sparkles size={17} color="#fff" />
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#f1f5f9", letterSpacing: "-0.5px" }}>
                        NotebookLM
                    </span>
                </div>

                {/* Heading */}
                <div className="login-anim-1" style={{ textAlign: "center", marginBottom: 28 }}>
                    <h1 style={{
                        fontSize: 26, fontWeight: 800, color: "#f1f5f9",
                        letterSpacing: "-0.6px", marginBottom: 8,
                    }}>
                        Welcome back
                    </h1>
                    <p style={{ fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
                        Sign in to continue to your account
                    </p>
                </div>

                {/* Divider */}
                <div className="login-anim-2" style={{
                    width: 36, height: 2, margin: "0 auto 28px",
                    background: "linear-gradient(90deg,#6366f1,#8b5cf6)",
                    borderRadius: 2,
                }} />

                {/* Google Button */}
                <div className="login-anim-3">
                    <button
                        onClick={handleGoogleLogin}
                        style={{
                            width: "100%",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 11,
                            padding: "13px 20px", borderRadius: 13,
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            color: "#e2e8f0", fontSize: 14, fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            backdropFilter: "blur(8px)",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.09)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.4)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 20px rgba(99,102,241,0.12)";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                        }}
                    >
                        <img src={GoogleIcon} alt="Google" width={18} height={18} style={{ flexShrink: 0 }} />
                        Continue with Google
                    </button>
                </div>

                {/* Footer note */}
                <p style={{
                    marginTop: 24, fontSize: 12, color: "#334155",
                    textAlign: "center", lineHeight: 1.6,
                }}>
                    By signing in, you agree to our{" "}
                    <span style={{ color: "#6366f1", cursor: "pointer" }}>Terms</span>
                    {" & "}
                    <span style={{ color: "#6366f1", cursor: "pointer" }}>Privacy Policy</span>
                </p>
            </div>
        </div>
    )
}

export default LoginPage