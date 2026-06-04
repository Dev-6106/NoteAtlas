import type { AppDispatch, RootState } from "@/store";
import {
  addExtraWidth,
  reduceExtraWidth,
  toggleLeftPanel,
} from "@/store/chatSlice";
import { useDispatch, useSelector } from "react-redux";
import {
  FileText,
  NotepadText,
  PanelLeft,
  Plus,
  Search,
  Youtube,
} from "lucide-react";
import { toggleAddSourceNoteModal } from "@/store/addSourceSlice";
import type { NoteType } from "@/types/note-types";
import { Checkbox } from "../ui/checkbox";
import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";
import { useState } from "react";
import { addDocIds } from "@/store/rightPanelSlice";
import PdfIcon from "@/assets/pdf.png";

type LeftPanelProps = {
  note: NoteType;
  loading: boolean;
};

const LeftPanel = ({ note, loading }: LeftPanelProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leftPanelOpen } = useSelector((state: RootState) => state.chat);
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  function togglePanel() {
    if (leftPanelOpen) {
      dispatch(addExtraWidth());
      dispatch(toggleLeftPanel());
    } else {
      dispatch(reduceExtraWidth());
      dispatch(toggleLeftPanel());
    }
  }

  function handleDocSelect(docId: string) {
    setSelectedDocs((prev: string[]) =>
      prev.includes(docId)
        ? prev.filter((id) => id !== docId)
        : [...prev, docId]
    );
    dispatch(addDocIds(docId));
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        width: leftPanelOpen ? "100%" : 56,
        transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: leftPanelOpen ? "space-between" : "center",
          padding: leftPanelOpen ? "16px 18px 12px" : "16px 8px 12px",
          flexShrink: 0,
        }}
      >
        {leftPanelOpen && (
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "var(--text-2)",
            }}
          >
            Sources
          </span>
        )}
        <button
          onClick={togglePanel}
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--primary-glow)";
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.color = "var(--primary-brand)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          <PanelLeft size={16} />
        </button>
      </div>

      {/* ── Divider ── */}
      <div
        style={{
          height: 1,
          background: "var(--border-default)",
          margin: "0 16px",
          flexShrink: 0,
        }}
      />

      {/* ── Action Buttons ── */}
      <div
        style={{
          padding: leftPanelOpen ? "14px 16px 8px" : "14px 6px 8px",
          flexShrink: 0,
        }}
      >
        {leftPanelOpen ? (
          <div style={{ display: "flex", gap: 8 }}>
            <ActionButton
              icon={<Plus size={15} />}
              label="Add source"
              onClick={() => dispatch(toggleAddSourceNoteModal())}
            />
            <ActionButton
              icon={<Search size={15} />}
              label="Discover"
              onClick={() => dispatch(toggleDiscoveryModal())}
            />
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
            }}
          >
            <IconButton
              icon={<Plus size={16} />}
              onClick={() => dispatch(toggleAddSourceNoteModal())}
              title="Add source"
            />
            <IconButton
              icon={<Search size={16} />}
              onClick={() => dispatch(toggleDiscoveryModal())}
              title="Discover"
            />
          </div>
        )}
      </div>

      {/* ── Sources list ── */}
      <div
        className="studio-scroll"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: leftPanelOpen ? "0 16px 16px" : "0 6px 8px",
        }}
      >
        {leftPanelOpen ? (
          loading ? (
            <DocRowSkeleton count={10} />
          ) : note?.docs?.length ? (
            <div>
              {/* Select all */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  marginBottom: 4,
                  borderRadius: 8,
                }}
              >
                <Checkbox checked={false} />
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Select all sources
                </span>
              </div>

              {/* Documents */}
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {note.docs.map((doc) => (
                  <div
                    key={doc._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "8px 10px",
                      borderRadius: 10,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      border: selectedDocs.includes(doc._id)
                        ? "1px solid var(--border-accent)"
                        : "1px solid transparent",
                      background: selectedDocs.includes(doc._id)
                        ? "var(--primary-glow)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!selectedDocs.includes(doc._id)) {
                        e.currentTarget.style.background =
                          "var(--bg-card-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!selectedDocs.includes(doc._id)) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                    onClick={() => handleDocSelect(doc._id)}
                  >
                    <SourceIcon type={doc?.source_type} />
                    <span
                      style={{
                        flex: 1,
                        fontSize: 13,
                        fontWeight: 450,
                        color: "var(--text-1)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {doc?.title}
                    </span>
                    <Checkbox
                      className="cursor-pointer"
                      checked={selectedDocs.includes(doc._id)}
                      onCheckedChange={() => handleDocSelect(doc._id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                textAlign: "center",
                padding: "40px 20px",
              }}
            >
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 16,
                  background: "var(--primary-glow)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <NotepadText
                  size={28}
                  style={{ color: "var(--primary-brand)" }}
                />
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-3)",
                  lineHeight: 1.6,
                  maxWidth: 220,
                }}
              >
                Add PDFs, websites, text, or audio files using the{" "}
                <strong>Add source</strong> button above.
              </p>
            </div>
          )
        ) : (
          /* Collapsed: show doc icons */
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
            }}
          >
            {note?.docs?.map((doc) => (
              <button
                key={doc._id}
                title={doc.title}
                onClick={() => handleDocSelect(doc._id)}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  border: selectedDocs.includes(doc._id)
                    ? "1px solid var(--border-accent)"
                    : "1px solid var(--border-default)",
                  background: selectedDocs.includes(doc._id)
                    ? "var(--primary-glow)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--primary-glow)";
                  e.currentTarget.style.borderColor = "var(--border-accent)";
                }}
                onMouseLeave={(e) => {
                  if (!selectedDocs.includes(doc._id)) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.borderColor =
                      "var(--border-default)";
                  }
                }}
              >
                <SourceIcon type={doc?.source_type} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════ */

const ActionButton = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      padding: "9px 14px",
      borderRadius: 10,
      border: "1px solid var(--border-default)",
      background: "transparent",
      color: "var(--text-2)",
      fontSize: 13,
      fontWeight: 500,
      cursor: "pointer",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--border-accent)";
      e.currentTarget.style.background = "var(--primary-glow)";
      e.currentTarget.style.color = "var(--primary-brand)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--border-default)";
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "var(--text-2)";
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const IconButton = ({
  icon,
  onClick,
  title,
}: {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
}) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      width: 36,
      height: 36,
      borderRadius: 8,
      border: "1px solid var(--border-default)",
      background: "transparent",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      color: "var(--text-3)",
      transition: "all 0.2s",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "var(--primary-glow)";
      e.currentTarget.style.borderColor = "var(--border-accent)";
      e.currentTarget.style.color = "var(--primary-brand)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.borderColor = "var(--border-default)";
      e.currentTarget.style.color = "var(--text-3)";
    }}
  >
    {icon}
  </button>
);

/* ── Skeleton loader ── */
const DocRowSkeleton = ({ count = 5 }: { count?: number }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
    {Array.from({ length: count }).map((_, idx) => (
      <div
        key={idx}
        className="shimmer-loading"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          borderRadius: 10,
        }}
      >
        <div
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            background: "rgba(109,95,246,0.12)",
          }}
        />
        <div
          style={{
            flex: 1,
            height: 14,
            borderRadius: 4,
            background: "rgba(109,95,246,0.12)",
          }}
        />
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: "rgba(109,95,246,0.12)",
          }}
        />
      </div>
    ))}
  </div>
);

/* ── Source Icon ── */
function SourceIcon({ type = "" }: { type?: string }) {
  const normalized = type.toLowerCase();

  if (normalized.includes("youtube")) {
    return <Youtube size={16} style={{ color: "#ef4444" }} />;
  }

  if (normalized.includes("pdf")) {
    return (
      <img
        src={PdfIcon}
        alt="PDF"
        width={18}
        height={18}
        style={{ borderRadius: 2, flexShrink: 0 }}
      />
    );
  }

  return <FileText size={16} style={{ color: "#818cf8" }} />;
}

export default LeftPanel;