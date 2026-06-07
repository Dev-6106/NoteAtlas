import { FileText, MessageSquare, PanelRight } from "lucide-react";

interface MobileNavProps {
  activeTab: "left" | "middle" | "right";
  setActiveTab: (tab: "left" | "middle" | "right") => void;
}

export const MobileNav = ({ activeTab, setActiveTab }: MobileNavProps) => {
  return (
    <div style={{
      position: "fixed",
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      background: "var(--bg-surface)",
      borderTop: "1px solid var(--border-default)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-around",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom)"
    }}>
      <NavButton 
        icon={<FileText size={20} />} 
        label="Sources" 
        active={activeTab === "left"} 
        onClick={() => setActiveTab("left")} 
      />
      <NavButton 
        icon={<MessageSquare size={20} />} 
        label="Chat" 
        active={activeTab === "middle"} 
        onClick={() => setActiveTab("middle")} 
      />
      <NavButton 
        icon={<PanelRight size={20} />} 
        label="Studio" 
        active={activeTab === "right"} 
        onClick={() => setActiveTab("right")} 
      />
    </div>
  );
};

const NavButton = ({ icon, label, active, onClick }: any) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: "transparent",
        border: "none",
        color: active ? "var(--primary-brand)" : "var(--text-3)",
        width: 80,
        height: "100%",
        cursor: "pointer",
        transition: "color 0.2s"
      }}
    >
      {icon}
      <span style={{ fontSize: 10, fontWeight: 600 }}>{label}</span>
    </button>
  );
};
