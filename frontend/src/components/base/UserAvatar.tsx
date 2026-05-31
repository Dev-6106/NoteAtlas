import { logoutUser } from "@/api/auth";
import { getUserData } from "@/helper/getUserData";
import { useEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";

const UserAvatar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const userData = getUserData();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ position: "relative", fontFamily: "'DM Sans', system-ui, sans-serif" }} ref={menuRef}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes avatarDropIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {/* ── Avatar Trigger ── */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          width: 34, height: 34, borderRadius: "50%", padding: 0,
          border: menuOpen ? "2px solid #6366f1" : "2px solid rgba(99,102,241,0.3)",
          cursor: "pointer", background: "none",
          boxShadow: menuOpen ? "0 0 14px rgba(99,102,241,0.45)" : "none",
          transition: "all 0.2s",
          overflow: "hidden", flexShrink: 0,
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1";
          (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 0 14px rgba(99,102,241,0.4)";
        }}
        onMouseLeave={e => {
          if (!menuOpen) {
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.3)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }
        }}
      >
        <img
          src={userData?.image}
          alt="User"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      </button>

      {/* ── Dropdown ── */}
      {menuOpen && (
        <div style={{
          position: "absolute", right: 0, top: "calc(100% + 10px)",
          width: 240, zIndex: 200,
          background: "rgba(10,13,26,0.97)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: 16,
          boxShadow: "0 0 0 1px rgba(99,102,241,0.08), 0 20px 48px rgba(0,0,0,0.65), 0 0 40px rgba(99,102,241,0.08)",
          backdropFilter: "blur(20px)",
          overflow: "hidden",
          animation: "avatarDropIn 0.18s ease forwards",
        }}>

          {/* Top accent */}
          <div style={{
            height: 2,
            background: "linear-gradient(90deg, transparent, #6366f1 40%, #8b5cf6 60%, transparent)",
          }} />

          {/* User Info */}
          <div style={{
            display: "flex", alignItems: "center", gap: 12,
            padding: "16px 18px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <img
              src={userData?.image}
              alt="User"
              style={{
                width: 40, height: 40, borderRadius: "50%", objectFit: "cover", flexShrink: 0,
                border: "2px solid rgba(99,102,241,0.4)",
                boxShadow: "0 0 12px rgba(99,102,241,0.25)",
              }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: 14, fontWeight: 700, color: "#f1f5f9",
                letterSpacing: "-0.2px", whiteSpace: "nowrap",
                overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {userData?.name}
              </p>
              <p style={{
                fontSize: 12, color: "#475569", marginTop: 2,
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
              }}>
                {userData?.email}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: "8px" }}>
            <button
              onClick={() => logoutUser()}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 9,
                padding: "10px 12px", borderRadius: 10,
                background: "transparent", border: "none",
                color: "#94a3b8", fontSize: 13, fontWeight: 600,
                cursor: "pointer", textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#fca5a5";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
              }}
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;