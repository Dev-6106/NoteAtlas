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
import { addDocIds, setDocIds } from "@/store/rightPanelSlice";
import { setIsNewChatDraft } from "@/store/chatHistorySlice";
import PdfIcon from "@/assets/pdf.png";
import { MoreVertical, Trash2, Edit2, UploadCloud, MessageSquare } from "lucide-react";
import { deleteSourceApi, renameSourceApi, uploadFilesApi } from "@/api/notes";
import { fetchSingleNote } from "@/store/chatSlice";

type LeftPanelProps = {
  note: NoteType;
  loading: boolean;
};

const LeftPanel = ({ note, loading }: LeftPanelProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { leftPanelOpen } = useSelector((state: RootState) => state.chat);
  const { docIds } = useSelector((state: RootState) => state.rightPanel);
  const [openSourceMenuId, setOpenSourceMenuId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editDocName, setEditDocName] = useState("");
  const [deleteConfirmSourceId, setDeleteConfirmSourceId] = useState<string | null>(null);
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if(leftPanelOpen) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!leftPanelOpen) return;
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setIsUploading(true);
      try {
        await uploadFilesApi(files, note._id);
        dispatch(fetchSingleNote(note._id));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteSourceClick = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setOpenSourceMenuId(null);
    setDeleteConfirmSourceId(docId);
  };

  const handleConfirmDeleteSource = async () => {
    if (deleteConfirmSourceId) {
      await deleteSourceApi(deleteConfirmSourceId);
      dispatch(fetchSingleNote(note._id));
      setDeleteConfirmSourceId(null);
    }
  };

  const handleRenameSource = (e: React.MouseEvent, docId: string, currentName: string) => {
    e.stopPropagation();
    setOpenSourceMenuId(null);
    setEditingDocId(docId);
    setEditDocName(currentName);
  };

  const saveRename = async (docId: string, currentName: string) => {
    if (editDocName && editDocName.trim() !== "" && editDocName !== currentName) {
      await renameSourceApi(docId, editDocName.trim());
      dispatch(fetchSingleNote(note._id));
    }
    setEditingDocId(null);
  };

  const handleBulkDeleteClick = () => {
    if (docIds.length === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    if (docIds.length === 0) return;
    await Promise.all(docIds.map(id => deleteSourceApi(id)));
    dispatch(setDocIds([]));
    dispatch(fetchSingleNote(note._id));
    setBulkDeleteConfirmOpen(false);
  };

  const handleChatAboutSource = (e: React.MouseEvent, docId: string) => {
    e.stopPropagation();
    setOpenSourceMenuId(null);
    dispatch(setDocIds([docId]));
    dispatch(setIsNewChatDraft(true));
  };

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
    dispatch(addDocIds(docId));
  }

  function handleSelectAll(checked: boolean) {
    if (checked) {
      const allIds = note?.docs?.map((doc) => doc._id) || [];
      dispatch(setDocIds(allIds));
    } else {
      dispatch(setDocIds([]));
    }
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
        position: "relative"
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
          className="hide-on-mobile"
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
          position: "relative"
        }}
      >
        {isDragging && leftPanelOpen && (
          <div style={{
            position: "absolute", inset: 16, zIndex: 10,
            background: "var(--bg-surface)",
            border: "2px dashed var(--border-accent)",
            borderRadius: 12,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 12, color: "var(--primary-brand)"
          }}>
            <UploadCloud size={32} />
            <span style={{ fontWeight: 600 }}>Drop files to upload</span>
          </div>
        )}

        {leftPanelOpen ? (
          loading || isUploading ? (
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
                <Checkbox 
                  checked={docIds.length === note.docs.length && note.docs.length > 0} 
                  onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                />
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-3)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  Select all sources
                </span>
                {docIds.length > 0 && (
                  <button
                    onClick={handleBulkDeleteClick}
                    title={`Delete ${docIds.length} selected`}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--color-error)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center"
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--color-error-light)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    <Trash2 size={14} />
                  </button>
                )}
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
                      border: docIds.includes(doc._id)
                        ? "1px solid var(--border-accent)"
                        : "1px solid transparent",
                      background: docIds.includes(doc._id)
                        ? "var(--primary-glow)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!docIds.includes(doc._id)) {
                        e.currentTarget.style.background =
                          "var(--bg-card-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!docIds.includes(doc._id)) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                    onClick={() => handleDocSelect(doc._id)}
                  >
                    <SourceIcon type={doc?.source_type} />
                    {editingDocId === doc._id ? (
                      <input
                        autoFocus
                        value={editDocName}
                        onChange={(e) => setEditDocName(e.target.value)}
                        onBlur={() => saveRename(doc._id, doc?.displayName || doc?.title)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveRename(doc._id, doc?.displayName || doc?.title);
                          if (e.key === 'Escape') setEditingDocId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 450,
                          color: "var(--text-1)",
                          background: "var(--bg-elevated)",
                          border: "1px solid var(--border-accent)",
                          borderRadius: 4,
                          padding: "2px 6px",
                          outline: "none",
                        }}
                      />
                    ) : (
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
                        title={doc?.displayName || doc?.title}
                      >
                        {doc?.displayName || doc?.title}
                      </span>
                    )}

                    {/* Status Badge */}
                    {doc?.status && doc.status !== 'indexed' && (
                      <span style={{
                        fontSize: 10,
                        padding: "2px 6px",
                        borderRadius: 10,
                        background: doc.status === 'failed' ? "var(--color-error-light)" : "var(--color-warning-light)",
                        color: doc.status === 'failed' ? "var(--color-error)" : "var(--color-warning)",
                        fontWeight: 600,
                        textTransform: "capitalize"
                      }}>
                        {doc.status}
                      </span>
                    )}
                    
                    {/* Context Menu Button */}
                    <div style={{ position: "relative" }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setOpenSourceMenuId(openSourceMenuId === doc._id ? null : doc._id); }}
                        style={{
                          background: openSourceMenuId === doc._id ? "var(--bg-elevated)" : "transparent",
                          border: "none",
                          borderRadius: 6,
                          padding: 2,
                          cursor: "pointer",
                          color: "var(--text-3)",
                          transition: "all 0.2s",
                          display: "flex"
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--text-1)"}
                        onMouseLeave={e => e.currentTarget.style.color = openSourceMenuId === doc._id ? "var(--text-1)" : "var(--text-3)"}
                      >
                        <MoreVertical size={14} />
                      </button>

                      {/* Dropdown Menu */}
                      {openSourceMenuId === doc._id && (
                        <>
                          <div 
                            onClick={(e) => { e.stopPropagation(); setOpenSourceMenuId(null); }}
                            style={{ position: "fixed", inset: 0, zIndex: 10 }}
                          />
                          <div style={{
                            position: "absolute", top: 24, right: 0,
                            background: "var(--bg-elevated)",
                            border: "1px solid var(--border-default)",
                            borderRadius: 10,
                            boxShadow: "var(--shadow-lg)",
                            padding: 4,
                            minWidth: 140,
                            zIndex: 20,
                            display: "flex", flexDirection: "column", gap: 2,
                            animation: "fadeUp 0.15s ease-out"
                          }}>
                            <MenuButton icon={<Edit2 size={13}/>} label="Rename" onClick={(e) => handleRenameSource(e, doc._id, doc.displayName || doc.title)} />
                            <MenuButton icon={<MessageSquare size={13}/>} label="Chat about this" onClick={(e) => handleChatAboutSource(e, doc._id)} />
                            <div style={{ height: 1, background: "var(--border-default)", margin: "2px 0" }} />
                            <MenuButton icon={<Trash2 size={13}/>} label="Delete" danger onClick={(e) => handleDeleteSourceClick(e, doc._id)} />
                          </div>
                        </>
                      )}
                    </div>

                    <Checkbox
                      className="cursor-pointer"
                      checked={docIds.includes(doc._id)}
                      onCheckedChange={() => handleDocSelect(doc._id)}
                      onClick={(e) => e.stopPropagation()}
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
                  border: docIds.includes(doc._id)
                    ? "1px solid var(--border-accent)"
                    : "1px solid var(--border-default)",
                  background: docIds.includes(doc._id)
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
                  if (!docIds.includes(doc._id)) {
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

      {/* Custom Delete Confirmation Modal for Single Source */}
      {deleteConfirmSourceId && (
        <div 
          onClick={() => setDeleteConfirmSourceId(null)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: 16, border: "1px solid var(--border-default)", maxWidth: 400, width: "90%", boxShadow: "var(--shadow-xl)", animation: "fadeUp 0.2s ease-out" }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Delete Source</h3>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
              Are you sure you want to delete this source? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                onClick={() => setDeleteConfirmSourceId(null)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-2)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmDeleteSource}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-error)", color: "var(--text-1)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Bulk Delete Confirmation Modal */}
      {bulkDeleteConfirmOpen && (
        <div 
          onClick={() => setBulkDeleteConfirmOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{ background: "var(--bg-elevated)", padding: 24, borderRadius: 16, border: "1px solid var(--border-default)", maxWidth: 400, width: "90%", boxShadow: "var(--shadow-xl)", animation: "fadeUp 0.2s ease-out" }}
          >
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Delete {docIds.length} Sources</h3>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
              Are you sure you want to delete the selected {docIds.length} sources? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                onClick={() => setBulkDeleteConfirmOpen(false)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-2)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmBulkDelete}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-error)", color: "var(--text-1)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
            background: "var(--primary-mid)",
          }}
        />
        <div
          style={{
            flex: 1,
            height: 14,
            borderRadius: 4,
            background: "var(--primary-mid)",
          }}
        />
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            background: "var(--primary-mid)",
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
    return <Youtube size={16} style={{ color: "var(--color-error)" }} />;
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

  return <FileText size={16} style={{ color: "var(--color-info)" }} />;
}

const MenuButton = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: (e: React.MouseEvent) => void, danger?: boolean }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "6px 10px",
        borderRadius: 6,
        border: "none",
        background: "transparent",
        color: danger ? "var(--color-error)" : "var(--text-2)",
        fontSize: 12,
        fontWeight: 500,
        cursor: "pointer",
        transition: "all 0.15s ease",
        textAlign: "left",
        width: "100%"
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = danger ? "var(--color-error-light)" : "var(--bg-card-hover)";
        e.currentTarget.style.color = danger ? "var(--color-error)" : "var(--text-1)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = danger ? "var(--color-error)" : "var(--text-2)";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default LeftPanel;