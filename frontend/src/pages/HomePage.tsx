import { Link, useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { openPaymentModal } from "@/store/chatSlice";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Brain, Zap, Lock, MessageSquare, Folder, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserData } from "@/helper/getUserData";
import { LogoSvg } from "@/components/base/LogoSvg";
import UserAvatar from "@/components/base/UserAvatar";

// ─── SVG Noise texture ────────────────────────────────────────────────────────
const NoiseSvg = () => (
  <svg style={{ position: "fixed", inset: 0, width: "100%", height: "100%", opacity: 0.03, pointerEvents: "none", zIndex: 0 }} xmlns="http://www.w3.org/2000/svg">
    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width="100%" height="100%" filter="url(#noise)" />
  </svg>
);

// ─── Gradient mesh bg orbs ────────────────────────────────────────────────────
const MeshBg = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
    <div style={{
      position: "absolute", top: "-15%", left: "-8%", width: 700, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 65%)",
      filter: "blur(40px)", animation: "orb1 14s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", bottom: "-5%", right: "-5%", width: 550, height: 550, borderRadius: "50%",
      background: "radial-gradient(circle, var(--primary-mid) 0%, transparent 65%)",
      filter: "blur(40px)", animation: "orb2 17s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", top: "38%", right: "22%", width: 360, height: 360, borderRadius: "50%",
      background: "radial-gradient(circle, var(--primary-mid) 0%, transparent 65%)",
      filter: "blur(30px)", animation: "orb3 21s ease-in-out infinite",
    }} />
    <style>{`
      @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-70px)}}
      @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,45px)}}
      @keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(35px,55px)}}
    `}</style>
  </div>
);

// ─── Glowy grid ──────────────────────────────────────────────────────────────
const GlowyGrid = ({ opacity = 0.25 }: { opacity?: number }) => (
  <div style={{
    position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
    overflow: "hidden"
  }}>
    <div style={{
      position: "absolute", inset: "-50%",
      backgroundImage: `
        linear-gradient(var(--primary-brand) 1px, transparent 1px),
        linear-gradient(90deg, var(--primary-brand) 1px, transparent 1px)
      `,
      backgroundSize: "72px 72px",
      opacity: opacity * 0.4,
      maskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, black 0%, transparent 60%)",
      animation: "panGrid 30s linear infinite"
    }}/>
    <div style={{
      position: "absolute", inset: "-50%",
      backgroundImage: `
        linear-gradient(var(--primary-brand) 2px, transparent 2px),
        linear-gradient(90deg, var(--primary-brand) 2px, transparent 2px)
      `,
      backgroundSize: "72px 72px",
      opacity: opacity * 0.8,
      filter: "blur(6px)",
      maskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, black 0%, transparent 60%)",
      animation: "panGrid 30s linear infinite"
    }}/>
    <style>{`
      @keyframes panGrid {
        0% { transform: translateY(0); }
        100% { transform: translateY(72px); }
      }
    `}</style>
  </div>
);

// ─── Pill badge ───────────────────────────────────────────────────────────────
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 8,
    padding: "5px 14px", borderRadius: "999px",
    border: `1px solid var(--border-accent)`,
    background: "var(--primary-glow)",
    color: "var(--primary-light)", fontSize: 12, fontWeight: 500, letterSpacing: "0.04em",
    backdropFilter: "blur(12px)",
  }}>
    <span style={{
      width: 6, height: 6, borderRadius: "50%",
      background: "var(--primary-light)", boxShadow: "0 0 6px var(--primary-light)",
      animation: "pulse 2.4s infinite",
    }} />
    {children}
  </span>
);

// ─── Feature icon block ───────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay = 0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: "28px 24px",
        borderRadius: 18,
        border: `1px solid ${hover ? "var(--border-accent)" : "var(--border-default)"}`,
        background: hover ? "var(--primary-glow)" : "var(--bg-card)",
        backdropFilter: "blur(12px)",
        transition: "all 0.28s ease",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "var(--shadow-primary)" : "none",
        cursor: "default",
        animationDelay: `${delay}ms`,
      }}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: hover ? "var(--primary-glow)" : "var(--primary-mid)",
        border: `1px solid var(--primary-border)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20, marginBottom: 16,
        transition: "background 0.2s",
      }}>
        {icon}
      </div>
      <h3 style={{ color: "var(--text-1)", fontWeight: 600, fontSize: 15, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--text-3)", fontSize: 13.5, lineHeight: 1.75 }}>{desc}</p>
    </div>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div style={{ height: 1, background: `linear-gradient(90deg, transparent, var(--border-default), transparent)`, margin: "0 auto", width: "100%" }} />;

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
      style={{
        position: "relative",
        padding: "36px 32px",
        borderRadius: 22,
        border: featured
          ? `1.5px solid var(--border-accent)`
          : `1px solid ${hover ? "var(--border-hover)" : "var(--border-default)"}`,
        background: featured
          ? "var(--primary-glow)"
          : "var(--bg-card)",
        backdropFilter: "blur(16px)",
        transform: featured ? "scale(1.03)" : hover ? "translateY(-3px)" : "scale(1)",
        boxShadow: featured
          ? "var(--shadow-primary-lg)"
          : hover ? "var(--shadow-card-hover)" : "none",
        transition: "all 0.25s ease",
      }}
    >
      {badge && (
        <div style={{
          position: "absolute", top: -13, left: "50%", transform: "translateX(-50%)",
          background: "linear-gradient(90deg,#f59e0b,#f97316)",
          color: "var(--text-1)", fontSize: 10.5, fontWeight: 700, padding: "4px 14px",
          borderRadius: 999, letterSpacing: "0.08em", textTransform: "uppercase",
          boxShadow: "0 4px 14px rgba(245,158,11,0.35)",
        }}>{badge}</div>
      )}
      <p style={{ color: "var(--text-3)", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 10 }}>{tier}</p>
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 46, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-2px" }}>{price}</span>
        <span style={{ color: "var(--text-3)", fontSize: 14 }}>{period}</span>
      </div>
      <p style={{ color: "var(--text-3)", fontSize: 13, marginBottom: 28, lineHeight: 1.6 }}>{desc}</p>
      <ul style={{ listStyle: "none", margin: "0 0 32px", padding: 0, display: "flex", flexDirection: "column", gap: 11 }}>
        {features.map((f, i) => (
          <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: featured ? "var(--primary-light)" : "var(--text-2)", fontSize: 13.5 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="7.5" fill={featured ? "var(--primary-glow)" : "var(--bg-card-hover)"} /><path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={featured ? "var(--primary-light)" : "var(--text-3)"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" /></svg>
            {f}
          </li>
        ))}
      </ul>
      <button
        onClick={handleCTA}
        style={{
          width: "100%", padding: "13px", borderRadius: 11, fontWeight: 600, fontSize: 14,
          cursor: "pointer", transition: "all 0.2s",
          background: featured
            ? "linear-gradient(135deg, var(--primary-brand), var(--primary-light))"
            : "var(--bg-card-hover)",
          color: featured ? "var(--text-on-primary)" : "var(--text-2)",
          border: featured ? "none" : `1px solid var(--border-default)`,
          boxShadow: featured ? "var(--shadow-primary)" : "none",
        }}
        onMouseEnter={e => { e.currentTarget.style.opacity = "0.82"; e.currentTarget.style.transform = "translateY(-1px)" }}
        onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "none" }}
      >{cta}</button>
    </div>
  );
};

// ─── Animated number ──────────────────────────────────────────────────────────
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div style={{ textAlign: "center" }}>
    <div style={{ fontSize: 36, fontWeight: 800, color: "var(--text-1)", letterSpacing: "-1.5px", lineHeight: 1 }}>{value}</div>
    <div style={{ color: "var(--text-3)", fontSize: 11.5, marginTop: 7, letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
  </div>
);



// ─── MAIN ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const phraseIdx = useRef(0);
  const charIdx = useRef(0);
  const del = useRef(false);
  const phrases = ['Research Papers', 'Meeting Notes', 'Study Materials', 'Legal Documents', 'Technical Docs'];

  const user = getUserData();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const phrase = phrases[phraseIdx.current];
      if (!del.current) {
        setTyped(phrase.slice(0, charIdx.current + 1));
        charIdx.current++;
        if (charIdx.current === phrase.length) {
          del.current = true;
          setTimeout(tick, 2000);
          return;
        }
      } else {
        setTyped(phrase.slice(0, charIdx.current - 1));
        charIdx.current--;
        if (charIdx.current === 0) {
          del.current = false;
          phraseIdx.current = (phraseIdx.current + 1) % phrases.length;
        }
      }
      setTimeout(tick, del.current ? 45 : 90);
    };
    const t = setTimeout(tick, 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      color: "var(--text-1)",
      fontFamily: "var(--font-sans)",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}49%{opacity:1}50%,99%{opacity:0}}
        @keyframes shimmerGrad{0%{background-position:200% center}100%{background-position:-200% center}}
        .fu{opacity:0;animation:fadeUp 0.7s forwards}
        .fu1{animation-delay:0.08s}
        .fu2{animation-delay:0.18s}
        .fu3{animation-delay:0.32s}
        .fu4{animation-delay:0.48s}
        .nav-a{color:var(--text-3);font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;letter-spacing:-0.01em}
        .nav-a:hover{color:var(--primary-light)}
        .cursor{display:inline-block;width:2.5px;height:0.85em;background:var(--primary-light);margin-left:2px;vertical-align:middle;animation:blink 1.1s step-end infinite;border-radius:2px}
        .grad-text{
          background:linear-gradient(130deg,#a78bfa 0%,var(--primary-brand) 40%,#c4b5fd 75%,#e0d7ff 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmerGrad 5s linear infinite;
        }
        .serif{font-family:'Instrument Serif',Georgia,serif}
        .cta-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 30px;border-radius:12px;
          font-weight:700;font-size:15px;
          background:linear-gradient(135deg, var(--primary-brand), var(--primary-light));
          color:var(--text-on-primary);border:none;cursor:pointer;
          box-shadow:var(--shadow-primary-lg);
          transition:all 0.22s;
          font-family:var(--font-sans);
          letter-spacing:-0.01em;
        }
        .cta-btn:hover{transform:translateY(-2px);box-shadow:var(--shadow-primary-lg);filter:brightness(1.08)}
        .ghost-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 28px;border-radius:12px;
          font-weight:500;font-size:15px;
          background:var(--bg-card-hover);
          color:var(--text-2);border:1px solid var(--border-default);
          cursor:pointer;transition:all 0.22s;
          font-family:var(--font-sans);
          backdrop-filter:blur(8px);
        }
        .ghost-btn:hover{background:var(--primary-glow);border-color:var(--border-accent);color:var(--text-1)}
        
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .footer-container { flex-direction: column !important; align-items: center !important; text-align: center !important; gap: 24px !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
          .mobile-nav-menu { display: none !important; }
        }
      `}</style>

      <NoiseSvg />
      <MeshBg />

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        padding: "0 clamp(16px, 5vw, 40px)", height: 60,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid var(--border-default)` : "1px solid transparent",
        transition: "all 0.3s ease",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LogoSvg size={38} />
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", letterSpacing: "-0.5px" }}>
            Note<span style={{ color: "var(--primary-brand)" }}>Atlas</span>
          </span>
        </div>

        <nav className="desktop-nav" style={{ display: "flex", gap: 36, alignItems: "center" }}>
          <a href="#features" className="nav-a">Features</a>
          <a href="#pricing" className="nav-a">Pricing</a>
          <a href="#" className="nav-a">Docs</a>
        </nav>

        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/auth/login" className="nav-a" style={{ marginRight: 4 }}>Sign in</Link>
              <Link to="/notes">
                <button className="cta-btn" style={{ padding: "9px 20px", fontSize: 13.5, borderRadius: 9 }}>
                  Get Started
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </Link>
            </>
          ) : (
            <>
              <Link to="/notes">
                <button className="cta-btn" style={{ padding: "9px 20px", fontSize: 13.5, borderRadius: 9 }}>
                  Dashboard
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
              </Link>
              <div style={{ marginLeft: 4 }}>
                <UserAvatar />
              </div>
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

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="mobile-nav-menu" style={{
          position: "fixed", top: 60, left: 0, right: 0, background: "var(--bg-surface)",
          borderBottom: "1px solid var(--border-default)", zIndex: 99,
          display: "flex", flexDirection: "column", padding: 20, gap: 20,
          boxShadow: "var(--shadow-md)"
        }}>
          <a href="#features" className="nav-a" onClick={() => setMobileMenuOpen(false)}>Features</a>
          <a href="#pricing" className="nav-a" onClick={() => setMobileMenuOpen(false)}>Pricing</a>
          <a href="#" className="nav-a" onClick={() => setMobileMenuOpen(false)}>Docs</a>
          <div style={{ height: 1, background: "var(--border-default)" }} />
          <ThemeToggle />
          {!user ? (
            <>
              <Link to="/auth/login" className="nav-a" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>
              <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>
                <button className="cta-btn" style={{ width: "100%", justifyContent: "center" }}>
                  Get Started
                </button>
              </Link>
            </>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <UserAvatar />
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{user.name}</span>
              </div>
              <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>
                <button className="cta-btn" style={{ width: "100%", justifyContent: "center" }}>
                  Dashboard
                </button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position: "relative", padding: "150px 24px 130px", textAlign: "center", overflow: "hidden" }}>
        <GlowyGrid opacity={0.25} />
        <div style={{ position: "relative", zIndex: 1, maxWidth: 960, margin: "0 auto" }}>

          <h1 className="fu fu2 serif" style={{
            fontSize: "clamp(52px, 8vw, 96px)",
            fontWeight: 400,
            letterSpacing: "-3px",
            lineHeight: 1.02,
            marginBottom: 28,
            color: "var(--text-1)",
            textShadow: "0 10px 40px rgba(0,0,0,0.15)"
          }}>
            Your documents.<br />
            <em className="grad-text" style={{ fontStyle: "italic" }}>Infinite</em> possibilities.
          </h1>

          <div className="fu fu3" style={{
            fontSize: "clamp(20px, 2.5vw, 26px)",
            fontWeight: 400,
            color: "var(--text-3)",
            marginBottom: 24,
            display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: 9,
            minHeight: 40,
          }}>
            <span>Generate insights for your</span>
            <span style={{ color: "var(--primary-light)", fontWeight: 600 }}>{typed}</span>
            <span className="cursor" />
          </div>

          <p className="fu fu3" style={{
            fontSize: 17.5, color: "var(--text-3)", lineHeight: 1.8,
            maxWidth: 600, margin: "0 auto 50px", fontWeight: 400
          }}>
            No subscriptions. No artificial feature limits. No notebook caps.
            Just top up your credits and unleash the full power of AI on your research.
          </p>

          <div className="fu fu4" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/notes">
              <button className="cta-btn" style={{ padding: "16px 32px", fontSize: 16, borderRadius: 14 }}>
                {user ? "Go to your dashboard" : "Start with 50 Free Credits"}
                <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </Link>
            {!user && (
              <Link to="/auth/login">
                <button className="ghost-btn" style={{ padding: "16px 32px", fontSize: 16, borderRadius: 14 }}>Sign in</button>
              </Link>
            )}
          </div>
        </div>

        {/* Dynamic bottom glow bloom */}
        <div style={{
          position: "absolute", bottom: -80, left: "50%", transform: "translateX(-50%)",
          width: 900, height: 250,
          background: "radial-gradient(ellipse, var(--primary-glow) 0%, transparent 60%)",
          pointerEvents: "none",
          filter: "blur(40px)"
        }} />
      </section>

      <Divider />

      {/* ── PRODUCT PREVIEW (mock terminal) ─────────────── */}
      <section style={{ padding: "90px 24px", maxWidth: 920, margin: "0 auto" }}>
        <div style={{
          borderRadius: 24,
          border: `1px solid var(--border-accent)`,
          overflow: "hidden",
          background: "var(--bg-surface)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.4), 0 0 40px var(--primary-glow)",
        }}>
          {/* Window chrome */}
          <div style={{
            padding: "16px 20px",
            borderBottom: `1px solid var(--border-default)`,
            display: "flex", alignItems: "center", gap: 12,
            background: "var(--bg-elevated)",
          }}>
            <div style={{ display: "flex", gap: 8 }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c, i) => (
                <div key={i} style={{ width: 14, height: 14, borderRadius: "50%", background: c, opacity: 0.9 }} />
              ))}
            </div>
            <div style={{
              flex: 1, textAlign: "center",
              background: "var(--bg-card)", borderRadius: 8,
              padding: "6px 16px", fontSize: 12.5, color: "var(--text-2)", fontFamily: "var(--font-mono)",
              maxWidth: 280, margin: "0 auto",
              border: `1px solid var(--border-default)`,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
            }}>app.noteatlas.ai</div>
          </div>

          {/* Chat UI mock */}
          <div style={{ padding: "32px 36px", display: "flex", flexDirection: "column", gap: 20, minHeight: 300 }}>
            {/* AI message */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 580 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg,#6d5ff6,#a78bfa)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(109,95,246,0.3)"
              }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.8 5.4H13.5L9.85 8.1L11.1 12.7L7 9.8L2.9 12.7L4.15 8.1L0.5 5.4H5.2L7 1Z" fill="white" fillOpacity="0.95" /></svg>
              </div>
              <div style={{
                background: "var(--primary-glow)", border: `1px solid var(--border-accent)`,
                borderRadius: "6px 20px 20px 20px", padding: "14px 18px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
              }}>
                <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.75 }}>
                  I've analyzed your <span style={{ background: "var(--primary-glow)", border: "1px solid var(--primary-border)", padding: "2px 8px", borderRadius: 6, fontSize: 12.5, color: "var(--primary-brand)", fontWeight: 600 }}>Q3 Research Report.pdf</span>. The key findings relate to market expansion in APAC — would you like a structured summary or should I highlight the risks section?
                </p>
              </div>
            </div>

            {/* User message */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 420, alignSelf: "flex-end" }}>
              <div style={{
                background: "var(--bg-card-hover)", border: `1px solid var(--border-default)`,
                borderRadius: "20px 6px 20px 20px", padding: "14px 18px",
              }}>
                <p style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.75 }}>
                  Give me the top 3 risks from the report.
                </p>
              </div>
              <div style={{
                width: 34, height: 34, borderRadius: 10, background: "var(--bg-elevated)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text-2)", fontSize: 15, fontWeight: 700,
                border: `1px solid var(--border-default)`,
              }}>U</div>
            </div>

            {/* AI streaming response */}
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start", maxWidth: 600 }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10,
                background: "linear-gradient(135deg,#6d5ff6,#a78bfa)",
                flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: "0 4px 12px rgba(109,95,246,0.3)"
              }}>
                <svg width="16" height="16" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.8 5.4H13.5L9.85 8.1L11.1 12.7L7 9.8L2.9 12.7L4.15 8.1L0.5 5.4H5.2L7 1Z" fill="white" fillOpacity="0.95" /></svg>
              </div>
              <div style={{
                background: "var(--primary-glow)", border: `1px solid var(--border-accent)`,
                borderRadius: "6px 20px 20px 20px", padding: "16px 20px",
                display: "flex", flexDirection: "column", gap: 12,
                boxShadow: "0 4px 20px rgba(0,0,0,0.05)"
              }}>
                {["Regulatory uncertainty in APAC markets (pg. 14)", "Supply chain dependencies — 60% single-source exposure", "Currency volatility impact on Q4 projections"].map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, background: "var(--primary-brand)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "var(--text-on-primary)", marginTop: 2 }}>{i + 1}</div>
                    <span style={{ fontSize: 14, color: "var(--text-1)", lineHeight: 1.7 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="features" style={{ padding: "100px 24px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "var(--primary-brand)", fontWeight: 600, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Capabilities</p>
          <h2 className="serif" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "var(--text-1)", letterSpacing: "-1.5px", marginBottom: 16 }}>
            Built for <em style={{ fontStyle: "italic", color: "var(--primary-light)" }}>deep research</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          <FeatureCard delay={0} icon={<LogoSvg size={24} color="var(--primary-light)" />} title="AI chat over your docs" desc="Ask questions in natural language. Get cited, context-aware answers grounded in your uploaded documents." />
          <FeatureCard delay={80} icon={<Zap size={24} />} title="Auto summarization" desc="Generate concise summaries, FAQs, study guides, and briefing docs from your PDFs and notes in seconds." />
          <FeatureCard delay={160} icon={<Lock size={24} />} title="Private & secure" desc="Your documents stay in your account. We never use your content to train AI models." />
          <FeatureCard delay={240} icon={<MessageSquare size={24} />} title="Multi-source chat" desc="Select multiple documents and chat across all of them simultaneously. Cross-reference with ease." />
          <FeatureCard delay={320} icon={<Folder size={24} />} title="Infinite notebooks" desc="Organize unlimited documents into unlimited notebooks with full-text search and source management." />
          <FeatureCard delay={400} icon={<Search size={24} />} title="Audio overviews" desc="Turn your documents into podcast-style audio discussions. Study on the go with AI-generated audio." />
        </div>
      </section>

      <Divider />

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={{ padding: "100px 24px", maxWidth: 860, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ color: "var(--primary-brand)", fontWeight: 600, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Simple workflow</p>
          <h2 className="serif" style={{ fontSize: "clamp(32px, 4vw, 50px)", fontWeight: 400, color: "var(--text-1)", letterSpacing: "-1.5px" }}>
            Three steps to clarity
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { n: "01", title: "Upload your documents", desc: "Drop PDFs, text files, or paste content. NoteAtlas parses and indexes everything instantly.", color: "#6d5ff6" },
            { n: "02", title: "Ask questions naturally", desc: "Use plain language to ask about concepts, compare ideas, or find specific information buried deep in your docs.", color: "#8b5cf6" },
            { n: "03", title: "Get cited answers", desc: "Every response links back to the exact source passage. Trust but verify — always.", color: "#a78bfa" },
          ].map((step, i) => (
            <div key={i} style={{
              display: "flex", gap: 28, alignItems: "flex-start",
              padding: "36px 32px",
              borderRadius: 20,
              border: `1px solid var(--border-default)`,
              background: "var(--bg-card)",
              backdropFilter: "blur(12px)",
              position: "relative",
              transition: "all 0.3s ease",
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = "var(--border-accent)";
                e.currentTarget.style.transform = "translateX(8px)";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.transform = "none";
              }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: "var(--primary-glow)",
                border: `1px solid var(--primary-border)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: step.color, fontWeight: 800, fontSize: 15, fontFamily: "var(--font-mono)",
                boxShadow: "inset 0 2px 4px rgba(255,255,255,0.1)"
              }}>{step.n}</div>
              <div>
                <h3 style={{ color: "var(--text-1)", fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{step.title}</h3>
                <p style={{ color: "var(--text-3)", fontSize: 15, lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" style={{ padding: "100px 24px" }}>
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <p style={{ color: "var(--primary-brand)", fontWeight: 600, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 14 }}>Fair Pricing</p>
            <h2 className="serif" style={{ fontSize: "clamp(34px, 4.5vw, 56px)", fontWeight: 400, color: "var(--text-1)", letterSpacing: "-1.5px", marginBottom: 16 }}>
              Purely <em style={{ fontStyle: "italic", color: "var(--primary-light)" }}>credits-based</em>
            </h2>
            <p style={{ color: "var(--text-3)", fontSize: 17, maxWidth: 500, margin: "0 auto" }}>
              Every feature is unlocked from day one. You never hit an artificial limit on notebooks or documents. Just pay for the AI compute you use.
            </p>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
            gap: 24,
            alignItems: "center",
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
      <section style={{ padding: "80px 24px", maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          padding: "64px 48px",
          borderRadius: 24,
          border: `1px solid var(--border-accent)`,
          background: "var(--primary-glow)",
          backdropFilter: "blur(16px)",
          boxShadow: "var(--shadow-primary-lg)",
          position: "relative",
          overflow: "hidden",
        }}>
          <GlowyGrid opacity={0.15} />
          <div style={{ position: "relative", zIndex: 1 }}>
            <h2 className="serif" style={{ fontSize: "clamp(28px, 4vw, 46px)", fontWeight: 400, letterSpacing: "-1.5px", marginBottom: 16, color: "var(--text-1)" }}>
              Ready to think <em style={{ fontStyle: "italic", color: "var(--primary-light)" }}>smarter?</em>
            </h2>
            <p style={{ color: "var(--text-3)", fontSize: 16, lineHeight: 1.8, marginBottom: 36, maxWidth: 420, margin: "0 auto 36px" }}>
              Start free with 50 credits — no card required. Recharge anytime to unlock more AI power.
            </p>
            <Link to="/notes">
              <button className="cta-btn" style={{ fontSize: 16, padding: "16px 36px", borderRadius: 13 }}>
                Start for free — no card required
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="footer-container" style={{
        borderTop: `1px solid var(--border-default)`,
        padding: "36px 40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <LogoSvg size={32} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-3)", letterSpacing: "-0.3px" }}>NoteAtlas</span>
        </div>
        <p style={{ color: "var(--text-4)", fontSize: 12.5 }}>
          © {new Date().getFullYear()} NoteAtlas Clone · Built for productivity
        </p>
        <nav style={{ display: "flex", gap: 24 }}>
          <Link to="/privacy" style={{ color: "var(--text-3)", fontSize: 12.5, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text-1)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-3)"}>Privacy</Link>
          <Link to="/terms" style={{ color: "var(--text-3)", fontSize: 12.5, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.target as HTMLElement).style.color = "var(--text-1)"}
              onMouseLeave={e => (e.target as HTMLElement).style.color = "var(--text-3)"}>Terms</Link>
        </nav>
      </footer>
    </div>
  );
}