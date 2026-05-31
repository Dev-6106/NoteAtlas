import { Link } from "react-router";
import { CheckCircle2, ChevronRight, Sparkles, Zap, Shield, Brain, FileText, MessageSquare, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/helper/getUserData";
import UserAvatar from "@/components/base/UserAvatar";
import { useState, useEffect, useRef } from "react";

/* ─── Floating Orb Background ─── */
const Orbs = () => (
  <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10">
    <div style={{
      position: 'absolute', top: '-20%', left: '-10%',
      width: '600px', height: '600px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
      animation: 'floatOrb1 12s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', bottom: '-10%', right: '-5%',
      width: '500px', height: '500px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
      animation: 'floatOrb2 15s ease-in-out infinite',
    }} />
    <div style={{
      position: 'absolute', top: '40%', right: '20%',
      width: '300px', height: '300px', borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
      animation: 'floatOrb3 18s ease-in-out infinite',
    }} />
    <style>{`
      @keyframes floatOrb1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(40px,-60px)} }
      @keyframes floatOrb2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-50px,40px)} }
      @keyframes floatOrb3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,50px)} }
    `}</style>
  </div>
);

/* ─── Animated Grid Lines ─── */
const GridBg = () => (
  <div style={{
    position: 'absolute', inset: 0, zIndex: 0,
    backgroundImage: `linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)`,
    backgroundSize: '60px 60px',
    maskImage: 'radial-gradient(ellipse 80% 60% at 50% 0%, black 40%, transparent 100%)',
  }} />
);

/* ─── Glowing Badge ─── */
const GlowBadge = ({ children }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '6px 16px', borderRadius: '999px',
    border: '1px solid rgba(99,102,241,0.4)',
    background: 'rgba(99,102,241,0.1)',
    color: '#a5b4fc', fontSize: '13px', fontWeight: 500,
    backdropFilter: 'blur(8px)',
    boxShadow: '0 0 20px rgba(99,102,241,0.15)',
  }}>
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: '#818cf8', boxShadow: '0 0 8px #818cf8',
      animation: 'pulse 2s infinite',
    }} />
    {children}
    <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
  </span>
);

/* ─── Feature Card ─── */
const FeatureCard = ({ icon: Icon, title, desc, delay = 0 }) => (
  <div style={{
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '20px', padding: '28px',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s ease',
    animationDelay: `${delay}ms`,
    cursor: 'default',
  }}
  onMouseEnter={e => {
    e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
    e.currentTarget.style.transform = 'translateY(-4px)';
    e.currentTarget.style.boxShadow = '0 20px 40px rgba(99,102,241,0.15)';
  }}
  onMouseLeave={e => {
    e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = 'none';
  }}>
    <div style={{
      width: 48, height: 48, borderRadius: '14px',
      background: 'rgba(99,102,241,0.15)',
      border: '1px solid rgba(99,102,241,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 16,
    }}>
      <Icon size={22} style={{ color: '#818cf8' }} />
    </div>
    <h3 style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '16px', marginBottom: 8 }}>{title}</h3>
    <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.7 }}>{desc}</p>
  </div>
);

/* ─── Pricing Card ─── */
const PricingCard = ({ tier, price, sub, features, cta, highlight = false, badge }) => (
  <div style={{
    position: 'relative',
    background: highlight
      ? 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.15) 100%)'
      : 'rgba(255,255,255,0.03)',
    border: highlight ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.07)',
    borderRadius: '24px', padding: '36px',
    backdropFilter: 'blur(16px)',
    transform: highlight ? 'scale(1.04)' : 'scale(1)',
    boxShadow: highlight ? '0 0 60px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.3)' : 'none',
    transition: 'all 0.3s ease',
  }}>
    {badge && (
      <div style={{
        position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(90deg,#f59e0b,#ef4444)',
        color: '#fff', fontSize: '11px', fontWeight: 700,
        padding: '4px 14px', borderRadius: '999px', letterSpacing: '0.08em', textTransform: 'uppercase',
        boxShadow: '0 4px 12px rgba(245,158,11,0.4)',
      }}>{badge}</div>
    )}
    <p style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>{tier}</p>
    <div style={{ marginBottom: 24 }}>
      <span style={{ fontSize: '48px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-2px' }}>{price}</span>
      <span style={{ color: '#64748b', fontSize: '15px' }}>{sub}</span>
    </div>
    <ul style={{ listStyle: 'none', margin: '0 0 28px', padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {features.map((f, i) => (
        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: highlight ? '#c7d2fe' : '#94a3b8', fontSize: '14px' }}>
          <CheckCircle2 size={16} style={{ color: highlight ? '#818cf8' : '#4b5563', flexShrink: 0 }} />
          {f}
        </li>
      ))}
    </ul>
    <Link to="/auth/login" style={{ display: 'block' }}>
      <button style={{
        width: '100%', padding: '13px', borderRadius: '12px', fontWeight: 600, fontSize: '14px',
        cursor: 'pointer', transition: 'all 0.2s',
        background: highlight ? 'linear-gradient(135deg,#6366f1,#8b5cf6)' : 'rgba(255,255,255,0.06)',
        color: highlight ? '#fff' : '#94a3b8',
        border: highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
        boxShadow: highlight ? '0 8px 24px rgba(99,102,241,0.4)' : 'none',
      }}
      onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        {cta}
      </button>
    </Link>
  </div>
);

/* ─── Stat Counter ─── */
const StatItem = ({ value, label }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{ fontSize: '40px', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', lineHeight: 1 }}>{value}</div>
    <div style={{ color: '#64748b', fontSize: '13px', marginTop: 6, letterSpacing: '0.05em' }}>{label}</div>
  </div>
);

/* ─── Main Component ─── */
const HomePage = () => {
  const userData = getUserData();
  const [scrolled, setScrolled] = useState(false);
  const [typedText, setTypedText] = useState('');
  const phrases = ['Research Papers', 'Meeting Notes', 'Study Materials', 'Legal Documents'];
  const phraseIndex = useRef(0);
  const charIndex = useRef(0);
  const deleting = useRef(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const tick = () => {
      const phrase = phrases[phraseIndex.current];
      if (!deleting.current) {
        setTypedText(phrase.slice(0, charIndex.current + 1));
        charIndex.current++;
        if (charIndex.current === phrase.length) {
          deleting.current = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        setTypedText(phrase.slice(0, charIndex.current - 1));
        charIndex.current--;
        if (charIndex.current === 0) {
          deleting.current = false;
          phraseIndex.current = (phraseIndex.current + 1) % phrases.length;
        }
      }
      setTimeout(tick, deleting.current ? 60 : 100);
    };
    const t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b14',
      color: '#e2e8f0',
      fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
      overflowX: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1120; }
        ::-webkit-scrollbar-thumb { background: #312e81; border-radius: 3px; }
        .nav-link { color: #64748b; font-size: 14px; font-weight: 500; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: #a5b4fc; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-d1 { animation: fadeUp 0.7s 0.1s ease both; }
        .fade-up-d2 { animation: fadeUp 0.7s 0.2s ease both; }
        .fade-up-d3 { animation: fadeUp 0.7s 0.35s ease both; }
        .fade-up-d4 { animation: fadeUp 0.7s 0.5s ease both; }
        .cursor { display:inline-block; width:3px; height:1em; background:#818cf8; margin-left:3px; vertical-align:middle; animation:blink 1s infinite; }
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .gradient-text {
          background: linear-gradient(135deg, #a5b4fc 0%, #818cf8 40%, #c084fc 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .shimmer-btn:hover { background-size: 200% auto; animation: shimmer 1.5s linear infinite; }
      `}</style>

      <Orbs />

      {/* ── NAVBAR ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0 32px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'rgba(8,11,20,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s ease',
        maxWidth: '100%',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99,102,241,0.5)',
          }}>
            <Sparkles size={18} color="#fff" />
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#f1f5f9', letterSpacing: '-0.5px' }}>NotebookLM</span>
        </div>

        {/* Nav Links */}
        <nav style={{ display: 'flex', gap: 32 }}>
          <a href="#features" className="nav-link">Features</a>
          <a href="#pricing" className="nav-link">Pricing</a>
        </nav>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {userData ? (
            <>
              <Link to="/notes">
                <button style={{
                  padding: '9px 22px', borderRadius: '999px', fontWeight: 600, fontSize: 14,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(99,102,241,0.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(99,102,241,0.35)'}}>
                  Dashboard
                </button>
              </Link>
              <UserAvatar />
            </>
          ) : (
            <>
              <Link to="/auth/login" className="nav-link">Sign In</Link>
              <Link to="/auth/login">
                <button style={{
                  padding: '9px 22px', borderRadius: '999px', fontWeight: 600, fontSize: 14,
                  background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                  border: 'none', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 8px 28px rgba(99,102,241,0.5)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 4px 20px rgba(99,102,241,0.35)'}}>
                  Dashboard
                </button>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{ position: 'relative', padding: '120px 24px 100px', textAlign: 'center', overflow: 'hidden' }}>
        <GridBg />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto' }}>
          <div className="fade-up" style={{ marginBottom: 28 }}>
            
          </div>

          <h1 className="fade-up-d1" style={{
            fontSize: 'clamp(42px, 7vw, 80px)', fontWeight: 800,
            letterSpacing: '-2px', lineHeight: 1.1, marginBottom: 16,
            color: '#f1f5f9',
          }}>
            Your Personal<br />
            <span className="gradient-text">AI Research</span> Assistant
          </h1>

          <div className="fade-up-d2" style={{
            fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 600,
            color: '#475569', marginBottom: 20, minHeight: 44,
            display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
          }}>
            <span>Chat with your</span>
            <span style={{ color: '#818cf8' }}>{typedText}</span>
            <span className="cursor" />
          </div>

          <p className="fade-up-d3" style={{
            fontSize: 18, color: '#64748b', lineHeight: 1.8,
            maxWidth: 580, margin: '0 auto 40px',
          }}>
            Upload documents, generate instant summaries, and chat directly with your sources. Turn scattered notes into organized knowledge.
          </p>

          <div className="fade-up-d4" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/notes">
              <button style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '15px 32px', borderRadius: '14px', fontWeight: 700, fontSize: 16,
                background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff',
                border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(99,102,241,0.4)',
                transition: 'all 0.25s',
              }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 14px 40px rgba(99,102,241,0.55)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='0 8px 32px rgba(99,102,241,0.4)'}}>
                Go to Dashboard
                <ChevronRight size={18} />
              </button>
            </Link>
            {!userData && (
              <Link to="/auth/login">
                <button style={{
                  padding: '15px 32px', borderRadius: '14px', fontWeight: 600, fontSize: 16,
                  background: 'rgba(255,255,255,0.05)', color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.borderColor='rgba(255,255,255,0.2)'}}
                onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}}>
                  Sign In to Account
                </button>
              </Link>
            )}
          </div>

          {/* Stats Bar */}
          <div style={{
            display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap',
            marginTop: 72, paddingTop: 48,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <StatItem value="50K+" label="ACTIVE USERS" />
            <StatItem value="2M+" label="DOCUMENTS PROCESSED" />
            <StatItem value="99.9%" label="UPTIME SLA" />
            <StatItem value="< 1s" label="RESPONSE TIME" />
          </div>
        </div>

        {/* Hero glow */}
        <div style={{
          position: 'absolute', bottom: -60, left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 200,
          background: 'radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '100px 24px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
            Everything you need
          </p>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 14 }}>
            Built for deep research
          </h2>
          <p style={{ color: '#64748b', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
            Every feature is designed to make working with documents faster, smarter, and more intuitive.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <FeatureCard icon={Brain} title="AI-Powered Chat" desc="Ask questions about your documents and get instant, context-aware answers backed by your own sources." delay={0} />
          <FeatureCard icon={FileText} title="Auto Summarization" desc="Generate concise summaries of long documents in seconds. Key insights surfaced automatically." delay={100} />
          <FeatureCard icon={Zap} title="Lightning Fast" desc="Sub-second query responses powered by vector search and optimized embedding pipelines." delay={200} />
          <FeatureCard icon={Shield} title="Private & Secure" desc="Your documents never leave your account. End-to-end encryption keeps your research confidential." delay={300} />
          <FeatureCard icon={MessageSquare} title="Multi-Source Chat" desc="Chat across multiple documents simultaneously. Cross-reference sources with ease." delay={400} />
          <FeatureCard icon={Star} title="Smart Notebooks" desc="Organize documents into notebooks with auto-tagging, search, and intelligent grouping." delay={500} />
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" style={{ padding: '100px 24px' }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: 32, padding: '80px 40px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Section glow */}
          <div style={{
            position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
            width: 800, height: 300,
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ textAlign: 'center', marginBottom: 60, position: 'relative', zIndex: 1 }}>
            <p style={{ color: '#6366f1', fontWeight: 600, fontSize: 13, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>
              Pricing
            </p>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, color: '#f1f5f9', letterSpacing: '-1px', marginBottom: 14 }}>
              Simple, transparent pricing
            </h2>
            <p style={{ color: '#64748b', fontSize: 16 }}>Start for free, upgrade when you need more power.</p>
          </div>

          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24, alignItems: 'center', position: 'relative', zIndex: 1,
          }}>
            <PricingCard
              tier="Basic"
              price="$0"
              sub="/month"
              cta="Get Started Free"
              features={['Up to 3 notebooks', '10MB max file size', 'Basic AI chat', 'Standard support']}
            />
            <PricingCard
              tier="Pro"
              price="$12"
              sub="/month"
              cta="Upgrade to Pro"
              highlight
              badge="Most Popular"
              features={['Unlimited notebooks', '100MB max file size', 'Advanced AI (GPT-4)', 'Priority support', 'Image generation']}
            />
            <PricingCard
              tier="Enterprise"
              price="$49"
              sub="/user/month"
              cta="Contact Sales"
              features={['Everything in Pro', 'Shared team workspaces', 'Admin dashboard', 'Custom integrations', '24/7 dedicated support']}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '40px 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={14} color="#fff" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#475569' }}>NotebookLM</span>
        </div>
        <p style={{ color: '#334155', fontSize: 13 }}>
          © {new Date().getFullYear()} NotebookLM Clone. Built for productivity.
        </p>
      </footer>
    </div>
  );
};

export default HomePage;