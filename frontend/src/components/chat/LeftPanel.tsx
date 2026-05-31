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
} from "lucide-react";
import { toggleAddSourceNoteModal } from "@/store/addSourceSlice";
import type { NoteType } from "@/types/note-types";
import { Checkbox } from "../ui/checkbox";
import { toggleDiscoveryModal } from "@/store/discoveryModalSlice";
import { useState } from "react";
import { addDocIds } from "@/store/rightPanelSlice";
import PdfIcon from '@/assets/pdf.png';

type LeftPanelProps = {
  note: NoteType;
  loading: boolean;
};

const LeftPanel = ({ note, loading }: LeftPanelProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leftPanelOpen } = useSelector((state: RootState) => state.chat);

  function togglePanel() {
    if (leftPanelOpen) {
      dispatch(addExtraWidth());
      dispatch(toggleLeftPanel());
    } else {
      dispatch(reduceExtraWidth());
      dispatch(toggleLeftPanel());
    }
  }

  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

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
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: leftPanelOpen ? 16 : 8,
        width: leftPanelOpen ? "25%" : 64,
        transition: "all 0.3s ease",
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
        flexShrink: 0,
      }}>
        {leftPanelOpen && (
          <p style={{ fontSize: 14, fontWeight: 600, color: "#f1f5f9", letterSpacing: "-0.2px" }}>
            Sources
          </p>
        )}
        <button
          onClick={() => togglePanel()}
          style={{
            width: 32, height: 32, borderRadius: 8,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#64748b", cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
            (e.currentTarget as HTMLButtonElement).style.color = "#a5b4fc";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
            (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
          }}
        >
          <PanelLeft size={16} />
        </button>
      </div>

      {leftPanelOpen && (
        <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 8 }} />
      )}

      {/* Buttons */}
      <div style={{ flexShrink: 0 }}>
        {leftPanelOpen ? (
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <button
              onClick={() => dispatch(toggleAddSourceNoteModal())}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 16px", borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
              }}
            >
              <Plus size={15} /> Add
            </button>
            <button
              onClick={() => dispatch(toggleDiscoveryModal())}
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                padding: "9px 16px", borderRadius: 999,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#94a3b8", fontSize: 13, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
                (e.currentTarget as HTMLButtonElement).style.color = "#c7d2fe";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                (e.currentTarget as HTMLButtonElement).style.color = "#94a3b8";
              }}
            >
              <Search size={15} /> Discover
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, gap: 16 }}>
            <button
              onClick={() => dispatch(toggleAddSourceNoteModal())}
              style={{
                width: 36, height: 36, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#818cf8", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <Plus size={16} />
            </button>
            <button
              onClick={() => dispatch(toggleDiscoveryModal())}
              style={{
                width: 36, height: 36, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#818cf8", cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.15)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(99,102,241,0.35)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.05)";
                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              }}
            >
              <Search size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="left-panel-scroll" style={{ flex: 1, overflowY: "auto", marginTop: 16, paddingRight: 4 }}>
        <style>{`
          .left-panel-scroll::-webkit-scrollbar { width: 5px; }
          .left-panel-scroll::-webkit-scrollbar-track { background: transparent; }
          .left-panel-scroll::-webkit-scrollbar-thumb { background: #312e81; border-radius: 4px; }
        `}</style>

        {leftPanelOpen ? (
          loading ? (
            <DocRowSkeleton count={12} />
          ) : note?.docs?.length ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                marginBottom: 8, padding: "4px 0",
              }}>
                <Checkbox checked={false} />
                <span style={{ fontSize: 13, fontWeight: 500, color: "#94a3b8" }}>
                  Select all sources
                </span>
              </div>
              {note?.docs?.map((doc) => (
                <div
                  key={doc._id}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 8px", borderRadius: 10,
                    transition: "all 0.15s", cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLDivElement).style.background = "transparent";
                  }}
                >
                  <SourceIcon type={doc?.source_type} />
                  <span style={{
                    flex: 1, fontSize: 13, color: "#cbd5e1",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }}>
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
          ) : (
            <div style={{
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              height: "100%", textAlign: "center", padding: "0 12px",
            }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: "rgba(99,102,241,0.1)",
                border: "1px solid rgba(99,102,241,0.2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16,
              }}>
                <NotepadText size={28} style={{ color: "#818cf8" }} />
              </div>
              <p style={{
                fontSize: 13, color: "#475569", fontWeight: 500, lineHeight: 1.6,
              }}>
                Saved sources will appear here. Click Add source above to add PDFs, websites, or text. Or import a file directly from Google Drive.
              </p>
            </div>
          )
        ) : (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: 24, gap: 16 }}>
            {note?.docs?.map((doc) => (
              <button
                key={doc._id}
                style={{
                  width: 36, height: 36, borderRadius: 10,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "#818cf8", cursor: "pointer", transition: "all 0.2s",
                }}
              >
                <FileText size={16} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


type DocRowSkeletonProps = {
  count?: number;
};

const DocRowSkeleton: React.FC<DocRowSkeletonProps> = ({ count = 5 }) => {
  return (
    <>
      <style>{`
        @keyframes darkShimmer {
          0% { background-position: -200px 0; }
          100% { background-position: 200px 0; }
        }
      `}</style>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: 8, borderRadius: 10,
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
              backgroundSize: "400px 100%",
              animation: "darkShimmer 1.5s infinite linear",
            }} />
            <div style={{
              flex: 1, height: 14, borderRadius: 4,
              background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
              backgroundSize: "400px 100%",
              animation: "darkShimmer 1.5s infinite linear",
            }} />
            <div style={{
              width: 20, height: 20, borderRadius: 4,
              background: "linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)",
              backgroundSize: "400px 100%",
              animation: "darkShimmer 1.5s infinite linear",
            }} />
          </div>
        ))}
      </div>
    </>
  );
};


interface SourceIconProps {
  type?: string;
}

function SourceIcon({ type = "" }: SourceIconProps) {
  const normalized = type.toLowerCase();

  if (normalized.includes("pdf")) {
    return (
      <img
        src={PdfIcon}
        alt="PDF Icon"
        width={20}
        height={20}
        style={{ borderRadius: 4 }}
      />
    );
  }

  return <FileText size={18} style={{ color: "#818cf8", flexShrink: 0 }} />;
}


export default LeftPanel;
