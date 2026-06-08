import type { NoteType } from '@/types/note-types';
import { formatDate } from '@/util/formatDate';
import { truncateTitle } from '@/util/truncateTitle';

import { useState } from 'react';
import { MoreVertical, Copy, Archive, Trash2, Edit2, ArchiveRestore, BookOpen } from 'lucide-react';
import { deleteNoteApi, duplicateNoteApi, updateNote } from '@/api/notes';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store';
import { fetchNotes } from '@/store/noteSlice';

type NoteCardProps = {
  notebooks: NoteType[];
  viewNoteDetail: (id: string) => void;
  isArchiveView?: boolean;
};

// Removed hardcoded purples, now relying on theme variables
const cardAccents = [
  { bg: "var(--bg-card)", border: "var(--border-default)", glow: "var(--primary-glow)" },
];

const NoteCard = ({ notebooks, viewNoteDetail, isArchiveView = false }: NoteCardProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteTitle, setEditNoteTitle] = useState("");

  const handleDuplicate = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    await duplicateNoteApi(id);
    dispatch(fetchNotes({ page: 1, search: "", isArchived: isArchiveView }));
  };

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteNoteApi(deleteConfirmId);
      dispatch(fetchNotes({ page: 1, search: "", isArchived: isArchiveView }));
      setDeleteConfirmId(null);
    }
  };

  const handleToggleArchive = async (e: React.MouseEvent, note: NoteType) => {
    e.stopPropagation();
    setOpenMenuId(null);
    await updateNote(note._id, undefined, !note.isArchived);
    dispatch(fetchNotes({ page: 1, search: "", isArchived: isArchiveView }));
  };

  const handleRenameClick = (e: React.MouseEvent, note: NoteType) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setEditingNoteId(note._id);
    setEditNoteTitle(note.title);
  };

  const handleSaveRename = async (id: string, currentTitle: string) => {
    if (editNoteTitle && editNoteTitle.trim() !== "" && editNoteTitle !== currentTitle) {
      await updateNote(id, editNoteTitle.trim(), undefined);
      dispatch(fetchNotes({ page: 1, search: "", isArchived: isArchiveView }));
    }
    setEditingNoteId(null);
  };

  return (<>
    {notebooks.map((note: NoteType, index: number) => {
      const accent = cardAccents[index % cardAccents.length];
      const isMenuOpen = openMenuId === note._id;
      return (
        <div
          key={note._id}
          onClick={() => viewNoteDetail(note?._id)}
          style={{
            position: "relative",
            zIndex: isMenuOpen ? 50 : 1,
            padding: "20px 18px",
            borderRadius: 18,
            height: 190,
            background: accent.bg,
            border: `1px solid ${accent.border}`,
            backdropFilter: "blur(10px)",
            cursor: "pointer",
            transition: "all 0.28s ease",
            display: "flex",
            flexDirection: "column",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(-4px)";
            el.style.boxShadow = `0 16px 40px var(--shadow-sm)`;
            el.style.borderColor = "var(--border-accent)";
            el.style.background = "var(--bg-card-hover)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
            el.style.borderColor = accent.border;
            el.style.background = accent.bg;
          }}
        >
          {/* Background overlay layer for clipping effects */}
          <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 18, pointerEvents: "none" }}>
            {/* Subtle inner glow top-right */}
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 100, height: 100, borderRadius: "50%",
              background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`,
            }} />
          </div>

          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1 }}>
            <div style={{ height: 72, marginBottom: 10, display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            {/* Notebook Icon / Image */}
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: "var(--primary-glow)",
              border: "1px solid var(--primary-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              overflow: "hidden",
            }}>
              {note.image ? (
                note.image.startsWith("http") ? (
                  <img 
                    src={note.image} 
                    alt={note.title} 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                      (e.target as HTMLImageElement).parentElement!.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-book-open" style="color: var(--primary-brand); opacity: 0.85;"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>';
                    }}
                  />
                ) : (
                  <span style={{ fontSize: "1.8rem", lineHeight: 1 }}>{note.image}</span>
                )
              ) : (
                <BookOpen size={24} style={{ color: "var(--primary-brand)", opacity: 0.85 }} />
              )}
            </div>
            
            {/* Context Menu Button */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : note._id); }}
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

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); }}
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
                    <MenuButton icon={<Edit2 size={14}/>} label="Rename" onClick={(e) => handleRenameClick(e, note)} />
                    <MenuButton icon={<Copy size={14}/>} label="Duplicate" onClick={(e) => handleDuplicate(e, note._id)} />
                    <MenuButton 
                      icon={isArchiveView ? <ArchiveRestore size={14}/> : <Archive size={14}/>} 
                      label={isArchiveView ? "Restore" : "Archive"} 
                      onClick={(e) => handleToggleArchive(e, note)} 
                    />
                    <div style={{ height: 1, background: "var(--border-default)", margin: "4px 0" }} />
                    <MenuButton icon={<Trash2 size={14}/>} label="Delete" danger onClick={(e) => handleDeleteClick(e, note._id)} />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1 }}>
            {editingNoteId === note._id ? (
              <input
                autoFocus
                value={editNoteTitle}
                onChange={(e) => setEditNoteTitle(e.target.value)}
                onBlur={() => handleSaveRename(note._id, note.title)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveRename(note._id, note.title);
                  if (e.key === 'Escape') setEditingNoteId(null);
                }}
                onClick={(e) => e.stopPropagation()}
                style={{
                  fontSize: 14.5, fontWeight: 600,
                  color: "var(--text-1)",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-accent)",
                  borderRadius: 6,
                  padding: "2px 6px",
                  outline: "none",
                  marginBottom: 6,
                  fontFamily: "var(--font-sans)",
                }}
              />
            ) : (
              <h2 style={{
                fontSize: 14.5, fontWeight: 600,
                color: "var(--text-1)",
                letterSpacing: "-0.2px",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                lineHeight: 1.45,
                marginBottom: 6,
                fontFamily: "var(--font-sans)",
              }}>
                {truncateTitle(note.title)}
              </h2>
            )}
            <p style={{
              fontSize: 11.5, color: "var(--text-3)",
              fontWeight: 500, fontFamily: "var(--font-sans)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{formatDate(note.createdAt)}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#4e4872", flexShrink: 0, display: "inline-block" }} />
              <span>{note?.docs?.length ?? 0} source{note?.docs?.length !== 1 ? 's' : ''}</span>
            </p>
          </div>
          </div>
        </div>
      );
    })}

    {/* Custom Delete Confirmation Modal */}
    {deleteConfirmId && (
      <div 
        onClick={() => setDeleteConfirmId(null)}
        style={{ 
          position: "fixed", inset: 0, zIndex: 9999, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" 
        }}
      >
        <div 
          onClick={(e) => e.stopPropagation()}
          style={{ 
            background: "var(--bg-elevated)", padding: 24, borderRadius: 16, 
            border: "1px solid var(--border-default)", maxWidth: 400, width: "90%", 
            boxShadow: "var(--shadow-xl)", animation: "fadeUp 0.2s ease-out" 
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Delete Notebook</h3>
          <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
            Are you sure you want to delete this notebook? This action cannot be undone and all associated sources will be removed.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <button 
              onClick={() => setDeleteConfirmId(null)}
              style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-2)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmDelete}
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
  </>);
};

const MenuButton = ({ icon, label, onClick, danger }: { icon: React.ReactNode, label: string, onClick: (e: React.MouseEvent) => void, danger?: boolean }) => {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "8px 12px",
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color: danger ? "var(--color-error)" : "var(--text-2)",
        fontSize: 13,
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

export default NoteCard;