import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Folder, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { T } from "@/components/ThemeTokens";

interface FolderCardProps {
  id: string;
  name: string;
  onClick: () => void;
  onRename: (id: string, currentName: string) => void;
  onDelete: (id: string) => void;
}

export default function FolderCard({ id, name, onClick, onRename, onDelete }: FolderCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: {
      type: 'Folder',
    }
  });

  return (
    <div
      ref={setNodeRef}
      onClick={onClick}
      className="fade-up"
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: 190,
        borderRadius: 20,
        padding: "24px 20px",
        cursor: "pointer",
        background: isOver ? "var(--primary-glow)" : "var(--bg-card)",
        border: isOver ? `1.5px solid var(--primary-brand)` : `1px solid var(--border-default)`,
        boxShadow: isOver ? "0 12px 32px rgba(59, 130, 246, 0.15)" : "0 4px 12px rgba(0,0,0,0.03)",
        transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
      }}
      onMouseEnter={e => {
        if (!isOver) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)";
          e.currentTarget.style.borderColor = "var(--border-strong)";
        }
      }}
      onMouseLeave={e => {
        if (!isOver) {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.03)";
          e.currentTarget.style.borderColor = "var(--border-default)";
        }
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: "rgba(59, 130, 246, 0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Folder size={24} style={{ color: "#3b82f6" }} fill="currentColor" fillOpacity={0.2} />
        </div>
        
        <div style={{ position: "relative" }} onPointerDown={(e) => e.stopPropagation()}>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsMenuOpen(!isMenuOpen); }}
            style={{
              background: isMenuOpen ? "var(--bg-elevated)" : "transparent",
              border: "none",
              borderRadius: 8,
              padding: 4,
              cursor: "pointer",
              color: "var(--text-3)",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
            onMouseLeave={e => e.currentTarget.style.color = isMenuOpen ? "var(--text-1)" : "var(--text-3)"}
          >
            <MoreVertical size={18} />
          </button>

          {isMenuOpen && (
            <>
              <div 
                onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }}
                style={{ position: "fixed", inset: 0, zIndex: 10 }}
              />
              <div style={{
                position: "absolute", top: 32, right: 0,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-default)",
                borderRadius: 12,
                boxShadow: "var(--shadow-lg)",
                padding: 6,
                minWidth: 160,
                zIndex: 20,
                display: "flex", flexDirection: "column", gap: 2,
                animation: "fadeUp 0.15s ease-out"
              }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onRename(id, name); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent",
                    color: "var(--text-2)", fontSize: 13, fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s ease", textAlign: "left", width: "100%"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-1)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-2)"; }}
                >
                  <Edit2 size={14}/> <span>Rename</span>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); onDelete(id); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "8px 12px", borderRadius: 8, border: "none", background: "transparent",
                    color: "var(--color-error)", fontSize: 13, fontWeight: 500, cursor: "pointer",
                    transition: "all 0.15s ease", textAlign: "left", width: "100%"
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = "var(--color-error-light)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Trash2 size={14}/> <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        <h3 style={{
          fontSize: 16, fontWeight: 600, color: "var(--text-1)",
          marginBottom: 4, fontFamily: "var(--font-sans)",
        }}>
          {name}
        </h3>
        <p style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-sans)" }}>
          Folder
        </p>
      </div>
    </div>
  );
}
