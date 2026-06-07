import CreateNoteModal from '@/components/note/createNoteModal/CreateNoteModal';
import DiscoveryModal from '@/components/note/DiscoveryModal';
import NoteCard from '@/components/note/NoteCard';
import type { AppDispatch, RootState } from '@/store';
import { fetchNotes } from '@/store/noteSlice';
import { Loader2, Plus, Search, BookOpen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
  Pagination, PaginationContent, PaginationItem,
  PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { debounce } from 'lodash'
import { toggleAddSourceNoteModal } from '@/store/addSourceSlice';
import { useNavigate } from 'react-router';
import { createBlankNote } from '@/api/notes';
import { attribNoteVal } from '@/store/chatSlice';

import { T } from "@/components/ThemeTokens";

function NotePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { notes, loading, pagination } = useSelector((state: RootState) => state.note);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [isArchiveView, setIsArchiveView] = useState(false);
  const totalPages = pagination?.totalPages ?? 1;
  const navigate = useNavigate();
  const [createNoteLoading, setCreateNoteLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const fetchNoteWithDebounce = useCallback(debounce((page: number, search: string, isArchived: boolean, sortBy: string, sortOrder: string) => {
    dispatch(fetchNotes({ page, search, isArchived, sortBy, sortOrder }))
  }, 500), [dispatch]);

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

  useEffect(() => { fetchNoteWithDebounce(page, search, isArchiveView, sortBy, sortOrder) }, [page, search, isArchiveView, sortBy, sortOrder, fetchNoteWithDebounce]);

  return (
    <div style={{
      minHeight: "calc(100vh - 60px)",
      background: T.bg,
      fontFamily: T.fontSans,
      padding: "40px 36px",
      color: T.text1,
    }}>
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}
        .np-fade{animation:fadeUp 0.55s ease both}
        .np-fade1{animation:fadeUp 0.55s 0.08s ease both}
        .np-fade2{animation:fadeUp 0.55s 0.18s ease both}
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
      <div className="np-fade" style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, marginBottom: 40,
        position: "relative", zIndex: 50
      }}>
        {/* Title block */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
          
          {/* Sort/Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowSortMenu(!showSortMenu)}
              style={{
                height: 40, padding: "0 14px", borderRadius: 10,
                background: showSortMenu ? T.primaryGlow : T.bgCard,
                border: showSortMenu ? `1px solid ${T.borderAccent}` : `1px solid ${T.border}`,
                color: showSortMenu ? T.primary : T.text2,
                fontSize: 13, fontWeight: 500, fontFamily: T.fontSans,
                display: "flex", alignItems: "center", gap: 8,
                cursor: "pointer", transition: "all 0.2s"
              }}
              onMouseEnter={e => {
                if(!showSortMenu) {
                  e.currentTarget.style.background = T.bgCardHover;
                  e.currentTarget.style.color = T.text1;
                }
              }}
              onMouseLeave={e => {
                if(!showSortMenu) {
                  e.currentTarget.style.background = T.bgCard;
                  e.currentTarget.style.color = T.text2;
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
                background: searchFocused ? T.primaryGlow : T.bgCard,
                border: searchFocused
                  ? `1px solid ${T.borderAccent}`
                  : `1px solid ${T.border}`,
                borderRadius: 10, color: T.text1, fontSize: 13.5, fontWeight: 400,
                outline: "none", transition: "all 0.22s",
                fontFamily: T.fontSans,
                boxShadow: searchFocused ? T.shadowPrimary : "none",
              }}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${T.border}, transparent)`, marginBottom: 36 }} />

      {/* Grid */}
      <div className="np-fade1" style={{
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
            alignItems: "center", justifyContent: "center", gap: 12,
            height: 190, borderRadius: 18, cursor: "pointer",
            border: `1.5px dashed ${T.primaryBorder}`,
            background: T.primaryMid,
            transition: "all 0.25s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.background = T.primaryGlow;
            (e.currentTarget as HTMLDivElement).style.borderColor = T.borderAccent;
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = T.shadowPrimary;
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.background = T.primaryMid;
            (e.currentTarget as HTMLDivElement).style.borderColor = T.primaryBorder;
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {createNoteLoading ? (
            <Loader2 size={22} style={{ color: T.primary, animation: "spin 0.75s linear infinite" }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: T.primaryGlow,
              border: `1px solid ${T.primaryBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={20} style={{ color: T.primary }} />
            </div>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text3, fontFamily: T.fontSans }}>
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
          <NoteCard viewNoteDetail={viewNoteDetail} notebooks={notes} isArchiveView={isArchiveView} />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="np-fade2" style={{ display: "flex", justifyContent: "center" }}>
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
    </div>
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