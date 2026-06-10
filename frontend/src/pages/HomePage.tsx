import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { openPaymentModal } from "@/store/chatSlice";
import { useState, useEffect, useRef } from "react";
import { Menu, X, CheckSquare, Clock, LayoutGrid, CalendarDays, Brain, Folder, FileText, FileAudio, Youtube, Zap, BookOpen, Mic, Lock, MessageSquare, Search, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserData } from "@/helper/getUserData";
import { LogoSvg } from "@/components/base/LogoSvg";
import UserAvatar from "@/components/base/UserAvatar";

import { DottedBg } from "@/components/base/DottedBg";

// ─── Floating Widgets ────────────────────────────────────────────────────────
const StickyNoteWidget = () => (
  <div className="float-widget" style={{
    position: "absolute", top: "15%", left: "5%",
    width: 230, padding: 26,
    background: "linear-gradient(135deg, #fef08a 0%, #fde047 100%)", // Richer yellow
    borderRadius: 6,
    boxShadow: "2px 12px 36px rgba(0,0,0,0.15), inset 0 0 40px rgba(255,255,255,0.4)",
    transform: "rotate(-4deg)",
    zIndex: 10,
    fontFamily: "'Caveat', cursive, sans-serif",
    color: "#422006", // dark brown
  }}>
    <div style={{ position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: "#ef4444", boxShadow: "inset -2px -2px 6px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)" }} />
    <p style={{ fontSize: 20, lineHeight: 1.3 }}>Generate study guides, summaries, and instant answers from any uploaded document.</p>
    
    {/* Floating icon over sticky */}
    <div className="fw-sticky-icon" style={{
      position: "absolute", bottom: -28, left: -28,
      width: 68, height: 68, borderRadius: 18,
      background: "var(--bg-card)", border: "1px solid var(--border-default)",
      boxShadow: "0 16px 40px rgba(0,0,0,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: "rotate(12deg)",
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #3b82f6, #2563eb)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "inset 0 2px 4px rgba(255,255,255,0.2)" }}>
        <BookOpen size={20} color="white" strokeWidth={2.5} />
      </div>
    </div>
  </div>
);

const RemindersWidget = () => (
  <div className="float-widget delay-1" style={{
    position: "absolute", top: "18%", right: "8%",
    width: 270,
    background: "var(--glass-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: "1px solid var(--border-default)", borderRadius: 24,
    boxShadow: "0 24px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset",
    padding: "22px", zIndex: 10,
    transform: "rotate(3deg)",
  }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)" }}>AI Insights</span>
      <span style={{ fontSize: 11, color: "var(--text-4)" }}>Analysis</span>
    </div>
    
    <div style={{ background: "var(--bg-surface)", borderRadius: 12, padding: 16, border: "1px solid var(--border-subtle)" }}>
      <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 4 }}>Q3 Market Research</p>
      <p style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 12 }}>Revenue increased by 14%...</p>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "var(--primary-glow)", padding: "4px 10px", borderRadius: 6 }}>
        <Zap size={12} color="var(--primary-brand)" />
        <span style={{ fontSize: 11, fontWeight: 600, color: "var(--primary-brand)" }}>7 sec read</span>
      </div>
    </div>

    {/* Floating clock over reminders */}
    <div className="fw-reminders-icon" style={{
      position: "absolute", top: 40, left: -44,
      width: 76, height: 76, borderRadius: 22,
      background: "var(--bg-card)", border: "1px solid var(--border-default)",
      boxShadow: "0 20px 40px rgba(0,0,0,0.12), inset 0 2px 4px rgba(255,255,255,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      transform: "rotate(-10deg)",
    }}>
      <Brain size={38} color="#8b5cf6" strokeWidth={1.5} />
    </div>
  </div>
);

const TasksWidget = () => (
  <div className="float-widget delay-2" style={{
    position: "absolute", bottom: "10%", left: "12%",
    width: 330,
    background: "var(--glass-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: "1px solid var(--border-default)", borderRadius: 24,
    boxShadow: "0 24px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset",
    padding: "26px", zIndex: 10,
  }}>
    <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>Processing</h3>
    
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Task 1 */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700 }}>PDF</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", flex: 1 }}>Biology Chapter 4.pdf</span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>100%</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: "var(--text-4)" }}>Ready</span>
          <div style={{ flex: 1, height: 4, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: "100%", height: "100%", background: "var(--primary-brand)", borderRadius: 2 }} />
          </div>
        </div>
      </div>
      
      {/* Task 2 */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: "#8b5cf6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "white", fontWeight: 700 }}>MP3</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-1)", flex: 1 }}>Lecture Audio.mp3</span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>Parsing</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 10, color: "var(--text-4)" }}>Analyzing</span>
          <div style={{ flex: 1, height: 4, background: "var(--border-subtle)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: "65%", height: "100%", background: "#8b5cf6", borderRadius: 2 }} />
          </div>
        </div>
      </div>
    </div>
  </div>
);

const IntegrationsWidget = () => (
  <div className="float-widget delay-3" style={{
    position: "absolute", bottom: "15%", right: "10%",
    width: 290,
    background: "var(--glass-bg)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
    border: "1px solid var(--border-default)", borderRadius: 24,
    boxShadow: "0 24px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.5) inset",
    padding: "26px", zIndex: 10,
    transform: "rotate(-2deg)",
  }}>
    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-1)", marginBottom: 20 }}>Supported Formats</h3>
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      {/* App 1 */}
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.06)", transform: "rotate(-5deg)" }}>
        <FileText size={32} color="#ef4444" strokeWidth={1.5} />
      </div>
      {/* App 2 */}
      <div style={{ width: 72, height: 72, borderRadius: 18, background: "var(--bg-card)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 12px 24px rgba(0,0,0,0.08)", zIndex: 2 }}>
        <Youtube size={36} color="#ef4444" strokeWidth={1.5} />
      </div>
      {/* App 3 */}
      <div style={{ width: 64, height: 64, borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-default)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 20px rgba(0,0,0,0.06)", transform: "rotate(8deg)" }}>
        <Mic size={28} color="#8b5cf6" strokeWidth={1.5} />
      </div>
    </div>
  </div>
);

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div style={{ height: 1, background: `linear-gradient(90deg, transparent, var(--border-default), transparent)`, margin: "0 auto", width: "100%" }} />;

// ─── Feature icon block ───────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay = 0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      className={`fade-up delay-${Math.min(delay / 100, 3) * 100}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "28px 24px",
        borderRadius: 20,
        border: `1px solid ${hover ? "var(--border-strong)" : "var(--border-default)"}`,
        background: hover ? "var(--bg-surface)" : "var(--bg-card)",
        backdropFilter: "blur(12px)",
        transition: "all 0.3s ease",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "0 12px 32px rgba(0,0,0,0.06)" : "none",
        cursor: "default",
      }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))",
        border: `1px solid rgba(139, 92, 246, 0.2)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, marginBottom: 20,
        color: "var(--primary-brand)",
      }}>
        {icon}
      </div>
      <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--text-3)", fontSize: 14, lineHeight: 1.7 }}>{desc}</p>
    </div>
  );
};

// ─── Pricing Card ─────────────────────────────────────────────────────────────
const PricingCard = ({ tier, price, period, desc, features, cta, featured = false, badge, user }: {
  tier: string; price: string; period: string; desc: string; features: string[]; cta: string; featured?: boolean; badge?: string; user?: any;
}) => {
  const [hover, setHover] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleCTA = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user) {
      dispatch(openPaymentModal());
      navigate("/notes");
    } else {
      navigate("/auth/login");
    }
  };

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="fade-up delay-100"
      style={{
        position: "relative",
        padding: "36px 32px",
        borderRadius: 24,
        border: featured
          ? `1px solid var(--border-strong)`
          : `1px solid ${hover ? "var(--border-strong)" : "var(--border-default)"}`,
        background: featured
          ? "linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-card) 100%)"
          : "var(--bg-card)",
        backdropFilter: "blur(16px)",
        transform: featured ? "scale(1.02)" : hover ? "translateY(-3px)" : "scale(1)",
        boxShadow: featured
          ? "0 24px 48px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.4)"
          : hover ? "0 12px 32px rgba(0,0,0,0.06)" : "none",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
      }}
    >
      {badge && (
        <div style={{
          position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
          color: "white", fontSize: 10.5, fontWeight: 700, padding: "4px 14px",
          borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase",
          boxShadow: "0 4px 14px rgba(59, 130, 246, 0.3)",
        }}>{badge}</div>
      )}
      <p style={{ color: "var(--primary-brand)", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>{tier}</p>
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 48, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-2px" }}>{price}</span>
        <span style={{ color: featured ? "var(--text-2)" : "var(--text-3)", fontSize: 14, fontWeight: 500, marginLeft: 4 }}>{period}</span>
      </div>
      <p style={{ color: featured ? "var(--text-2)" : "var(--text-3)", fontSize: 14, marginBottom: 32, lineHeight: 1.6 }}>{desc}</p>
      <ul style={{ listStyle: "none", margin: "0 0 36px", padding: 0, display: "flex", flexDirection: "column", gap: 14 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, color: featured ? "var(--text-1)" : "var(--text-2)", fontSize: 14, fontWeight: 500 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: featured ? "rgba(59, 130, 246, 0.15)" : "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <svg width="12" height="12" viewBox="0 0 15 15" fill="none"><path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={featured ? "#3b82f6" : "var(--text-3)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={handleCTA}
        style={{
          width: "100%", padding: "16px", borderRadius: 14, fontWeight: 700, fontSize: 15,
          cursor: "pointer", transition: "all 0.3s",
          background: featured ? "linear-gradient(135deg, #3b82f6, #6366f1)" : "var(--bg-surface)",
          color: featured ? "white" : "var(--text-1)",
          border: featured ? "none" : `1px solid var(--border-strong)`,
          boxShadow: featured ? "0 8px 24px rgba(59, 130, 246, 0.3)" : "0 4px 12px rgba(0,0,0,0.05)",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; if(featured) e.currentTarget.style.boxShadow = "0 12px 28px rgba(59, 130, 246, 0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; if(featured) e.currentTarget.style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.3)"; }}
      >{cta}</button>
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const user = getUserData();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      color: "var(--text-1)",
      fontFamily: "var(--font-sans)",
      overflowX: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Caveat:wght@600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        
        .nav-a{color:var(--text-2);font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;letter-spacing:-0.01em}
        .nav-a:hover{color:var(--text-1)}
        
        .cta-btn-solid {
          display:inline-flex;align-items:center;gap:8px;
          padding:16px 36px;border-radius:14px;
          font-weight:700;font-size:16px;
          background: linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6);
          background-size: 200% 200%;
          color: white; border:none;cursor:pointer;
          box-shadow: 0 12px 28px rgba(59, 130, 246, 0.3), inset 0 2px 4px rgba(255,255,255,0.2);
          transition:all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
          animation: gradientShift 6s ease infinite;
        }
        .cta-btn-solid:hover {
          transform:translateY(-4px) scale(1.02);
          box-shadow: 0 20px 40px rgba(99, 102, 241, 0.4), inset 0 2px 4px rgba(255,255,255,0.2);
          filter: brightness(1.1);
        }

        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .outline-btn {
          display:inline-flex;align-items:center;gap:8px;
          padding:12px 28px;border-radius:12px;
          font-weight:600;font-size:15px;
          background: var(--bg-card);
          color: var(--text-1); border: 1px solid var(--border-default);
          cursor:pointer; transition:all 0.3s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .outline-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--border-strong);
          transform:translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
        }

        .fade-up { animation: fadeUpAnim 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; transform: translateY(20px); }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }

        @keyframes fadeUpAnim {
          to { opacity: 1; transform: translateY(0); }
        }

        .text-gradient {
          background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes floatUpDown {
          0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
          50% { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
        }
        
        .widgets-container {
          position: absolute; inset: 0; pointer-events: none; z-index: 0;
        }

        .float-widget {
          pointer-events: auto;
          animation: floatUpDown 8s ease-in-out infinite;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .float-widget:hover {
          transform: scale(1.05) translateY(-10px) !important;
          z-index: 50 !important;
          box-shadow: 0 32px 64px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.7) inset !important;
        }

        .delay-1 { animation-delay: 1.5s; }
        .delay-2 { animation-delay: 3s; }
        .delay-3 { animation-delay: 4.5s; }

        @media (max-width: 1100px) {
          .widgets-container {
            position: relative; inset: auto;
            width: 100vw; margin-left: calc(50% - 50vw);
            margin-top: 40px; padding: 20px 0 60px;
            overflow: hidden;
          }
          .widgets-scroll-track {
            display: flex; flex-wrap: nowrap; gap: 20px;
            width: max-content;
            animation: mobileMarquee 35s linear infinite;
            padding-left: 20px;
          }
          .widgets-scroll-track:active {
            animation-play-state: paused;
          }
          @keyframes mobileMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(calc(-50% - 10px)); }
          }
          .mobile-only-clone {
            display: flex; gap: 20px;
          }
          .float-widget {
            position: relative !important;
            top: auto !important; left: auto !important; right: auto !important; bottom: auto !important;
            animation: none !important;
            transform: none !important;
            flex: 0 0 280px !important;
            width: 280px !important;
            margin: 0 !important;
          }
          .float-widget:hover {
            transform: translateY(-4px) !important;
          }
          .fw-sticky-icon, .fw-reminders-icon {
            display: none !important;
          }
        }
        @media (min-width: 1101px) {
          .mobile-only-clone { display: none !important; }
          .widgets-scroll-track { display: contents; }
        }

        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-nav-menu { display: none !important; }
        }
      `}</style>

      <DottedBg />

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 clamp(16px, 5vw, 40px)", height: 72,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid var(--border-default)` : "1px solid transparent",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoSvg size={32} />
          <span style={{ fontSize: 18, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-0.5px" }}>
            Note<span style={{ color: "#3b82f6" }}>Atlas</span>
          </span>
        </div>

        <nav className="desktop-nav" style={{ display: "flex", gap: 36, alignItems: "center" }}>
        </nav>

        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/auth/login" className="nav-a">Sign in</Link>
            </>
          ) : (
            <>
              <Link to="/notes">
                <button className="cta-btn-solid" style={{ padding: "10px 24px" }}>Dashboard</button>
              </Link>
              <UserAvatar />
            </>
          )}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{ background: "transparent", border: "none", color: "var(--text-1)", cursor: "pointer", display: "none" }}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu" style={{
          position: "fixed", top: 72, left: 0, right: 0, background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)", zIndex: 99,
          display: "flex", flexDirection: "column", padding: 24, gap: 20,
        }}>

          <div style={{ height: 1, background: "var(--border-default)" }} />
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/auth/login" className="nav-a">Sign in</Link>
            </>
          ) : (
            <Link to="/notes"><button className="cta-btn-solid" style={{ width: "100%", justifyContent: "center" }}>Dashboard</button></Link>
          )}
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ 
        position: "relative", 
        padding: "120px 24px 60px", 
        minHeight: "calc(100vh - 72px)",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      }}>

        <div style={{ position: "relative", zIndex: 5, maxWidth: 800, textAlign: "center", pointerEvents: "auto" }}>
          
          {/* Top Logo Icon Block */}
          <div className="fade-up" style={{ 
            width: 76, height: 76, borderRadius: 22, 
            background: "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-surface) 100%)",
            border: "1px solid var(--border-default)", 
            boxShadow: "0 16px 40px rgba(0,0,0,0.08), inset 0 2px 4px rgba(255,255,255,0.3)",
            margin: "0 auto 40px",
            display: "flex", alignItems: "center", justifyContent: "center"
          }}>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#3b82f6" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--text-1)" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--text-1)" }} />
                <div style={{ width: 14, height: 14, borderRadius: "50%", background: "var(--text-1)" }} />
             </div>
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{
            fontSize: "clamp(44px, 6vw, 76px)",
            fontWeight: 700,
            letterSpacing: "-2px",
            lineHeight: 1.15,
            marginBottom: 24,
            color: "var(--text-1)",
          }}>
            Read, study, and research<br/>
            <span className="text-gradient">at the speed of thought</span>
          </h1>

          {/* Subheadline */}
          <p className="fade-up delay-100" style={{
            fontSize: 18, color: "var(--text-2)", lineHeight: 1.6,
            maxWidth: 580, margin: "0 auto 40px", fontWeight: 400
          }}>
            Upload PDFs, links, or audio and let our AI create study guides, summarize concepts, and answer your deepest questions.
          </p>

          {/* CTA Button */}
          <div className="fade-up delay-200">
            <Link to="/notes">
              <button className="cta-btn-solid">
                Get started for free
              </button>
            </Link>
            <p style={{ marginTop: 16, fontSize: 13, color: "var(--text-4)", fontWeight: 500 }}>No credit card required.</p>
          </div>
        </div>

        {/* Floating Background Widgets */}
        <div className="widgets-container">
          <div className="widgets-scroll-track">
            <StickyNoteWidget />
            <RemindersWidget />
            <TasksWidget />
            <IntegrationsWidget />
            {/* Clone for infinite mobile marquee */}
            <div className="mobile-only-clone">
              <StickyNoteWidget />
              <RemindersWidget />
              <TasksWidget />
              <IntegrationsWidget />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* ── PRODUCT PREVIEW (mock terminal) ─────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: 960, margin: "0 auto", position: "relative" }}>
        <div className="fade-up" style={{
          borderRadius: 24,
          border: `1px solid var(--border-strong)`,
          overflow: "hidden",
          background: "var(--bg-surface)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.1), inset 0 2px 10px rgba(255,255,255,0.7)",
        }}>
          {/* Window chrome */}
          <div style={{
            padding: "16px 20px",
            borderBottom: `1px solid var(--border-default)`,
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--bg-card)",
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, opacity: 0.9 }} />
              ))}
            </div>
            <div style={{
              flex: 1, textAlign: "center",
              background: "var(--bg-surface)", borderRadius: 8,
              padding: "6px 16px", fontSize: 13, color: "var(--text-2)", fontFamily: "var(--font-mono)",
              maxWidth: 320, margin: "0 auto",
              border: `1px solid var(--border-default)`,
              boxShadow: "inset 0 2px 4px rgba(0,0,0,0.03)"
            }}>app.noteatlas.ai/dashboard</div>
          </div>

          {/* Chat UI mock */}
          <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20, minHeight: 300, background: "var(--bg-surface)" }}>
            {/* AI message */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 640 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <div style={{
                background: "var(--bg-card)", border: `1px solid var(--border-default)`,
                borderRadius: "6px 20px 20px 20px", padding: "16px 20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
              }}>
                <p style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.7 }}>
                  I've analyzed your <span style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", padding: "2px 8px", borderRadius: 6, fontSize: 13.5, color: "#3b82f6", fontWeight: 600 }}>Q3 Research Report.pdf</span>. The key findings relate to market expansion in APAC — would you like a structured summary or should I highlight the risks section?
                </p>
              </div>
            </div>

            {/* User message */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 460, alignSelf: "flex-end" }}>
              <div style={{
                background: "var(--bg-card-hover)", border: `1px solid var(--border-default)`,
                borderRadius: "20px 6px 20px 20px", padding: "16px 20px",
              }}>
                <p style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.7 }}>
                  Give me the top 3 risks from the report.
                </p>
              </div>
              <div style={{
                width: 36, height: 36, borderRadius: 12, background: "var(--bg-card)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-1)", fontSize: 16, fontWeight: 700,
                border: `1px solid var(--border-strong)`,
              }}>U</div>
            </div>

            {/* AI streaming response */}
            <div className="fade-up delay-200" style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 660 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)"
              }}>
                <Sparkles size={18} color="white" />
              </div>
              <div style={{
                background: "var(--bg-card)", border: `1px solid var(--border-default)`,
                borderRadius: "6px 20px 20px 20px", padding: "20px 24px",
                display: "flex", flexDirection: "column", gap: 14,
                boxShadow: "0 4px 20px rgba(0,0,0,0.04)"
              }}>
                {["Regulatory uncertainty in APAC markets (pg. 14)", "Supply chain dependencies — 60% single-source exposure", "Currency volatility impact on Q4 projections"].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: "#3b82f6", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "white", marginTop: 2 }}>{i + 1}</div>
                    <span style={{ fontSize: 15, color: "var(--text-1)", lineHeight: 1.6 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 70 }}>
          <p style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>Capabilities</p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-1.5px", marginBottom: 16 }}>
            Built for deep research
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          <FeatureCard delay={0} icon={<MessageSquare size={24} />} title="AI chat over your docs" desc="Ask questions in natural language. Get cited, context-aware answers grounded in your uploaded documents." />
          <FeatureCard delay={100} icon={<Zap size={24} />} title="Auto summarization" desc="Generate concise summaries, FAQs, study guides, and briefing docs from your PDFs and notes in seconds." />
          <FeatureCard delay={200} icon={<Lock size={24} />} title="Private & secure" desc="Your documents stay in your account. We never use your content to train AI models." />
          <FeatureCard delay={0} icon={<LayoutGrid size={24} />} title="Multi-source chat" desc="Select multiple documents and chat across all of them simultaneously. Cross-reference with ease." />
          <FeatureCard delay={100} icon={<Folder size={24} />} title="Infinite notebooks" desc="Organize unlimited documents into unlimited notebooks with full-text search and source management." />
          <FeatureCard delay={200} icon={<Mic size={24} />} title="Audio overviews" desc="Turn your documents into podcast-style audio discussions. Study on the go with AI-generated audio." />
        </div>
      </section>

      <Divider />

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={{ padding: "120px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div className="fade-up" style={{ textAlign: "center", marginBottom: 80 }}>
          <p style={{ color: "#8b5cf6", fontWeight: 700, fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>Simple workflow</p>
          <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-1.5px" }}>
            Three steps to clarity
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            { n: "01", title: "Upload your documents", desc: "Drop PDFs, text files, or paste content. NoteAtlas parses and indexes everything instantly.", color: "#3b82f6" },
            { n: "02", title: "Ask questions naturally", desc: "Use plain language to ask about concepts, compare ideas, or find specific information buried deep in your docs.", color: "#6366f1" },
            { n: "03", title: "Get cited answers", desc: "Every response links back to the exact source passage. Trust but verify — always.", color: "#8b5cf6" },
          ].map((step, i) => (
            <div key={i} className={`fade-up delay-${(i + 1) * 100}`} style={{
              display: "flex", gap: 32, alignItems: "flex-start",
              padding: "40px 36px",
              borderRadius: 24,
              border: `1px solid var(--border-default)`,
              background: "var(--bg-card)",
              backdropFilter: "blur(12px)",
              position: "relative",
              transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--border-strong)";
                e.currentTarget.style.transform = "translateX(12px)";
                e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow = "none";
              }}>
              <div style={{
                width: 56, height: 56, borderRadius: 16, flexShrink: 0,
                background: "var(--bg-surface)",
                border: `1px solid var(--border-strong)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: step.color, fontWeight: 800, fontSize: 18,
                boxShadow: "0 8px 16px rgba(0,0,0,0.05)"
              }}>{step.n}</div>
              <div>
                <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 20, marginBottom: 12 }}>{step.title}</h3>
                <p style={{ color: "var(--text-3)", fontSize: 16, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "120px 24px", background: "linear-gradient(180deg, transparent 0%, rgba(59, 130, 246, 0.03) 100%)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div className="fade-up" style={{ textAlign: "center", marginBottom: 70 }}>
            <p style={{ color: "#3b82f6", fontWeight: 700, fontSize: 14, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 16 }}>Fair Pricing</p>
            <h2 style={{ fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 700, color: "var(--text-1)", letterSpacing: "-1.5px", marginBottom: 20 }}>
              Purely credits-based
            </h2>
            <p style={{ color: "var(--text-3)", fontSize: 18, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
              Every feature is unlocked from day one. You never hit an artificial limit on notebooks or documents. Just pay for the AI compute you use.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
            alignItems: "stretch",
          }}>
            <PricingCard
              tier="Starter"
              price="Free"
              period=""
              desc="Get a taste of the full NoteAtlas experience with no limits."
              cta="Get started free"
              features={["50 free credits", "All AI features unlocked", "Unlimited notebooks", "Unlimited documents", "No credit card required"]}
              user={user}
            />
            <PricingCard
              tier="Pro"
              price="₹499"
              period="per top-up"
              desc="Perfect for a semester of studying or a major research project."
              cta="Buy 3,000 Credits"
              features={["3,000 credits added", "All AI features unlocked", "Unlimited notebooks", "Unlimited documents", "Never expires"]}
              user={user}
            />
            <PricingCard
              tier="Premium"
              price="₹999"
              period="per top-up"
              desc="For heavy research workflows requiring massive AI processing."
              cta="Buy 10,000 Credits"
              featured
              badge="Most popular"
              features={["10,000 credits added", "All AI features unlocked", "Unlimited notebooks", "Unlimited documents", "Never expires"]}
              user={user}
            />
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ───────────────────────────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        <div className="fade-up delay-100" style={{
          padding: "70px 48px",
          borderRadius: 32,
          border: `1px solid var(--border-strong)`,
          background: "linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.05) 100%)",
          boxShadow: "0 24px 64px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.5)",
          position: "relative",
          overflow: "hidden",
        }}>
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 style={{ fontSize: "clamp(32px, 4vw, 48px)", fontWeight: 700, letterSpacing: "-1.5px", marginBottom: 20, color: "var(--text-1)" }}>
              Ready to think smarter?
            </h2>
            <p style={{ color: "var(--text-3)", fontSize: 18, lineHeight: 1.7, marginBottom: 40, maxWidth: 500, margin: "0 auto 40px" }}>
              Start free with 50 credits — no card required. Recharge anytime to unlock more AI power.
            </p>
            <Link to="/notes">
              <button className="cta-btn-solid">
                Start for free — no card required
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{
        borderTop: `1px solid var(--border-default)`,
        padding: "48px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 20,
        background: "var(--bg-surface)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LogoSvg size={36} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.5px" }}>NoteAtlas</span>
        </div>
        <p style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 500 }}>
          © {new Date().getFullYear()} NoteAtlas Clone · Built for productivity
        </p>
        <nav style={{ display: "flex", gap: 32 }}>
          <Link to="/privacy" style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text-1)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-3)"}>Privacy</Link>
          <Link to="/terms" style={{ color: "var(--text-3)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text-1)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-3)"}>Terms</Link>
        </nav>
      </footer>
    </div>
  );
}
