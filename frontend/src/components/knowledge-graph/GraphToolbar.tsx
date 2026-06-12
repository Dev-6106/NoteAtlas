/**
 * GraphToolbar.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Floating toolbar for the knowledge graph — search, filter by entity type,
 * and trigger graph generation.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Zap,
  RefreshCw,
  User,
  Building2,
  Lightbulb,
  Calendar,
  Package,
  MapPin,
  Clock,
  Circle,
  X,
  FileText,
} from "lucide-react";

const ENTITY_TYPES = [
  { key: "person", label: "People", icon: User, color: "#60a5fa" },
  { key: "org", label: "Organizations", icon: Building2, color: "#34d399" },
  { key: "concept", label: "Concepts", icon: Lightbulb, color: "#a78bfa" },
  { key: "event", label: "Events", icon: Calendar, color: "#fbbf24" },
  { key: "product", label: "Products", icon: Package, color: "#f472b6" },
  { key: "location", label: "Locations", icon: MapPin, color: "#fb923c" },
  { key: "date", label: "Dates", icon: Clock, color: "#94a3b8" },
  { key: "other", label: "Other", icon: Circle, color: "#e2e8f0" },
] as const;

interface GraphToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
  activeDocFilters?: string[];
  onDocFilterChange?: (filters: string[]) => void;
  sourceDocs?: { id: string; title: string }[];
  onGenerate: (force: boolean) => void;
  generating: boolean;
  nodeCount: number;
  linkCount: number;
}

export default function GraphToolbar({
  searchQuery,
  onSearchChange,
  activeFilters,
  onFilterChange,
  activeDocFilters = [],
  onDocFilterChange,
  sourceDocs = [],
  onGenerate,
  generating,
  nodeCount,
  linkCount,
}: GraphToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  const toggleFilter = (type: string) => {
    if (activeFilters.includes(type)) {
      onFilterChange(activeFilters.filter((f) => f !== type));
    } else {
      onFilterChange([...activeFilters, type]);
    }
  };

  const toggleDocFilter = (docId: string) => {
    if (!onDocFilterChange) return;
    if (activeDocFilters.includes(docId)) {
      onDocFilterChange(activeDocFilters.filter((f) => f !== docId));
    } else {
      onDocFilterChange([...activeDocFilters, docId]);
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 15,
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* ── Main toolbar row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 6,
          padding: "6px 8px",
          borderRadius: 16,
          background: "var(--bg-elevated)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "5px 10px",
            borderRadius: 12,
            background: "var(--bg-card)",
            border: "1px solid var(--border-default)",
            minWidth: 120,
            flex: 1,
          }}
        >
          <Search size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search entities..."
            style={{
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--text-1)",
              fontSize: 12,
              fontFamily: "var(--font-sans)",
              width: "100%",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-3)",
                display: "flex",
                padding: 2,
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 20, background: "var(--border-strong)" }} />

        {/* Filter toggle */}
        <ToolbarButton
          icon={<Filter size={14} />}
          label="Filter"
          onClick={() => setShowFilters(!showFilters)}
          active={showFilters || activeFilters.length > 0}
          badge={activeFilters.length > 0 ? activeFilters.length : undefined}
        />

        {/* Generate */}
        <ToolbarButton
          icon={generating ? <RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> : <Zap size={14} />}
          label={generating ? "Building..." : "Build Graph"}
          onClick={() => onGenerate(false)}
          disabled={generating}
          accent
        />

        {/* Stats */}
        <div style={{
          padding: "4px 10px",
          borderRadius: 10,
          background: "var(--bg-card)",
          fontSize: 11,
          color: "var(--text-2)",
          whiteSpace: "nowrap",
        }}>
          {nodeCount} nodes · {linkCount} links
        </div>
      </div>

      {/* ── Filter dropdown ── */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 14,
              background: "var(--bg-elevated)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid var(--border-default)",
              boxShadow: "var(--shadow-md)",
              maxWidth: 400,
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Entity Types</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {ENTITY_TYPES.map(({ key, label, icon: Icon, color }) => {
                  const isActive = activeFilters.includes(key);
                  return (
                    <button
                      key={key}
                      onClick={() => toggleFilter(key)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 8,
                        background: isActive ? `${color}20` : "var(--bg-card)",
                        border: `1px solid ${isActive ? color : "var(--border-default)"}`,
                        color: isActive ? color : "var(--text-2)",
                        fontSize: 11,
                        fontWeight: isActive ? 600 : 500,
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <Icon size={12} />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {sourceDocs && sourceDocs.length > 0 && (
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-3)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>Source Documents</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {sourceDocs.map((doc) => {
                    const isActive = activeDocFilters.includes(doc.id);
                    return (
                      <button
                        key={doc.id}
                        onClick={() => toggleDocFilter(doc.id)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "4px 8px",
                          borderRadius: 8,
                          background: isActive ? "var(--primary-glow)" : "var(--bg-card)",
                          border: `1px solid ${isActive ? "var(--primary-brand)" : "var(--border-default)"}`,
                          color: isActive ? "var(--primary-brand)" : "var(--text-2)",
                          fontSize: 11,
                          fontWeight: isActive ? 600 : 500,
                          cursor: "pointer",
                          transition: "all 0.2s",
                          maxWidth: 200,
                        }}
                      >
                        <FileText size={12} style={{ flexShrink: 0 }} />
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(activeFilters.length > 0 || activeDocFilters.length > 0) && (
              <button
                onClick={() => {
                  onFilterChange([]);
                  if (onDocFilterChange) onDocFilterChange([]);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "5px 10px",
                  borderRadius: 10,
                  background: "rgba(239, 68, 68, 0.1)",
                  border: "1px solid rgba(239, 68, 68, 0.2)",
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: 500,
                  color: "#ef4444",
                  fontFamily: "var(--font-sans)",
                }}
              >
                <X size={11} />
                Clear
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Reusable toolbar button ──

function ToolbarButton({
  icon,
  label,
  onClick,
  active,
  accent,
  disabled,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  accent?: boolean;
  disabled?: boolean;
  badge?: number;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 5,
        padding: "5px 12px",
        borderRadius: 10,
        background: accent
          ? "var(--primary-surface)"
          : active
            ? "var(--bg-card-hover)"
            : "var(--bg-card)",
        border: `1px solid ${accent ? "var(--border-accent)" : active ? "var(--border-strong)" : "var(--border-default)"}`,
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 12,
        fontWeight: 500,
        color: accent ? "var(--primary-brand)" : active ? "var(--text-1)" : "var(--text-2)",
        fontFamily: "var(--font-sans)",
        transition: "all 0.15s ease",
        opacity: disabled ? 0.5 : 1,
        position: "relative",
        whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span style={{
          position: "absolute",
          top: -4,
          right: -4,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "var(--primary-brand)",
          color: "var(--text-on-primary)",
          fontSize: 9,
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          {badge}
        </span>
      )}
    </button>
  );
}
