import CreateNoteModal from '@/components/note/createNoteModal/CreateNoteModal';
import DiscoveryModal from '@/components/note/DiscoveryModal';
import NoteCard from '@/components/note/NoteCard';
import type { AppDispatch, RootState } from '@/store';
import { fetchNotes } from '@/store/noteSlice';
import { Loader2, Plus, Search, BookOpen, Folder } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { createPortal } from 'react-dom';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { debounce } from 'lodash'
import { toggleAddSourceNoteModal } from '@/store/addSourceSlice';
import { useNavigate } from 'react-router';
import { createBlankNote } from '@/api/notes';
import { attribNoteVal } from '@/store/chatSlice';
import { fetchFolders, createNewFolder, moveNote, removeFolder, renameFolder } from '@/store/folderSlice';
import FolderCard from '@/components/note/FolderCard';
import CreateFolderModal from '@/components/note/CreateFolderModal';
import RenameFolderModal from '@/components/note/RenameFolderModal';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';

import { T } from "@/components/ThemeTokens";

function NotePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notes, loading, pagination } = useSelector((state: RootState) => state.note);
  const { folders, loading: foldersLoading } = useSelector((state: RootState) => state.folders);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isArchiveView, setIsArchiveView] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [folderToRename, setFolderToRename] = useState<{ id: string, name: string } | null>(null);
  const [deleteFolderConfirmId, setDeleteFolderConfirmId] = useState<string | null>(null);
  const totalPages = pagination?.totalPages ?? 1;
  const navigate = useNavigate();
  const [createNoteLoading, setCreateNoteLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const searchNote = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const viewNoteDetail = (id: string) => navigate('/chats/' + id);

  const showAddNoteSourceModal = async () => {
    try {
      setCreateNoteLoading(true);
      const data = await createBlankNote();
      dispatch(toggleAddSourceNoteModal());
      dispatch(attribNoteVal(data?.newNote));
      navigate('/chats/' + data?.newNote?._id);
    } finally {
      setCreateNoteLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(fetchNotes({ page, search, isArchived: isArchiveView, sortBy, sortOrder, folderId: currentFolderId || null }));
    }, search ? 500 : 0);
    return () => clearTimeout(timer);
  }, [page, search, isArchiveView, sortBy, sortOrder, currentFolderId, dispatch]);

  useEffect(() => {
    dispatch(fetchFolders());
  }, [dispatch]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && over.data.current?.type === 'Folder' && active.data.current?.type === 'Note') {
      const noteId = active.id as string;
      const folderId = over.id as string;
      dispatch(moveNote({ noteId, folderId })).then(() => {
        dispatch(fetchNotes({ page, search, isArchived: isArchiveView, sortBy, sortOrder, folderId: currentFolderId || null }));
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: "transparent",
      fontFamily: T.fontSans,
      padding: "40px 36px",
      color: T.text1,
    }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        [data-slot="pagination-link"],
        [data-slot="pagination-previous"],
        [data-slot="pagination-next"]{
          background: var(--bg-card) !important;
          border: 1px solid var(--border-default) !important;
          color: var(--text-3) !important;
          border-radius: 9px !important;
          font-family: var(--font-sans) !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          transition: all 0.2s !important;
        }
        [data-slot="pagination-link"]:hover,
        [data-slot="pagination-previous"]:hover,
        [data-slot="pagination-next"]:hover{
          background: var(--primary-glow) !important;
          border-color: var(--border-accent) !important;
          color: var(--primary-brand) !important;
        }
        [data-slot="pagination-link"][data-active="true"],
        [aria-current="page"]{
          background: linear-gradient(135deg, var(--primary-brand), var(--primary-light)) !important;
          border-color: transparent !important;
          color: var(--text-1) !important;
          box-shadow: var(--shadow-primary) !important;
        }
        .search-inp::placeholder{color: var(--text-4)}
        
        .np-search-container {
          position: relative;
          width: 248px;
        }
        
        @media (max-width: 640px) {
          .np-search-container {
            width: 100%;
          }
          .np-header-controls {
            width: 100%;
            flex-direction: column;
            align-items: stretch !important;
          }
        }
      `}</style>

      {/* Header Row */}
      <div className="fade-up" style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, marginBottom: 40,
        position: "relative", zIndex: 50
      }}>
        {/* Title block */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {currentFolderId && (
            <button
              onClick={() => setCurrentFolderId(null)}
              style={{
                background: "var(--bg-card)", border: "1px solid var(--border-default)",
                borderRadius: 8, padding: "8px 12px", cursor: "pointer",
                color: "var(--text-1)", display: "flex", alignItems: "center", gap: 6,
                fontFamily: "var(--font-sans)", fontSize: 13,
              }}
            >
              ← Back
            </button>
          )}
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: T.primaryGlow,
            border: `1px solid ${T.primaryBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={18} style={{ color: T.primary }} />
          </div>
          <div>
            <h1 style={{
              fontSize: 20, fontWeight: 700, color: T.text1,
              letterSpacing: "-0.5px", lineHeight: 1.2,
              fontFamily: T.fontSans,
            }}>
              Your Notebooks
            </h1>
            <p style={{ fontSize: 12, color: T.text3, marginTop: 2, fontFamily: T.fontSans }}>
              {notes?.length ?? 0} notebook{notes?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="np-header-controls" style={{ display: "flex", gap: 12, alignItems: "center" }}>
          
          <button
            onClick={() => setIsCreateFolderModalOpen(true)}
            style={{
              height: 40, padding: "0 16px", borderRadius: 12,
              background: "var(--bg-card)",
              border: `1px solid var(--border-default)`,
              color: "var(--text-1)",
              fontSize: 13.5, fontWeight: 500, fontFamily: "var(--font-sans)",
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer", transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = "var(--bg-surface)";
              e.currentTarget.style.borderColor = "var(--border-strong)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.borderColor = "var(--border-default)";
            }}
          >
            <Folder size={16} />
            <span>New Folder</span>
          </button>

          {/* Sort/Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                height: 40, padding: "0 16px", borderRadius: 12,
                background: showSortMenu ? "var(--bg-surface)" : "var(--bg-card)",
                border: showSortMenu ? `1px solid var(--border-strong)` : `1px solid var(--border-default)`,
                color: showSortMenu ? "var(--text-1)" : "var(--text-2)",
                fontSize: 13.5, fontWeight: 500, fontFamily: T.fontSans,
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer", transition: "all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1)",
                boxShadow: showSortMenu ? "0 8px 24px rgba(0,0,0,0.06)" : "0 2px 4px rgba(0,0,0,0.02)",
              }}
              onMouseEnter={e => {
                if(!showSortMenu) {
                  e.currentTarget.style.background = "var(--bg-surface)";
                  e.currentTarget.style.color = "var(--text-1)";
                  e.currentTarget.style.borderColor = "var(--border-strong)";
                  e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.06)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={e => {
                if(!showSortMenu) {
                  e.currentTarget.style.background = "var(--bg-card)";
                  e.currentTarget.style.color = "var(--text-2)";
                  e.currentTarget.style.borderColor = "var(--border-default)";
                  e.currentTarget.style.boxShadow = "0 2px 4px rgba(0,0,0,0.02)";
                  e.currentTarget.style.transform = "none";
                }
              }}
            >
              <span>{isArchiveView ? "Archived" : (sortBy === 'updatedAt' ? "Recently updated" : sortBy === 'createdAt' ? "Recently created" : "Alphabetical")}</span>
            </button>

            {showSortMenu && (
              <>
                <div onClick={() => setShowSortMenu(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
                <div style={{
                  position: "absolute", top: 48, right: 0,
                  background: "var(--bg-elevated)", border: `1px solid var(--border-default)`,
                  borderRadius: 12, boxShadow: "var(--shadow-lg)",
                  padding: 6, minWidth: 180, zIndex: 20,
                  display: "flex", flexDirection: "column", gap: 2,
                  animation: "fadeUp 0.15s ease-out"
                }}>
                  <div style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Sort by</div>
                  <SortBtn active={sortBy === 'updatedAt' && !isArchiveView} label="Recently updated" onClick={() => { setSortBy('updatedAt'); setSortOrder('desc'); setIsArchiveView(false); setShowSortMenu(false); }} />
                  <SortBtn active={sortBy === 'createdAt' && !isArchiveView} label="Recently created" onClick={() => { setSortBy('createdAt'); setSortOrder('desc'); setIsArchiveView(false); setShowSortMenu(false); }} />
                  <SortBtn active={sortBy === 'title' && !isArchiveView} label="Alphabetical" onClick={() => { setSortBy('title'); setSortOrder('asc'); setIsArchiveView(false); setShowSortMenu(false); }} />
                  
                  <div style={{ height: 1, background: "var(--border-default)", margin: "6px 0" }} />
                  <div style={{ padding: "4px 10px", fontSize: 11, fontWeight: 600, color: "var(--text-4)", textTransform: "uppercase", letterSpacing: "0.05em" }}>View</div>
                  <SortBtn active={isArchiveView} label="Archived Notebooks" onClick={() => { setIsArchiveView(true); setShowSortMenu(false); }} />
                </div>
              </>
            )}
          </div>

          {/* Search */}
          <div className="np-search-container">
            <Search size={14} style={{
              position: "absolute", left: 13, top: "50%",
              transform: "translateY(-50%)",
              color: searchFocused ? T.primary : T.text3,
              transition: "color 0.2s", pointerEvents: "none",
            }} />
            <input
              className="search-inp"
              value={search}
              onChange={searchNote}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search notebooks…"
              style={{
                width: "100%", padding: "10px 14px 10px 36px",
                background: searchFocused ? "var(--bg-surface)" : "var(--bg-card)",
                border: searchFocused
                  ? `1px solid var(--border-strong)`
                  : `1px solid var(--border-default)`,
                borderRadius: 12, color: T.text1, fontSize: 13.5, fontWeight: 400,
                outline: "none", transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
                fontFamily: T.fontSans,
                boxShadow: searchFocused ? "0 8px 24px rgba(0,0,0,0.06), inset 0 2px 4px rgba(255,255,255,0.4)" : "0 2px 4px rgba(0,0,0,0.02)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`, marginBottom: 36 }} />

      {/* Folders Section */}
      {folders.length > 0 && !isArchiveView && !currentFolderId && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 16, fontFamily: "var(--font-sans)" }}>Folders</h2>
          <div className="fade-up delay-100" style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
            gap: 16,
          }}>
            {folders.map(folder => (
              <FolderCard 
                key={folder._id} 
                id={folder._id} 
                name={folder.name} 
                onClick={() => {
                  setCurrentFolderId(folder._id);
                  setPage(1);
                }}
                onRename={(id, name) => setFolderToRename({ id, name })}
                onDelete={(id) => setDeleteFolderConfirmId(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--text-1)", marginBottom: 16, fontFamily: "var(--font-sans)" }}>Notebooks</h2>
      <div className="fade-up delay-200" style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))",
        gap: 16,
        marginBottom: 40,
      }}>
        {/* Create new card */}
        <div
          onClick={showAddNoteSourceModal}
          style={{
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 14,
            height: 190, borderRadius: 20, cursor: "pointer",
            border: `1.5px dashed var(--border-strong)`,
            background: "transparent",
            transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.background = "var(--bg-surface)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#3b82f6";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(0,0,0,0.06)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.background = "transparent";
            (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border-strong)";
            (e.currentTarget as HTMLDivElement).style.transform = "none";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {createNoteLoading ? (
            <Loader2 size={24} style={{ color: "#3b82f6", animation: "spin 0.75s linear infinite" }} />
          ) : (
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: "var(--bg-card)",
              border: `1px solid var(--border-default)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)"
            }}>
              <Plus size={22} style={{ color: "var(--text-2)" }} />
            </div>
          )}
          <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)", fontFamily: T.fontSans }}>
            {createNoteLoading ? "Creating…" : "New notebook"}
          </span>
        </div>

        {/* Note cards */}
        {loading ? (
          // Skeleton cards — theme-aware
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              height: 190, borderRadius: 18,
              background: T.bgCard,
              border: `1px solid ${T.border}`,
              overflow: "hidden", position: "relative",
            }}>
              <div className="shimmer-loading" style={{
                position: "absolute", inset: 0,
              }} />
            </div>
          ))
        ) : (
          <NoteCard viewNoteDetail={viewNoteDetail} notebooks={notes} isArchiveView={isArchiveView} currentFolderId={currentFolderId} />
        )}
      </div>

      {!loading && (!notes || notes.length === 0) && (!folders || folders.length === 0) && !isArchiveView && !currentFolderId && (
        <div className="fade-up" style={{ 
          display: "flex", flexDirection: "column", alignItems: "center", 
          justifyContent: "center", padding: "40px 20px", textAlign: "center" 
        }}>
          <div style={{ marginBottom: 24, position: "relative", width: 80, height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 18C41.5 30 46 34.5 58 36C46 37.5 41.5 42 40 54C38.5 42 34 37.5 22 36C34 34.5 38.5 30 40 18Z" fill="#E0D4FF"/>
              <path d="M22 46C22.5 50 24 51.5 28 52C24 52.5 22.5 54 22 58C21.5 54 20 52.5 16 52C20 51.5 21.5 50 22 46Z" fill="#E0D4FF"/>
              <path d="M60 46C60.5 50 62 51.5 66 52C62 52.5 60.5 54 60 58C59.5 54 58 52.5 54 52C58 51.5 59.5 50 60 46Z" fill="#E0D4FF"/>
              <path d="M30 20C30.5 22.5 31.5 23.5 34 24C31.5 24.5 30.5 25.5 30 28C29.5 25.5 28.5 24.5 26 24C28.5 23.5 29.5 22.5 30 20Z" fill="#E0D4FF"/>
              <path d="M52 24C52.5 26.5 53.5 27.5 56 28C53.5 28.5 52.5 29.5 52 32C51.5 29.5 50.5 28.5 48 28C50.5 27.5 51.5 26.5 52 24Z" fill="#E0D4FF"/>
              <path d="M42 6C42.5 8.5 43.5 9.5 46 10C43.5 10.5 42.5 11.5 42 14C41.5 11.5 40.5 10.5 38 10C40.5 9.5 41.5 8.5 42 6Z" fill="#E0D4FF"/>
            </svg>
          </div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", marginBottom: 12, letterSpacing: "-0.4px", fontFamily: "var(--font-sans)" }}>
            Welcome to NoteAtlas!
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-3)", maxWidth: 320, lineHeight: 1.6, fontFamily: "var(--font-sans)" }}>
            Create a new notebook or folder to get started and unlock the power of AI-assisted learning.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="fade-up delay-300" style={{ display: "flex", justifyContent: "center" }}>
          <Pagination>
            <PaginationContent style={{ gap: 6 }}>
              <PaginationItem>
                <PaginationPrevious onClick={() => setPage(prev => Math.max(prev - 1, 1))} />
              </PaginationItem>
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink isActive={page === i + 1} onClick={() => setPage(i + 1)}>
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext onClick={() => setPage(prev => Math.min(prev + 1, totalPages))} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <CreateNoteModal />
      <DiscoveryModal />
      <CreateFolderModal isOpen={isCreateFolderModalOpen} onClose={() => setIsCreateFolderModalOpen(false)} />
      
      {folderToRename && (
        <RenameFolderModal
          isOpen={!!folderToRename}
          onClose={() => setFolderToRename(null)}
          folderId={folderToRename.id}
          currentName={folderToRename.name}
        />
      )}

      {/* Custom Folder Delete Confirmation Modal */}
      {deleteFolderConfirmId && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setDeleteFolderConfirmId(null)}
          style={{ 
            position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, 
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
            <h3 style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginBottom: 8, fontFamily: "var(--font-sans)" }}>Delete Folder</h3>
            <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.5, fontFamily: "var(--font-sans)" }}>
              Are you sure you want to delete this folder? Notes inside will not be deleted, but will be moved to the root workspace.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button 
                onClick={() => setDeleteFolderConfirmId(null)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid var(--border-default)", background: "transparent", color: "var(--text-2)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--bg-card-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (deleteFolderConfirmId) {
                    dispatch(removeFolder(deleteFolderConfirmId)).then(() => {
                      dispatch(fetchNotes({ page, search, isArchived: isArchiveView, sortBy, sortOrder, folderId: currentFolderId }));
                    });
                    setDeleteFolderConfirmId(null);
                  }
                }}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--color-error)", color: "var(--text-1)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.9"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
    </DndContext>
  );
}

const SortBtn = ({ active, label, onClick }: { active: boolean, label: string, onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 12px", borderRadius: 8, border: "none",
      background: active ? "var(--primary-glow)" : "transparent",
      color: active ? "var(--primary-brand)" : "var(--text-2)",
      fontSize: 13, fontWeight: active ? 600 : 500,
      cursor: "pointer", transition: "all 0.15s ease", textAlign: "left", width: "100%"
    }}
    onMouseEnter={e => {
      if(!active) {
        e.currentTarget.style.background = "var(--bg-card-hover)";
        e.currentTarget.style.color = "var(--text-1)";
      }
    }}
    onMouseLeave={e => {
      if(!active) {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--text-2)";
      }
    }}
  >
    {label}
  </button>
)

export default NotePage;