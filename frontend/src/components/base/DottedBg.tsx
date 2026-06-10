import React from "react";

export const DottedBg = () => (
  <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
    {/* Clean Dotted Pattern */}
    <div style={{
      position: "absolute", inset: 0,
      backgroundImage: `radial-gradient(var(--border-strong) 1px, transparent 1px)`,
      backgroundSize: "28px 28px",
      opacity: 0.45,
      maskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 15%, transparent 85%)",
      WebkitMaskImage: "radial-gradient(ellipse 90% 90% at 50% 50%, black 15%, transparent 85%)",
    }} />
    
    {/* Subtle Pastel Glows */}
    <div style={{
      position: "absolute", top: "-10%", left: "-5%", width: 600, height: 600, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
      filter: "blur(60px)", animation: "floatUpDown 15s ease-in-out infinite alternate"
    }} />
    <div style={{
      position: "absolute", bottom: "-10%", right: "-5%", width: 700, height: 700, borderRadius: "50%",
      background: "radial-gradient(circle, rgba(139, 92, 246, 0.08) 0%, transparent 70%)",
      filter: "blur(60px)", animation: "floatUpDown 18s ease-in-out infinite alternate-reverse", animationDelay: "-5s"
    }} />
    <style>{`
      @keyframes floatUpDown {
        0%, 100% { transform: translateY(0) rotate(var(--rot, 0deg)); }
        50% { transform: translateY(-16px) rotate(var(--rot, 0deg)); }
      }
    `}</style>
  </div>
);
