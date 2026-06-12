/**
 * EntityDetailPanel.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Glassmorphism slide-out panel showing entity details, relationships,
 * and linked source documents.
 */

import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, FileText, ArrowRight, Tag, Clock, Hash, User, Building, Lightbulb, Calendar, Box, MapPin, Circle } from "lucide-react";
import type { EntityDetail } from "@/api/knowledgeGraph";
import { T } from "@/components/ThemeTokens";

const TYPE_LABELS: Record<string, string> = {
  person: "Person",
  org: "Organization",
  concept: "Concept",
  event: "Event",
  product: "Product",
  location: "Location",
  date: "Date",
  other: "Other",
};

function TypeIcon({ type, size = 13 }: { type: string, size?: number }) {
  switch (type) {
    case 'person': return <User size={size} />;
    case 'org': return <Building size={size} />;
    case 'concept': return <Lightbulb size={size} />;
    case 'event': return <Calendar size={size} />;
    case 'product': return <Box size={size} />;
    case 'location': return <MapPin size={size} />;
    case 'date': return <Clock size={size} />;
    default: return <Circle size={size} />;
  }
}

const TYPE_COLORS: Record<string, string> = {
  person: "#60a5fa",
  org: "#34d399",
  concept: "#a78bfa",
  event: "#fbbf24",
  product: "#f472b6",
  location: "#fb923c",
  date: "#94a3b8",
  other: "#e2e8f0",
};

interface EntityDetailPanelProps {
  detail: EntityDetail | null;
  loading: boolean;
  onClose: () => void;
  onEntityClick: (entityId: string) => void;
  onEvidenceClick: (sourceDoc: { id: string; title: string; content: string }) => void;
}

export default function EntityDetailPanel({
  detail,
  loading,
  onClose,
  onEntityClick,
  onEvidenceClick,
}: EntityDetailPanelProps) {
  const entity = detail?.entity;
  const color = TYPE_COLORS[entity?.type || "other"];

  return (
    <AnimatePresence>
      {(detail || loading) && (
        <motion.div
          initial={{ x: 340, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 340, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 300 }}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            bottom: 12,
            width: "min(340px, calc(100vw - 24px))",
            zIndex: 20,
            background: "var(--bg-elevated)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid var(--border-default)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "var(--shadow-card)",
          }}
        >
          {loading && !entity ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "3px solid var(--border-default)",
                borderTopColor: "var(--primary-brand)",
                animation: "spin 0.8s linear infinite",
              }} />
            </div>
          ) : entity ? (
            <>
              {/* ── Header ── */}
              <div style={{
                padding: "20px 20px 16px",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 10px",
                      borderRadius: 20,
                      background: `${color}18`,
                      border: `1px solid ${color}30`,
                      fontSize: 11,
                      fontWeight: 600,
                      color: color,
                      marginBottom: 10,
                    }}>
                      <TypeIcon type={entity.type} />
                      {TYPE_LABELS[entity.type] || "Other"}
                    </div>
                    <h3 style={{
                      margin: 0,
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-1)",
                      fontFamily: "var(--font-sans)",
                      lineHeight: 1.3,
                    }}>
                      {entity.name}
                    </h3>
                  </div>
                  <button
                    onClick={onClose}
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-default)",
                      borderRadius: 10,
                      padding: 6,
                      cursor: "pointer",
                      color: "var(--text-3)",
                      display: "flex",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--bg-card-hover)"; e.currentTarget.style.color = "var(--text-1)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-card)"; e.currentTarget.style.color = "var(--text-3)"; }}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* ── Content (scrollable) ── */}
              <div style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}>
                {/* Description */}
                {entity.description && (
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.7,
                      color: "var(--text-2)",
                      wordBreak: "break-word",
                    }}>
                      {entity.description}
                    </p>
                  </div>
                )}

                {/* Meta row */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                  <MetaBadge icon={<Hash size={12} />} label={`${entity.mentionCount} mention${entity.mentionCount !== 1 ? "s" : ""}`} />
                  {entity.firstSeen && (
                    <MetaBadge icon={<Clock size={12} />} label={new Date(entity.firstSeen).toLocaleDateString()} />
                  )}
                </div>

                {/* Aliases */}
                {entity.aliases?.length > 0 && (
                  <Section title="Also known as">
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {entity.aliases.map((alias, i) => (
                        <span key={i} style={{
                          padding: "3px 10px",
                          borderRadius: 12,
                          background: "var(--bg-card)",
                          border: "1px solid var(--border-default)",
                          fontSize: 12,
                          color: "var(--text-2)",
                        }}>
                          {alias}
                        </span>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Relationships */}
                {detail.relationships?.length > 0 && (
                  <Section title={`Connections (${detail.relationships.length})`}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {detail.relationships.map((rel) => {
                        const isSource = rel.source.id === entity.id;
                        const other = isSource ? rel.target : rel.source;
                        return (
                          <button
                            key={rel.id}
                            onClick={() => onEntityClick(other.id)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                              padding: "8px 12px",
                              borderRadius: 12,
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-default)",
                              cursor: "pointer",
                              transition: "all 0.2s",
                              textAlign: "left",
                              width: "100%",
                              color: "var(--text-2)",
                              fontSize: 12,
                              minWidth: 0,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "var(--bg-card-hover)";
                              e.currentTarget.style.borderColor = "var(--border-strong)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "var(--bg-card)";
                              e.currentTarget.style.borderColor = "var(--border-default)";
                            }}
                          >
                            <Link2 size={13} style={{ flexShrink: 0, color: "var(--primary-brand)" }} />
                            <span style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
                              <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{other.name}</span>
                              <span style={{ color: "var(--text-3)", margin: "0 6px" }}>·</span>
                              <span style={{ color: "var(--text-3)", fontStyle: "italic" }}>
                                {rel.label || rel.type.replace(/_/g, " ")}
                              </span>
                            </span>
                            <ArrowRight size={12} style={{ flexShrink: 0, opacity: 0.3 }} />
                          </button>
                        );
                      })}
                    </div>
                  </Section>
                )}

                {/* Source documents */}
                {detail.sourceDocs?.length > 0 && (
                  <Section title="Found in">
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {detail.sourceDocs.map((doc) => (
                        <div
                          key={doc.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "6px 10px",
                            borderRadius: 10,
                            background: "var(--bg-card)",
                            border: "1px solid var(--border-default)",
                            fontSize: 12,
                            color: "var(--text-2)",
                            minWidth: 0,
                          }}
                        >
                          <FileText size={13} style={{ flexShrink: 0, color: "var(--primary-brand)" }} />
                          <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {doc.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </Section>
                )}

                {/* Evidence snippets */}
                {detail.relationships?.some((r) => r.evidence) && (
                  <Section title="Evidence">
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {detail.relationships
                        .filter((r) => r.evidence)
                        .slice(0, 5)
                        .map((rel, i) => (
                          <div
                            key={i}
                            onClick={() => {
                              if (rel.sourceDoc) onEvidenceClick(rel.sourceDoc);
                            }}
                            style={{
                              padding: "10px 12px",
                              borderRadius: 12,
                              background: "var(--bg-card)",
                              border: "1px solid var(--border-default)",
                              borderLeft: "2px solid var(--primary-brand)",
                              fontSize: 12,
                              lineHeight: 1.6,
                              color: "var(--text-2)",
                              fontStyle: "italic",
                              cursor: rel.sourceDoc ? "pointer" : "default",
                              transition: "all 0.2s",
                              wordBreak: "break-word",
                            }}
                            onMouseEnter={(e) => {
                              if (rel.sourceDoc) {
                                e.currentTarget.style.background = "var(--bg-card-hover)";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (rel.sourceDoc) {
                                e.currentTarget.style.background = "var(--bg-card)";
                              }
                            }}
                          >
                            "{rel.evidence}"
                            {rel.sourceDoc && (
                              <div style={{ display: 'block', marginTop: 8, fontSize: 11, color: "var(--primary-brand)", fontStyle: "normal", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <FileText size={12} /> View in {rel.sourceDoc.title}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </Section>
                )}
              </div>
            </>
          ) : null}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Reusable sub-components ──

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 style={{
        margin: "0 0 8px 0",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--text-3)",
      }}>
        {title}
      </h4>
      {children}
    </div>
  );
}

function MetaBadge({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 5,
      padding: "4px 10px",
      borderRadius: 10,
      background: "var(--bg-card)",
      border: "1px solid var(--border-default)",
      fontSize: 11,
      color: "var(--text-2)",
    }}>
      {icon}
      {label}
    </div>
  );
}
