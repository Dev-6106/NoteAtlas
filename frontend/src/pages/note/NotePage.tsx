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
  const totalPages = pagination?.totalPages ?? 1;
  const navigate = useNavigate();
  const [createNoteLoading, setCreateNoteLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const fetchNoteWithDebounce = useCallback(debounce((page: number, search: string) => {
    dispatch(fetchNotes({ page, search }))
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

  useEffect(() => { fetchNoteWithDebounce(page, search) }, [page, search, fetchNoteWithDebounce]);

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
          background:rgba(255,255,255,0.03) !important;
          border:1px solid rgba(255,255,255,0.06) !important;
          color:${T.text3} !important;
          border-radius:9px !important;
          font-family:${T.fontSans} !important;
          font-size:13px !important;
          font-weight:500 !important;
          transition:all 0.2s !important;
        }
        [data-slot="pagination-link"]:hover,
        [data-slot="pagination-previous"]:hover,
        [data-slot="pagination-next"]:hover{
          background:rgba(109,95,246,0.1) !important;
          border-color:rgba(109,95,246,0.4) !important;
          color:#b5acff !important;
        }
        [data-slot="pagination-link"][data-active="true"],
        [aria-current="page"]{
          background:linear-gradient(135deg,#6d5ff6,#8b5cf6) !important;
          border-color:transparent !important;
          color:#fff !important;
          box-shadow:0 4px 14px rgba(109,95,246,0.35) !important;
        }
        .search-inp::placeholder{color:${T.text3}}
      `}</style>

      {/* Header Row */}
      <div className="np-fade" style={{
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap", gap: 16, marginBottom: 40,
      }}>
        {/* Title block */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: "rgba(109,95,246,0.1)",
            border: "1px solid rgba(109,95,246,0.25)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <BookOpen size={18} style={{ color: "#8b80f8" }} />
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

        {/* Search */}
        <div style={{ position: "relative", width: 248 }}>
          <Search size={14} style={{
            position: "absolute", left: 13, top: "50%",
            transform: "translateY(-50%)",
            color: searchFocused ? "#8b80f8" : T.text3,
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
              background: searchFocused ? "rgba(109,95,246,0.07)" : "rgba(255,255,255,0.04)",
              border: searchFocused
                ? "1px solid rgba(109,95,246,0.5)"
                : `1px solid ${T.border}`,
              borderRadius: 10, color: T.text1, fontSize: 13.5, fontWeight: 400,
              outline: "none", transition: "all 0.22s",
              fontFamily: T.fontSans,
              boxShadow: searchFocused ? "0 0 0 3px rgba(109,95,246,0.10)" : "none",
            }}
          />
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
            border: "1.5px dashed rgba(109,95,246,0.22)",
            background: "rgba(109,95,246,0.03)",
            transition: "all 0.25s ease",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.background = "rgba(109,95,246,0.08)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(109,95,246,0.45)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 16px 40px rgba(109,95,246,0.12)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.background = "rgba(109,95,246,0.03)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(109,95,246,0.22)";
            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          {createNoteLoading ? (
            <Loader2 size={22} style={{ color: "#8b80f8", animation: "spin 0.75s linear infinite" }} />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: "rgba(109,95,246,0.12)",
              border: "1px solid rgba(109,95,246,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={20} style={{ color: "#8b80f8" }} />
            </div>
          )}
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text3, fontFamily: T.fontSans }}>
            {createNoteLoading ? "Creating…" : "New notebook"}
          </span>
        </div>

        {/* Note cards */}
        {loading ? (
          // Skeleton cards
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{
              height: 190, borderRadius: 18,
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${T.border}`,
              overflow: "hidden", position: "relative",
            }}>
              <div style={{
                position: "absolute", inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)",
                backgroundSize: "400px 100%",
                animation: "shimmer 1.8s infinite",
              }} />
            </div>
          ))
        ) : (
          <NoteCard viewNoteDetail={viewNoteDetail} notebooks={notes} />
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

export default NotePage;