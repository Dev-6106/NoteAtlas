import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { Menu, X, Brain, Zap, Lock, MessageSquare, Folder, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserData } from "@/helper/getUserData";

// ─── SVG Noise texture ────────────────────────────────────────────────────────
const NoiseSvg = () => (
  <svg style={{ position:"fixed", inset:0, width:"100%", height:"100%", opacity:0.03, pointerEvents:"none", zIndex:0 }} xmlns="http://www.w3.org/2000/svg">
    <filter id="noise"><feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#noise)"/>
  </svg>
);

// ─── Gradient mesh bg orbs ────────────────────────────────────────────────────
const MeshBg = () => (
  <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden" }}>
    <div style={{
      position:"absolute", top:"-15%", left:"-8%", width:700, height:700, borderRadius:"50%",
      background:"radial-gradient(circle, var(--primary-glow) 0%, transparent 65%)",
      filter:"blur(40px)", animation:"orb1 14s ease-in-out infinite",
    }}/>
    <div style={{
      position:"absolute", bottom:"-5%", right:"-5%", width:550, height:550, borderRadius:"50%",
      background:"radial-gradient(circle, var(--primary-mid) 0%, transparent 65%)",
      filter:"blur(40px)", animation:"orb2 17s ease-in-out infinite",
    }}/>
    <div style={{
      position:"absolute", top:"38%", right:"22%", width:360, height:360, borderRadius:"50%",
      background:"radial-gradient(circle, var(--primary-mid) 0%, transparent 65%)",
      filter:"blur(30px)", animation:"orb3 21s ease-in-out infinite",
    }}/>
    <style>{`
      @keyframes orb1{0%,100%{transform:translate(0,0)}50%{transform:translate(50px,-70px)}}
      @keyframes orb2{0%,100%{transform:translate(0,0)}50%{transform:translate(-60px,45px)}}
      @keyframes orb3{0%,100%{transform:translate(0,0)}50%{transform:translate(35px,55px)}}
    `}</style>
  </div>
);

// ─── Subtle grid ──────────────────────────────────────────────────────────────
const GridLines = ({ opacity = 0.04 }: { opacity?: number }) => (
  <div style={{
    position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
    backgroundImage:`linear-gradient(var(--primary-glow) 1px, transparent 1px), linear-gradient(90deg, var(--primary-glow) 1px, transparent 1px)`,
    backgroundSize:"72px 72px",
    maskImage:"radial-gradient(ellipse 90% 70% at 50% 0%, black 35%, transparent 100%)",
    opacity,
  }}/>
);

// ─── Pill badge ───────────────────────────────────────────────────────────────
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:8,
    padding:"5px 14px", borderRadius:"999px",
    border:`1px solid var(--border-accent)`,
    background:"var(--primary-glow)",
    color:"var(--primary-light)", fontSize:12, fontWeight:500, letterSpacing:"0.04em",
    backdropFilter:"blur(12px)",
  }}>
    <span style={{
      width:6, height:6, borderRadius:"50%",
      background:"var(--primary-light)", boxShadow:"0 0 6px var(--primary-light)",
      animation:"pulse 2.4s infinite",
    }}/>
    {children}
  </span>
);

// ─── Feature icon block ───────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay=0 }: { icon: React.ReactNode; title: string; desc: string; delay?: number }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        padding:"28px 24px",
        borderRadius: 18,
        border:`1px solid ${hover ? "var(--border-accent)" : "var(--border-default)"}`,
        background: hover ? "var(--primary-glow)" : "var(--bg-card)",
        backdropFilter:"blur(12px)",
        transition:"all 0.28s ease",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? "var(--shadow-primary)" : "none",
        cursor:"default",
        animationDelay:`${delay}ms`,
      }}
    >
      <div style={{
        width:42, height:42, borderRadius:12,
        background: hover ? "var(--primary-glow)" : "var(--primary-mid)",
        border:`1px solid var(--primary-border)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20, marginBottom:16,
        transition:"background 0.2s",
      }}>
        {icon}
      </div>
      <h3 style={{ color:"var(--text-1)", fontWeight:600, fontSize:15, marginBottom:8 }}>{title}</h3>
      <p style={{ color:"var(--text-3)", fontSize:13.5, lineHeight:1.75 }}>{desc}</p>
    </div>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div style={{ height:1, background:`linear-gradient(90deg, transparent, var(--border-default), transparent)`, margin:"0 auto", width:"100%" }}/>;

// ─── Pricing Card ─────────────────────────────────────────────────────────────
const PricingCard = ({ tier, price, period, desc, features, cta, featured=false, badge }: {
  tier: string; price: string; period: string; desc: string; features: string[]; cta: string; featured?: boolean; badge?: string;
}) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        position:"relative",
        padding:"36px 32px",
        borderRadius:22,
        border: featured
          ? `1.5px solid var(--border-accent)`
          : `1px solid ${hover ? "var(--border-hover)" : "var(--border-default)"}`,
        background: featured
          ? "var(--primary-glow)"
          : "var(--bg-card)",
        backdropFilter:"blur(16px)",
        transform: featured ? "scale(1.03)" : hover ? "translateY(-3px)" : "scale(1)",
        boxShadow: featured
          ? "var(--shadow-primary-lg)"
          : hover ? "var(--shadow-card-hover)" : "none",
        transition:"all 0.25s ease",
      }}
    >
      {badge && (
        <div style={{
          position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
          background:"linear-gradient(90deg,#f59e0b,#f97316)",
          color:"var(--text-1)", fontSize:10.5, fontWeight:700, padding:"4px 14px",
          borderRadius:999, letterSpacing:"0.08em", textTransform:"uppercase",
          boxShadow:"0 4px 14px rgba(245,158,11,0.35)",
        }}>{badge}</div>
      )}
      <p style={{ color:"var(--text-3)", fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10 }}>{tier}</p>
      <div style={{ marginBottom:8 }}>
        <span style={{ fontSize:46, fontWeight:800, color:"var(--text-1)", letterSpacing:"-2px" }}>{price}</span>
        <span style={{ color:"var(--text-3)", fontSize:14 }}>{period}</span>
      </div>
      <p style={{ color:"var(--text-3)", fontSize:13, marginBottom:28, lineHeight:1.6 }}>{desc}</p>
      <ul style={{ listStyle:"none", margin:"0 0 32px", padding:0, display:"flex", flexDirection:"column", gap:11 }}>
        {features.map((f,i) => (
          <li key={i} style={{ display:"flex", alignItems:"center", gap:10, color: featured ? "var(--primary-light)" : "var(--text-2)", fontSize:13.5 }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="7.5" fill={featured ? "var(--primary-glow)" : "var(--bg-card-hover)"}/><path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={featured ? "var(--primary-light)" : "var(--text-3)"} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {f}
          </li>
        ))}
      </ul>
      <Link to="/auth/login" style={{ display:"block" }}>
        <button style={{
          width:"100%", padding:"13px", borderRadius:11, fontWeight:600, fontSize:14,
          cursor:"pointer", transition:"all 0.2s",
          background: featured
            ? "linear-gradient(135deg, var(--primary-brand), var(--primary-light))"
            : "var(--bg-card-hover)",
          color: featured ? "var(--text-on-primary)" : "var(--text-2)",
          border: featured ? "none" : `1px solid var(--border-default)`,
          boxShadow: featured ? "var(--shadow-primary)" : "none",
        }}
        onMouseEnter={e=>{e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-1px)"}}
        onMouseLeave={e=>{e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="none"}}
        >{cta}</button>
      </Link>
    </div>
  );
};

// ─── Animated number ──────────────────────────────────────────────────────────
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div style={{ textAlign:"center" }}>
    <div style={{ fontSize:36, fontWeight:800, color:"var(--text-1)", letterSpacing:"-1.5px", lineHeight:1 }}>{value}</div>
    <div style={{ color:"var(--text-3)", fontSize:11.5, marginTop:7, letterSpacing:"0.1em", textTransform:"uppercase" }}>{label}</div>
  </div>
);

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark = ({ size=34 }: { size?: number }) => (
  <div style={{
    width:size, height:size, borderRadius:Math.round(size*0.28),
    background:"linear-gradient(135deg,#6d5ff6,#a78bfa)",
    display:"flex", alignItems:"center", justifyContent:"center",
    boxShadow:"0 0 24px rgba(109,95,246,0.45)",
    flexShrink:0,
  }}>
    <svg width={size*0.52} height={size*0.52} viewBox="0 0 18 18" fill="none">
      <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 12.5L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" fillOpacity="0.9"/>
    </svg>
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
      minHeight:"100vh",
      background:"var(--bg-base)",
      color:"var(--text-1)",
      fontFamily:"var(--font-sans)",
      overflowX:"hidden",
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
        position:"sticky", top:0, zIndex:100,
        padding:"0 40px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: scrolled ? "var(--glass-bg)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid var(--border-default)` : "1px solid transparent",
        transition:"all 0.3s ease",
        boxShadow: scrolled ? "var(--shadow-sm)" : "none",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LogoMark size={32}/>
          <span style={{ fontSize:16, fontWeight:700, color:"var(--text-1)", letterSpacing:"-0.5px" }}>
            Note<span style={{ color:"var(--primary-brand)" }}>Atlas</span>
          </span>
        </div>

        <nav className="desktop-nav" style={{ display:"flex", gap:36, alignItems:"center" }}>
          <a href="#features" className="nav-a">Features</a>
          <a href="#pricing" className="nav-a">Pricing</a>
          <a href="#" className="nav-a">Docs</a>
        </nav>

        <div className="desktop-nav" style={{ display:"flex", alignItems:"center", gap:12 }}>
          <ThemeToggle />
          {!user && <Link to="/auth/login" className="nav-a" style={{ marginRight:4 }}>Sign in</Link>}
          <Link to="/notes">
            <button className="cta-btn" style={{ padding:"9px 20px", fontSize:13.5, borderRadius:9 }}>
              {user ? "Dashboard" : "Get Started"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </Link>
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
          {!user && <Link to="/auth/login" className="nav-a" onClick={() => setMobileMenuOpen(false)}>Sign in</Link>}
          <Link to="/notes" onClick={() => setMobileMenuOpen(false)}>
            <button className="cta-btn" style={{ width: "100%", justifyContent: "center" }}>
              {user ? "Dashboard" : "Get Started"}
            </button>
          </Link>
        </div>
      )}

      {/* ── HERO ────────────────────────────────────────── */}
      <section style={{ position:"relative", padding:"130px 24px 110px", textAlign:"center", overflow:"hidden" }}>
        <GridLines opacity={0.045}/>
        <div style={{ position:"relative", zIndex:1, maxWidth:880, margin:"0 auto" }}>

          <div className="fu fu1" style={{ marginBottom:26 }}>
            <Pill>AI-powered document intelligence</Pill>
          </div>

          <h1 className="fu fu2 serif" style={{
            fontSize:"clamp(46px, 7.5vw, 88px)",
            fontWeight:400,
            letterSpacing:"-2.5px",
            lineHeight:1.06,
            marginBottom:20,
            color:"var(--text-1)",
          }}>
            Your personal<br/>
            <em className="grad-text" style={{ fontStyle:"italic" }}>AI research</em> assistant
          </h1>

          <div className="fu fu3" style={{
            fontSize:"clamp(18px, 2.5vw, 24px)",
            fontWeight:400,
            color:"var(--text-3)",
            marginBottom:18,
            display:"flex", justifyContent:"center", alignItems:"center", gap:7,
            minHeight:38,
          }}>
            <span>Ask questions about your</span>
            <span style={{ color:"var(--primary-light)", fontWeight:500 }}>{typed}</span>
            <span className="cursor"/>
          </div>

          <p className="fu fu3" style={{
            fontSize:16.5, color:"var(--text-3)", lineHeight:1.85,
            maxWidth:540, margin:"0 auto 44px",
          }}>
            Upload documents, generate instant summaries, and chat directly with your sources. Turn scattered notes into organized knowledge.
          </p>

          <div className="fu fu4" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/notes">
              <button className="cta-btn">
                {user ? "Go to your dashboard" : "Get started free"}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </Link>
            {!user && (
              <Link to="/auth/login">
                <button className="ghost-btn">Sign in to account</button>
              </Link>
            )}
          </div>

          {/* Trust bar */}
          {/* <div style={{
            marginTop:80, paddingTop:52,
            borderTop:`1px solid var(--border-default)`,
            display:"flex", gap:56, justifyContent:"center", flexWrap:"wrap",
          }}>
            <Stat value="50K+" label="Active users"/>
            <div style={{ width:1, background:"var(--border-default)", alignSelf:"stretch", margin:"4px 0" }}/>
            <Stat value="2M+" label="Documents"/>
            <div style={{ width:1, background:"var(--border-default)", alignSelf:"stretch", margin:"4px 0" }}/>
            <Stat value="99.9%" label="Uptime"/>
            <div style={{ width:1, background:"var(--border-default)", alignSelf:"stretch", margin:"4px 0" }}/>
            <Stat value="<1s" label="Response time"/>
          </div> */}
        </div>

        {/* Bottom glow bloom */}
        <div style={{
          position:"absolute", bottom:-40, left:"50%", transform:"translateX(-50%)",
          width:700, height:180,
          background:"radial-gradient(ellipse, var(--primary-glow) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>
      </section>

      <Divider/>

      {/* ── PRODUCT PREVIEW (mock terminal) ─────────────── */}
      <section style={{ padding:"90px 24px", maxWidth:920, margin:"0 auto" }}>
        <div style={{
          borderRadius:20,
          border:`1px solid var(--border-default)`,
          overflow:"hidden",
          background:"var(--bg-surface)",
          boxShadow:"var(--shadow-xl)",
        }}>
          {/* Window chrome */}
          <div style={{
            padding:"14px 18px",
            borderBottom:`1px solid var(--border-default)`,
            display:"flex", alignItems:"center", gap:12,
            background:"var(--bg-elevated)",
          }}>
            <div style={{ display:"flex", gap:7 }}>
              {["#ff5f57","#febc2e","#28c840"].map((c,i)=>(
                <div key={i} style={{ width:13,height:13,borderRadius:"50%",background:c,opacity:0.85 }}/>
              ))}
            </div>
            <div style={{
              flex:1, textAlign:"center",
              background:"var(--bg-card)", borderRadius:7,
              padding:"5px 14px", fontSize:12, color:"var(--text-3)", fontFamily:"var(--font-mono)",
              maxWidth:260, margin:"0 auto",
              border:`1px solid var(--border-default)`,
            }}>app.noteatlas.ai</div>
          </div>

          {/* Chat UI mock */}
          <div style={{ padding:"28px 32px", display:"flex", flexDirection:"column", gap:18, minHeight:280 }}>
            {/* AI message */}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", maxWidth:560 }}>
              <div style={{
                width:30, height:30, borderRadius:8,
                background:"linear-gradient(135deg,#6d5ff6,#a78bfa)",
                flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.8 5.4H13.5L9.85 8.1L11.1 12.7L7 9.8L2.9 12.7L4.15 8.1L0.5 5.4H5.2L7 1Z" fill="white" fillOpacity="0.9"/></svg>
              </div>
              <div style={{
                background:"var(--primary-glow)", border:`1px solid var(--primary-border)`,
                borderRadius:"4px 16px 16px 16px", padding:"12px 16px",
              }}>
                <p style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.7 }}>
                  I've analyzed your <span style={{ background:"var(--primary-mid)", padding:"1px 7px", borderRadius:5, fontSize:12.5, color:"var(--primary-brand)", fontWeight:500 }}>Q3 Research Report.pdf</span>. The key findings relate to market expansion in APAC — would you like a structured summary or should I highlight the risks section?
                </p>
              </div>
            </div>

            {/* User message */}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", maxWidth:400, alignSelf:"flex-end" }}>
              <div style={{
                background:"var(--bg-card-hover)", border:`1px solid var(--border-default)`,
                borderRadius:"16px 4px 16px 16px", padding:"12px 16px",
              }}>
                <p style={{ fontSize:13.5, color:"var(--text-2)", lineHeight:1.7 }}>
                  Give me the top 3 risks from the report.
                </p>
              </div>
              <div style={{
                width:30, height:30, borderRadius:8, background:"var(--bg-card-hover)",
                flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                color:"var(--text-3)", fontSize:14, fontWeight:700,
                border:`1px solid var(--border-default)`,
              }}>U</div>
            </div>

            {/* AI streaming response */}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", maxWidth:580 }}>
              <div style={{
                width:30, height:30, borderRadius:8,
                background:"linear-gradient(135deg,#6d5ff6,#a78bfa)",
                flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1L8.8 5.4H13.5L9.85 8.1L11.1 12.7L7 9.8L2.9 12.7L4.15 8.1L0.5 5.4H5.2L7 1Z" fill="white" fillOpacity="0.9"/></svg>
              </div>
              <div style={{
                background:"var(--primary-glow)", border:`1px solid var(--primary-border)`,
                borderRadius:"4px 16px 16px 16px", padding:"14px 16px",
                display:"flex", flexDirection:"column", gap:9,
              }}>
                {["Regulatory uncertainty in APAC markets (pg. 14)", "Supply chain dependencies — 60% single-source exposure", "Currency volatility impact on Q4 projections"].map((r,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:18,height:18,borderRadius:5,background:"var(--primary-mid)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--primary-brand)",marginTop:1 }}>{i+1}</div>
                    <span style={{ fontSize:13, color:"var(--text-2)", lineHeight:1.65 }}>{r}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="features" style={{ padding:"100px 24px", maxWidth:1200, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ color:"var(--primary-brand)", fontWeight:600, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Capabilities</p>
          <h2 className="serif" style={{ fontSize:"clamp(30px, 4.5vw, 50px)", fontWeight:400, color:"var(--text-1)", letterSpacing:"-1.5px", marginBottom:16 }}>
            Built for <em style={{ fontStyle:"italic", color:"var(--primary-light)" }}>deep research</em>
          </h2>
          <p style={{ color:"var(--text-3)", fontSize:16, maxWidth:440, margin:"0 auto", lineHeight:1.75 }}>
            Every feature is designed to make working with documents faster, smarter, and more intuitive.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(268px, 1fr))", gap:18 }}>
          <FeatureCard delay={0} icon={<Brain size={22}/>} title="AI chat over your docs" desc="Ask questions in natural language. Get cited, context-aware answers grounded in your uploaded documents."/>
          <FeatureCard delay={80} icon={<Zap size={22}/>} title="Auto summarization" desc="Generate concise summaries, FAQs, study guides, and briefing docs from your PDFs and notes in seconds."/>
          <FeatureCard delay={160} icon={<Lock size={22}/>} title="Private & secure" desc="Your documents stay in your account. We never use your content to train AI models."/>
          <FeatureCard delay={240} icon={<MessageSquare size={22}/>} title="Multi-source chat" desc="Select multiple documents and chat across all of them simultaneously. Cross-reference with ease."/>
          <FeatureCard delay={320} icon={<Folder size={22}/>} title="Smart notebooks" desc="Organize documents into notebooks with full-text search, source management, and mind map generation."/>
          <FeatureCard delay={400} icon={<Search size={22}/>} title="Audio overviews" desc="Turn your documents into podcast-style audio discussions. Study on the go with AI-generated audio."/>
        </div>
      </section>

      <Divider/>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={{ padding:"100px 24px", maxWidth:860, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ color:"var(--primary-brand)", fontWeight:600, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Simple workflow</p>
          <h2 className="serif" style={{ fontSize:"clamp(28px, 4vw, 46px)", fontWeight:400, color:"var(--text-1)", letterSpacing:"-1.5px" }}>
            Three steps to clarity
          </h2>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {[
            { n:"01", title:"Upload your documents", desc:"Drop PDFs, text files, or paste content. NoteAtlas parses and indexes everything instantly.", color:"#6d5ff6" },
            { n:"02", title:"Ask questions naturally", desc:"Use plain language to ask about concepts, compare ideas, or find specific information buried deep in your docs.", color:"#8b5cf6" },
            { n:"03", title:"Get cited answers", desc:"Every response links back to the exact source passage. Trust but verify — always.", color:"#a78bfa" },
          ].map((step, i) => (
            <div key={i} style={{
              display:"flex", gap:28, alignItems:"flex-start",
              padding:"32px 28px",
              borderRadius:16,
              border:`1px solid var(--border-default)`,
              background:"var(--bg-card)",
              backdropFilter:"blur(10px)",
              position:"relative",
              ...(i < 2 ? { marginBottom:0 } : {}),
            }}>
              <div style={{
                width:44, height:44, borderRadius:12, flexShrink:0,
                background:"var(--primary-glow)",
                border:`1px solid var(--primary-border)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:step.color, fontWeight:700, fontSize:13, fontFamily:"var(--font-mono)",
              }}>{step.n}</div>
              <div>
                <h3 style={{ color:"var(--text-1)", fontWeight:600, fontSize:16, marginBottom:7 }}>{step.title}</h3>
                <p style={{ color:"var(--text-3)", fontSize:14, lineHeight:1.75 }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" style={{ padding:"100px 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <p style={{ color:"var(--primary-brand)", fontWeight:600, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14 }}>Pricing</p>
            <h2 className="serif" style={{ fontSize:"clamp(28px, 4.5vw, 50px)", fontWeight:400, color:"var(--text-1)", letterSpacing:"-1.5px", marginBottom:14 }}>
              Start free, top up when needed
            </h2>
            <p style={{ color:"var(--text-3)", fontSize:16 }}>Credits-based pricing — no subscriptions, no recurring bills. Pay once, use anytime.</p>
          </div>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(290px, 1fr))",
            gap:22,
            alignItems:"center",
          }}>
            <PricingCard
              tier="Starter"
              price="Free"
              period=""
              desc="Get started with AI notebooks at no cost."
              cta="Get started free"
              features={["50 credits on signup","AI chat over documents","Summarization & FAQs","Up to 5 notebooks","Community support"]}
            />
            <PricingCard
              tier="Pro"
              price="₹499"
              period="per top-up"
              desc="For active researchers and students who need more AI power."
              cta="Buy Pro Credits"
              featured
              badge="Most popular"
              features={["3,000 credits added","All AI features unlocked","Mind maps & Study guides","Audio Overviews","Priority responses","Email support"]}
            />
            <PricingCard
              tier="Premium"
              price="₹999"
              period="per top-up"
              desc="For power users and heavy AI research workflows."
              cta="Buy Premium Credits"
              features={["10,000 credits added","All Pro features","Flashcards & Quizzes","PPT generation","Fastest AI responses","Priority support"]}
            />
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ───────────────────────────────────── */}
      <section style={{ padding:"80px 24px", maxWidth:800, margin:"0 auto", textAlign:"center" }}>
        <div style={{
          padding:"64px 48px",
          borderRadius:24,
          border:`1px solid var(--border-accent)`,
          background:"var(--primary-glow)",
          backdropFilter:"blur(16px)",
          boxShadow:"var(--shadow-primary-lg)",
          position:"relative",
          overflow:"hidden",
        }}>
          <GridLines opacity={0.06}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <h2 className="serif" style={{ fontSize:"clamp(28px, 4vw, 46px)", fontWeight:400, letterSpacing:"-1.5px", marginBottom:16, color:"var(--text-1)" }}>
              Ready to think <em style={{ fontStyle:"italic", color:"var(--primary-light)" }}>smarter?</em>
            </h2>
            <p style={{ color:"var(--text-3)", fontSize:16, lineHeight:1.8, marginBottom:36, maxWidth:420, margin:"0 auto 36px" }}>
              Start free with 50 credits — no card required. Recharge anytime to unlock more AI power.
            </p>
            <Link to="/notes">
              <button className="cta-btn" style={{ fontSize:16, padding:"16px 36px", borderRadius:13 }}>
                Start for free — no card required
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer className="footer-container" style={{
        borderTop:`1px solid var(--border-default)`,
        padding:"36px 40px",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        flexWrap:"wrap",
        gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <LogoMark size={26}/>
          <span style={{ fontSize:14, fontWeight:600, color:"var(--text-3)", letterSpacing:"-0.3px" }}>NoteAtlas</span>
        </div>
        <p style={{ color:"var(--text-4)", fontSize:12.5 }}>
          © {new Date().getFullYear()} NoteAtlas Clone · Built for productivity
        </p>
        <nav style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Status"].map(l=>(
            <a key={l} href="#" style={{ color:"var(--text-3)", fontSize:12.5, textDecoration:"none", transition:"color 0.2s" }}
              onMouseEnter={e=>(e.target as HTMLElement).style.color="var(--text-1)"}
              onMouseLeave={e=>(e.target as HTMLElement).style.color="var(--text-3)"}>{l}</a>
          ))}
        </nav>
      </footer>
    </div>
  );
}