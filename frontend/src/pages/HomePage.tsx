import { Link } from "react-router";
import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getUserData } from "@/helper/getUserData";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  font: "'Instrument Serif', 'Playfair Display', Georgia, serif",
  fontSans: "'DM Sans', 'Outfit', system-ui, sans-serif",
  fontMono: "'DM Mono', monospace",
  bg: "var(--bg-base)",
  bgSurface: "var(--bg-surface)",
  bgCard: "var(--bg-card)",
  bgCardHover: "var(--bg-card-hover)",
  border: "var(--border-default)",
  borderHover: "var(--border-hover)",
  borderAccent: "var(--border-accent)",
  primary: "var(--primary-brand)",
  primaryLight: "var(--primary-light)",
  primaryGlow: "var(--primary-glow)",
  primaryMid: "var(--primary-mid)",
  text1: "var(--text-1)",
  text2: "var(--text-2)",
  text3: "var(--text-3)",
  accent: "#c4b5fd",
  green: "#4ade80",
  radius: "18px",
  radiusSm: "10px",
  shadow: "0 32px 64px rgba(0,0,0,0.5)",
  shadowCard: "0 8px 32px rgba(0,0,0,0.3)",
};

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
      background:"radial-gradient(circle, rgba(109,95,246,0.13) 0%, transparent 65%)",
      filter:"blur(40px)", animation:"orb1 14s ease-in-out infinite",
    }}/>
    <div style={{
      position:"absolute", bottom:"-5%", right:"-5%", width:550, height:550, borderRadius:"50%",
      background:"radial-gradient(circle, rgba(139,112,246,0.09) 0%, transparent 65%)",
      filter:"blur(40px)", animation:"orb2 17s ease-in-out infinite",
    }}/>
    <div style={{
      position:"absolute", top:"38%", right:"22%", width:360, height:360, borderRadius:"50%",
      background:"radial-gradient(circle, rgba(78,58,180,0.07) 0%, transparent 65%)",
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
const GridLines = ({ opacity = 0.04 }) => (
  <div style={{
    position:"absolute", inset:0, pointerEvents:"none", zIndex:0,
    backgroundImage:`linear-gradient(rgba(109,95,246,${opacity}) 1px, transparent 1px), linear-gradient(90deg, rgba(109,95,246,${opacity}) 1px, transparent 1px)`,
    backgroundSize:"72px 72px",
    maskImage:"radial-gradient(ellipse 90% 70% at 50% 0%, black 35%, transparent 100%)",
  }}/>
);

// ─── Pill badge ───────────────────────────────────────────────────────────────
const Pill = ({ children }) => (
  <span style={{
    display:"inline-flex", alignItems:"center", gap:8,
    padding:"5px 14px", borderRadius:"999px",
    border:`1px solid ${T.borderAccent}`,
    background:"rgba(109,95,246,0.08)",
    color:"#b5acff", fontSize:12, fontWeight:500, letterSpacing:"0.04em",
    backdropFilter:"blur(12px)",
  }}>
    <span style={{
      width:6, height:6, borderRadius:"50%",
      background:"#8b80f8", boxShadow:"0 0 6px #8b80f8",
      animation:"pulse 2.4s infinite",
    }}/>
    {children}
  </span>
);

// ─── Feature icon block ───────────────────────────────────────────────────────
const FeatureCard = ({ icon, title, desc, delay=0 }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        padding:"28px 24px",
        borderRadius:T.radius,
        border:`1px solid ${hover ? T.borderAccent : T.border}`,
        background: hover ? "rgba(109,95,246,0.07)" : T.bgCard,
        backdropFilter:"blur(12px)",
        transition:"all 0.28s ease",
        transform: hover ? "translateY(-4px)" : "none",
        boxShadow: hover ? `0 20px 48px rgba(109,95,246,0.14)` : "none",
        cursor:"default",
        animationDelay:`${delay}ms`,
      }}
    >
      <div style={{
        width:42, height:42, borderRadius:12,
        background: hover ? "rgba(109,95,246,0.22)" : "rgba(109,95,246,0.1)",
        border:`1px solid rgba(109,95,246,0.25)`,
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20, marginBottom:16,
        transition:"background 0.2s",
      }}>
        {icon}
      </div>
      <h3 style={{ color:T.text1, fontWeight:600, fontSize:15, marginBottom:8, fontFamily:T.fontSans }}>{title}</h3>
      <p style={{ color:T.text3, fontSize:13.5, lineHeight:1.75, fontFamily:T.fontSans }}>{desc}</p>
    </div>
  );
};

// ─── Divider ──────────────────────────────────────────────────────────────────
const Divider = () => <div style={{ height:1, background:`linear-gradient(90deg, transparent, ${T.border}, transparent)`, margin:"0 auto", width:"100%" }}/>;

// ─── Pricing Card ─────────────────────────────────────────────────────────────
const PricingCard = ({ tier, price, period, desc, features, cta, featured=false, badge }) => {
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
          ? `1.5px solid rgba(109,95,246,0.55)`
          : `1px solid ${hover ? T.borderHover : T.border}`,
        background: featured
          ? "linear-gradient(160deg, rgba(109,95,246,0.14) 0%, rgba(139,92,246,0.08) 100%)"
          : T.bgCard,
        backdropFilter:"blur(16px)",
        transform: featured ? "scale(1.03)" : hover ? "translateY(-3px)" : "scale(1)",
        boxShadow: featured
          ? "0 0 64px rgba(109,95,246,0.18), inset 0 1px 0 rgba(255,255,255,0.06)"
          : hover ? T.shadowCard : "none",
        transition:"all 0.25s ease",
      }}
    >
      {badge && (
        <div style={{
          position:"absolute", top:-13, left:"50%", transform:"translateX(-50%)",
          background:"linear-gradient(90deg,#f59e0b,#f97316)",
          color:"#fff", fontSize:10.5, fontWeight:700, padding:"4px 14px",
          borderRadius:999, letterSpacing:"0.08em", textTransform:"uppercase",
          boxShadow:"0 4px 14px rgba(245,158,11,0.35)",
        }}>{badge}</div>
      )}
      <p style={{ color:T.text3, fontSize:11, fontWeight:600, letterSpacing:"0.12em", textTransform:"uppercase", marginBottom:10, fontFamily:T.fontSans }}>{tier}</p>
      <div style={{ marginBottom:8 }}>
        <span style={{ fontSize:46, fontWeight:800, color:T.text1, letterSpacing:"-2px", fontFamily:T.fontSans }}>{price}</span>
        <span style={{ color:T.text3, fontSize:14, fontFamily:T.fontSans }}>{period}</span>
      </div>
      <p style={{ color:T.text3, fontSize:13, marginBottom:28, lineHeight:1.6, fontFamily:T.fontSans }}>{desc}</p>
      <ul style={{ listStyle:"none", margin:"0 0 32px", padding:0, display:"flex", flexDirection:"column", gap:11 }}>
        {features.map((f,i) => (
          <li key={i} style={{ display:"flex", alignItems:"center", gap:10, color: featured ? "#c4b5fd" : T.text2, fontSize:13.5, fontFamily:T.fontSans }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none"><circle cx="7.5" cy="7.5" r="7.5" fill={featured ? "rgba(109,95,246,0.25)" : "rgba(255,255,255,0.05)"}/><path d="M4.5 7.5L6.5 9.5L10.5 5.5" stroke={featured ? "#b5acff" : T.text3} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
            {f}
          </li>
        ))}
      </ul>
      <Link to="/auth/login" style={{ display:"block" }}>
        <button style={{
          width:"100%", padding:"13px", borderRadius:11, fontWeight:600, fontSize:14,
          cursor:"pointer", transition:"all 0.2s",
          background: featured
            ? "linear-gradient(135deg,#6d5ff6,#8b5cf6)"
            : "rgba(255,255,255,0.05)",
          color: featured ? "#fff" : T.text2,
          border: featured ? "none" : `1px solid ${T.border}`,
          boxShadow: featured ? "0 8px 28px rgba(109,95,246,0.38)" : "none",
          fontFamily: T.fontSans,
        }}
        onMouseEnter={e=>{e.currentTarget.style.opacity="0.82"; e.currentTarget.style.transform="translateY(-1px)"}}
        onMouseLeave={e=>{e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="none"}}
        >{cta}</button>
      </Link>
    </div>
  );
};

// ─── Animated number ──────────────────────────────────────────────────────────
const Stat = ({ value, label }) => (
  <div style={{ textAlign:"center" }}>
    <div style={{ fontSize:36, fontWeight:800, color:T.text1, letterSpacing:"-1.5px", lineHeight:1, fontFamily:T.fontSans }}>{value}</div>
    <div style={{ color:T.text3, fontSize:11.5, marginTop:7, letterSpacing:"0.1em", textTransform:"uppercase", fontFamily:T.fontSans }}>{label}</div>
  </div>
);

// ─── Logo mark ────────────────────────────────────────────────────────────────
const LogoMark = ({ size=34 }) => (
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
      background:T.bg,
      color:T.text1,
      fontFamily:T.fontSans,
      overflowX:"hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        html{scroll-behavior:smooth}
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-track{background:#080a12}
        ::-webkit-scrollbar-thumb{background:#2d2760;border-radius:3px}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}49%{opacity:1}50%,99%{opacity:0}}
        @keyframes shimmerGrad{0%{background-position:200% center}100%{background-position:-200% center}}
        .fu{opacity:0;animation:fadeUp 0.7s forwards}
        .fu1{animation-delay:0.08s}
        .fu2{animation-delay:0.18s}
        .fu3{animation-delay:0.32s}
        .fu4{animation-delay:0.48s}
        .nav-a{color:${T.text3};font-size:14px;font-weight:500;text-decoration:none;transition:color 0.2s;letter-spacing:-0.01em}
        .nav-a:hover{color:${T.accent}}
        .cursor{display:inline-block;width:2.5px;height:0.85em;background:#8b80f8;margin-left:2px;vertical-align:middle;animation:blink 1.1s step-end infinite;border-radius:2px}
        .grad-text{
          background:linear-gradient(130deg,#a78bfa 0%,#818cf8 40%,#c4b5fd 75%,#e0d7ff 100%);
          background-size:200% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
          animation:shimmerGrad 5s linear infinite;
        }
        .serif{font-family:'Instrument Serif',Georgia,serif}
        .cta-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 30px;border-radius:12px;
          font-weight:700;font-size:15px;
          background:linear-gradient(135deg,#6d5ff6,#8b5cf6);
          color:#fff;border:none;cursor:pointer;
          box-shadow:0 8px 32px rgba(109,95,246,0.38);
          transition:all 0.22s;
          font-family:${T.fontSans};
          letter-spacing:-0.01em;
        }
        .cta-btn:hover{transform:translateY(-2px);box-shadow:0 14px 44px rgba(109,95,246,0.52)}
        .ghost-btn{
          display:inline-flex;align-items:center;gap:8px;
          padding:14px 28px;border-radius:12px;
          font-weight:500;font-size:15px;
          background:rgba(255,255,255,0.04);
          color:${T.text2};border:1px solid ${T.border};
          cursor:pointer;transition:all 0.22s;
          font-family:${T.fontSans};
          backdropFilter:blur(8px);
        }
        .ghost-btn:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.14);color:${T.text1}}
      `}</style>

      <NoiseSvg />
      <MeshBg />

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <header style={{
        position:"sticky", top:0, zIndex:100,
        padding:"0 40px", height:60,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background: scrolled ? "rgba(5,6,13,0.82)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? `1px solid ${T.border}` : "1px solid transparent",
        transition:"all 0.3s ease",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <LogoMark size={32}/>
          <span style={{ fontSize:16, fontWeight:700, color:T.text1, letterSpacing:"-0.5px", fontFamily:T.fontSans }}>
            Notebook<span style={{ color:"#8b80f8" }}>LM</span>
          </span>
        </div>

        <nav style={{ display:"flex", gap:36, alignItems:"center" }}>
          <a href="#features" className="nav-a">Features</a>
          <a href="#pricing" className="nav-a">Pricing</a>
          <a href="#" className="nav-a">Docs</a>
        </nav>

        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <ThemeToggle />
          {!user && <Link to="/auth/login" className="nav-a" style={{ marginRight:4 }}>Sign in</Link>}
          <Link to="/notes">
            <button className="cta-btn" style={{ padding:"9px 20px", fontSize:13.5, borderRadius:9, boxShadow:"0 4px 18px rgba(109,95,246,0.32)" }}>
              {user ? "Dashboard" : "Get Started"}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7H12M8 3L12 7L8 11" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
          </Link>
        </div>
      </header>

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
            color:T.text1,
          }}>
            Your personal<br/>
            <em className="grad-text" style={{ fontStyle:"italic" }}>AI research</em> assistant
          </h1>

          <div className="fu fu3" style={{
            fontSize:"clamp(18px, 2.5vw, 24px)",
            fontWeight:400,
            color:T.text3,
            marginBottom:18,
            display:"flex", justifyContent:"center", alignItems:"center", gap:7,
            minHeight:38,
            fontFamily:T.fontSans,
          }}>
            <span>Ask questions about your</span>
            <span style={{ color:"#9f94ff", fontWeight:500 }}>{typed}</span>
            <span className="cursor"/>
          </div>

          <p className="fu fu3" style={{
            fontSize:16.5, color:T.text3, lineHeight:1.85,
            maxWidth:540, margin:"0 auto 44px", fontFamily:T.fontSans,
          }}>
            Upload documents, generate instant summaries, and chat directly with your sources. Turn scattered notes into organized knowledge.
          </p>

          <div className="fu fu4" style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
            <Link to="/notes">
              <button className="cta-btn">
                {user ? "Go to your dashboard" : "Get started free"}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </Link>
            {!user && (
              <Link to="/auth/login">
                <button className="ghost-btn">Sign in to account</button>
              </Link>
            )}
          </div>

          {/* Trust bar */}
          <div style={{
            marginTop:80, paddingTop:52,
            borderTop:`1px solid ${T.border}`,
            display:"flex", gap:56, justifyContent:"center", flexWrap:"wrap",
          }}>
            <Stat value="50K+" label="Active users"/>
            <div style={{ width:1, background:T.border, alignSelf:"stretch", margin:"4px 0" }}/>
            <Stat value="2M+" label="Documents"/>
            <div style={{ width:1, background:T.border, alignSelf:"stretch", margin:"4px 0" }}/>
            <Stat value="99.9%" label="Uptime"/>
            <div style={{ width:1, background:T.border, alignSelf:"stretch", margin:"4px 0" }}/>
            <Stat value="<1s" label="Response time"/>
          </div>
        </div>

        {/* Bottom glow bloom */}
        <div style={{
          position:"absolute", bottom:-40, left:"50%", transform:"translateX(-50%)",
          width:700, height:180,
          background:"radial-gradient(ellipse, rgba(109,95,246,0.1) 0%, transparent 70%)",
          pointerEvents:"none",
        }}/>
      </section>

      <Divider/>

      {/* ── PRODUCT PREVIEW (mock terminal) ─────────────── */}
      <section style={{ padding:"90px 24px", maxWidth:920, margin:"0 auto" }}>
        <div style={{
          borderRadius:20,
          border:`1px solid ${T.border}`,
          overflow:"hidden",
          background:T.bgSurface,
          boxShadow:`0 40px 96px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)`,
        }}>
          {/* Window chrome */}
          <div style={{
            padding:"14px 18px",
            borderBottom:`1px solid ${T.border}`,
            display:"flex", alignItems:"center", gap:12,
            background:"rgba(255,255,255,0.02)",
          }}>
            <div style={{ display:"flex", gap:7 }}>
              {["#ff5f57","#febc2e","#28c840"].map((c,i)=>(
                <div key={i} style={{ width:13,height:13,borderRadius:"50%",background:c,opacity:0.85 }}/>
              ))}
            </div>
            <div style={{
              flex:1, textAlign:"center",
              background:"rgba(255,255,255,0.04)", borderRadius:7,
              padding:"5px 14px", fontSize:12, color:T.text3, fontFamily:T.fontMono,
              maxWidth:260, margin:"0 auto",
            }}>app.notebooklm.ai</div>
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
                background:"rgba(109,95,246,0.1)", border:`1px solid rgba(109,95,246,0.2)`,
                borderRadius:"4px 16px 16px 16px", padding:"12px 16px",
              }}>
                <p style={{ fontSize:13.5, color:"#c4b5fd", lineHeight:1.7, fontFamily:T.fontSans }}>
                  I've analyzed your <span style={{ background:"rgba(109,95,246,0.25)", padding:"1px 7px", borderRadius:5, fontSize:12.5 }}>Q3 Research Report.pdf</span>. The key findings relate to market expansion in APAC — would you like a structured summary or should I highlight the risks section?
                </p>
              </div>
            </div>

            {/* User message */}
            <div style={{ display:"flex", gap:12, alignItems:"flex-start", maxWidth:400, alignSelf:"flex-end" }}>
              <div style={{
                background:"rgba(255,255,255,0.06)", border:`1px solid ${T.border}`,
                borderRadius:"16px 4px 16px 16px", padding:"12px 16px",
              }}>
                <p style={{ fontSize:13.5, color:T.text2, lineHeight:1.7, fontFamily:T.fontSans }}>
                  Give me the top 3 risks from the report.
                </p>
              </div>
              <div style={{
                width:30, height:30, borderRadius:8, background:"rgba(255,255,255,0.07)",
                flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
                color:T.text3, fontSize:14, fontWeight:700, fontFamily:T.fontSans,
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
                background:"rgba(109,95,246,0.1)", border:`1px solid rgba(109,95,246,0.2)`,
                borderRadius:"4px 16px 16px 16px", padding:"14px 16px",
                display:"flex", flexDirection:"column", gap:9,
              }}>
                {["Regulatory uncertainty in APAC markets (pg. 14)", "Supply chain dependencies — 60% single-source exposure", "Currency volatility impact on Q4 projections"].map((r,i)=>(
                  <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
                    <div style={{ width:18,height:18,borderRadius:5,background:"rgba(109,95,246,0.3)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#b5acff",marginTop:1 }}>{i+1}</div>
                    <span style={{ fontSize:13, color:"#c4b5fd", lineHeight:1.65, fontFamily:T.fontSans }}>{r}</span>
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
          <p style={{ color:"#6d5ff6", fontWeight:600, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14, fontFamily:T.fontSans }}>Capabilities</p>
          <h2 className="serif" style={{ fontSize:"clamp(30px, 4.5vw, 50px)", fontWeight:400, color:T.text1, letterSpacing:"-1.5px", marginBottom:16 }}>
            Built for <em style={{ fontStyle:"italic", color:"#9f94ff" }}>deep research</em>
          </h2>
          <p style={{ color:T.text3, fontSize:16, maxWidth:440, margin:"0 auto", lineHeight:1.75, fontFamily:T.fontSans }}>
            Every feature is designed to make working with documents faster, smarter, and more intuitive.
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(268px, 1fr))", gap:18 }}>
          <FeatureCard delay={0} icon="🧠" title="AI-powered chat" desc="Ask anything about your documents. Get instant, context-aware answers grounded in your actual sources."/>
          <FeatureCard delay={80} icon="⚡" title="Auto summarization" desc="Generate concise TL;DRs of dense documents in seconds. Key insights surfaced automatically."/>
          <FeatureCard delay={160} icon="🔒" title="Private & secure" desc="Your documents stay in your account. End-to-end encryption keeps your research fully confidential."/>
          <FeatureCard delay={240} icon="💬" title="Multi-source chat" desc="Chat across multiple documents at once. Cross-reference, compare, and synthesize with ease."/>
          <FeatureCard delay={320} icon="📁" title="Smart notebooks" desc="Organize documents with auto-tagging, full-text search, and intelligent grouping."/>
          <FeatureCard delay={400} icon="🔍" title="Semantic search" desc="Go beyond keyword matching. Find relevant passages by meaning across your entire library."/>
        </div>
      </section>

      <Divider/>

      {/* ── HOW IT WORKS ────────────────────────────────── */}
      <section style={{ padding:"100px 24px", maxWidth:860, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:64 }}>
          <p style={{ color:"#6d5ff6", fontWeight:600, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14, fontFamily:T.fontSans }}>Simple workflow</p>
          <h2 className="serif" style={{ fontSize:"clamp(28px, 4vw, 46px)", fontWeight:400, color:T.text1, letterSpacing:"-1.5px" }}>
            Three steps to clarity
          </h2>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
          {[
            { n:"01", title:"Upload your documents", desc:"Drop PDFs, text files, or paste content. NotebookLM parses and indexes everything instantly.", color:"#6d5ff6" },
            { n:"02", title:"Ask questions naturally", desc:"Use plain language to ask about concepts, compare ideas, or find specific information buried deep in your docs.", color:"#8b5cf6" },
            { n:"03", title:"Get cited answers", desc:"Every response links back to the exact source passage. Trust but verify — always.", color:"#a78bfa" },
          ].map((step, i) => (
            <div key={i} style={{
              display:"flex", gap:28, alignItems:"flex-start",
              padding:"32px 28px",
              borderRadius:16,
              border:`1px solid ${T.border}`,
              background:T.bgCard,
              backdropFilter:"blur(10px)",
              position:"relative",
              ...(i < 2 ? { marginBottom:0 } : {}),
            }}>
              <div style={{
                width:44, height:44, borderRadius:12, flexShrink:0,
                background:`rgba(${step.color === "#6d5ff6" ? "109,95,246" : step.color === "#8b5cf6" ? "139,92,246" : "167,139,250"},0.15)`,
                border:`1px solid rgba(${step.color === "#6d5ff6" ? "109,95,246" : step.color === "#8b5cf6" ? "139,92,246" : "167,139,250"},0.3)`,
                display:"flex", alignItems:"center", justifyContent:"center",
                color:step.color, fontWeight:700, fontSize:13, fontFamily:T.fontMono,
              }}>{step.n}</div>
              <div>
                <h3 style={{ color:T.text1, fontWeight:600, fontSize:16, marginBottom:7, fontFamily:T.fontSans }}>{step.title}</h3>
                <p style={{ color:T.text3, fontSize:14, lineHeight:1.75, fontFamily:T.fontSans }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────── */}
      <section id="pricing" style={{ padding:"100px 24px" }}>
        <div style={{ maxWidth:1080, margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:64 }}>
            <p style={{ color:"#6d5ff6", fontWeight:600, fontSize:12, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:14, fontFamily:T.fontSans }}>Pricing</p>
            <h2 className="serif" style={{ fontSize:"clamp(28px, 4.5vw, 50px)", fontWeight:400, color:T.text1, letterSpacing:"-1.5px", marginBottom:14 }}>
              Start free, scale when ready
            </h2>
            <p style={{ color:T.text3, fontSize:16, fontFamily:T.fontSans }}>No credit card required. Upgrade anytime.</p>
          </div>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit, minmax(290px, 1fr))",
            gap:22,
            alignItems:"center",
          }}>
            <PricingCard
              tier="Basic"
              price="$0"
              period="/month"
              desc="Perfect for getting started with AI-assisted reading."
              cta="Get started free"
              features={["Up to 3 notebooks","10MB max file size","Basic AI chat (GPT-3.5)","Standard support"]}
            />
            <PricingCard
              tier="Pro"
              price="$12"
              period="/month"
              desc="Everything you need for serious research and productivity."
              cta="Upgrade to Pro"
              featured
              badge="Most popular"
              features={["Unlimited notebooks","100MB max file size","Advanced AI (GPT-4o)","Priority support","Multi-source chat","Custom export"]}
            />
            <PricingCard
              tier="Enterprise"
              price="$49"
              period="/user/month"
              desc="For teams who need collaboration and advanced controls."
              cta="Contact sales"
              features={["Everything in Pro","Shared team workspaces","Admin dashboard","SSO & SAML","Custom integrations","24/7 dedicated support"]}
            />
          </div>
        </div>
      </section>

      {/* ── CTA STRIP ───────────────────────────────────── */}
      <section style={{ padding:"80px 24px", maxWidth:800, margin:"0 auto", textAlign:"center" }}>
        <div style={{
          padding:"64px 48px",
          borderRadius:24,
          border:`1px solid rgba(109,95,246,0.25)`,
          background:"linear-gradient(160deg, rgba(109,95,246,0.1) 0%, rgba(139,92,246,0.06) 100%)",
          backdropFilter:"blur(16px)",
          boxShadow:"0 0 80px rgba(109,95,246,0.1)",
          position:"relative",
          overflow:"hidden",
        }}>
          <GridLines opacity={0.06}/>
          <div style={{ position:"relative", zIndex:1 }}>
            <h2 className="serif" style={{ fontSize:"clamp(28px, 4vw, 46px)", fontWeight:400, letterSpacing:"-1.5px", marginBottom:16, color:T.text1 }}>
              Ready to think <em style={{ fontStyle:"italic", color:"#9f94ff" }}>smarter?</em>
            </h2>
            <p style={{ color:T.text3, fontSize:16, lineHeight:1.8, marginBottom:36, maxWidth:420, margin:"0 auto 36px", fontFamily:T.fontSans }}>
              Join 50,000+ researchers, students, and professionals who rely on NotebookLM.
            </p>
            <Link to="/notes">
              <button className="cta-btn" style={{ fontSize:16, padding:"16px 36px", borderRadius:13 }}>
                Start for free — no card required
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8H13M9 4L13 8L9 12" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <footer style={{
        borderTop:`1px solid ${T.border}`,
        padding:"36px 40px",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        flexWrap:"wrap",
        gap:16,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <LogoMark size={26}/>
          <span style={{ fontSize:14, fontWeight:600, color:T.text3, fontFamily:T.fontSans, letterSpacing:"-0.3px" }}>NotebookLM</span>
        </div>
        <p style={{ color:T.text3, fontSize:12.5, fontFamily:T.fontSans }}>
          © {new Date().getFullYear()} NotebookLM Clone · Built for productivity
        </p>
        <nav style={{ display:"flex", gap:24 }}>
          {["Privacy","Terms","Status"].map(l=>(
            <a key={l} href="#" style={{ color:T.text3, fontSize:12.5, textDecoration:"none", fontFamily:T.fontSans, transition:"color 0.2s" }}
              onMouseEnter={e=>e.target.style.color=T.text2}
              onMouseLeave={e=>e.target.style.color=T.text3}>{l}</a>
          ))}
        </nav>
      </footer>
    </div>
  );
}