import CreateNoteModal from '@/components/note/createNoteModal/CreateNoteModal';
import DiscoveryModal from '@/components/note/DiscoveryModal';
import EditNoteModal from '@/components/note/EditNoteModal';
import NoteCard from '@/components/note/NoteCard';
import type { AppDispatch, RootState } from '@/store';
import { fetchNotes } from '@/store/noteSlice';
import { Loader2, Plus, Search, BookOpen } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { debounce } from 'lodash'
import { toggleAddSourceNoteModal } from '@/store/addSourceSlice';
import { useNavigate } from 'react-router';
import { createBlankNote } from '@/api/notes';
import { attribNoteVal } from '@/store/chatSlice';

function NotePage() {
    const dispatch = useDispatch<AppDispatch>();
    const { notes, loading, pagination } = useSelector((state: RootState) => state.note);

    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('')
    const totalPages = pagination?.totalPages ?? 1;
    const navigate = useNavigate()
    const [createNoteLoading, setCreateNoteLoading] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);

    const fetchNoteWithDebounce = useCallback(debounce((page: number, search: string) => {
        dispatch(fetchNotes({ page, search }))
    }, 500), [dispatch])

    const searchNote = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value)
        setPage(1)
    }

    const viewNoteDetail = (id: string) => {
        navigate('/chats/' + id)
    }

    const showAddNoteSourceModal = async () => {
        try {
            setCreateNoteLoading(true)
            const data = await createBlankNote()
            dispatch(toggleAddSourceNoteModal())
            dispatch(attribNoteVal(data?.newNote))
            navigate('/chats/' + data?.newNote?._id)
            setCreateNoteLoading(false)
        } catch (error) {
            setCreateNoteLoading(false)
        }
    }

    useEffect(() => {
        fetchNoteWithDebounce(page, search)
    }, [page, search, fetchNoteWithDebounce])

    return (
        <div style={{
            minHeight: "100vh",
            background: "#080b14",
            fontFamily: "'DM Sans', system-ui, sans-serif",
            padding: "32px 28px",
            color: "#e2e8f0",
        }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
                * { box-sizing: border-box; }
                @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                .np-fade { animation: fadeUp 0.5s ease both; }
                .np-fade-1 { animation: fadeUp 0.5s 0.08s ease both; }
                .np-fade-2 { animation: fadeUp 0.5s 0.16s ease both; }

                /* Pagination overrides */
                [data-slot="pagination-link"],
                [data-slot="pagination-previous"],
                [data-slot="pagination-next"] {
                    background: rgba(255,255,255,0.04) !important;
                    border: 1px solid rgba(255,255,255,0.08) !important;
                    color: #64748b !important;
                    border-radius: 8px !important;
                    transition: all 0.2s !important;
                    font-family: 'DM Sans', system-ui, sans-serif !important;
                    font-size: 13px !important;
                    font-weight: 600 !important;
                }
                [data-slot="pagination-link"]:hover,
                [data-slot="pagination-previous"]:hover,
                [data-slot="pagination-next"]:hover {
                    background: rgba(99,102,241,0.12) !important;
                    border-color: rgba(99,102,241,0.35) !important;
                    color: #a5b4fc !important;
                }
                [data-slot="pagination-link"][data-active="true"],
                [aria-current="page"] {
                    background: linear-gradient(135deg,#6366f1,#8b5cf6) !important;
                    border-color: transparent !important;
                    color: #fff !important;
                    box-shadow: 0 4px 14px rgba(99,102,241,0.35) !important;
                }
            `}</style>

            {/* ── Header Row ── */}
            <div className="np-fade" style={{
                display: "flex", alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap", gap: 16, marginBottom: 32,
            }}>
                {/* Title */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: "rgba(99,102,241,0.15)",
                        border: "1px solid rgba(99,102,241,0.25)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        flexShrink: 0,
                    }}>
                        <BookOpen size={17} style={{ color: "#818cf8" }} />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: 20, fontWeight: 800, color: "#f1f5f9",
                            letterSpacing: "-0.5px", lineHeight: 1,
                        }}>
                            Recent Notebooks
                        </h1>
                        <p style={{ fontSize: 12, color: "#475569", marginTop: 3 }}>
                            {notes?.length ?? 0} notebook{notes?.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div style={{
                    position: "relative", width: 240,
                }}>
                    <Search size={14} style={{
                        position: "absolute", left: 12, top: "50%",
                        transform: "translateY(-50%)",
                        color: searchFocused ? "#818cf8" : "#475569",
                        transition: "color 0.2s", pointerEvents: "none",
                    }} />
                    <input
                        value={search}
                        onChange={searchNote}
                        onFocus={() => setSearchFocused(true)}
                        onBlur={() => setSearchFocused(false)}
                        placeholder="Search notebooks…"
                        style={{
                            width: "100%", padding: "9px 14px 9px 34px",
                            background: searchFocused ? "rgba(99,102,241,0.08)" : "rgba(255,255,255,0.04)",
                            border: searchFocused ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.08)",
                            borderRadius: 10, color: "#e2e8f0", fontSize: 13, fontWeight: 500,
                            outline: "none", transition: "all 0.2s",
                            fontFamily: "'DM Sans', system-ui, sans-serif",
                            boxShadow: searchFocused ? "0 0 16px rgba(99,102,241,0.12)" : "none",
                        }}
                    />
                </div>
            </div>

            {/* ── Grid ── */}
            <div className="np-fade-1" style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: 14,
                marginBottom: 36,
            }}>
                {/* Create new notebook card */}
                <div
                    onClick={showAddNoteSourceModal}
                    style={{
                        display: "flex", flexDirection: "column",
                        alignItems: "center", justifyContent: "center", gap: 10,
                        height: 160, borderRadius: 16, cursor: "pointer",
                        border: "1.5px dashed rgba(99,102,241,0.25)",
                        background: "rgba(99,102,241,0.04)",
                        transition: "all 0.2s",
                    }}
                    onMouseEnter={e => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.09)"
                        ;(e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.45)"
                        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"
                        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "0 12px 32px rgba(99,102,241,0.12)"
                    }}
                    onMouseLeave={e => {
                        (e.currentTarget as HTMLDivElement).style.background = "rgba(99,102,241,0.04)"
                        ;(e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.25)"
                        ;(e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"
                        ;(e.currentTarget as HTMLDivElement).style.boxShadow = "none"
                    }}
                >
                    {createNoteLoading ? (
                        <Loader2
                            size={22}
                            style={{ color: "#818cf8", animation: "spin 1s linear infinite" }}
                        />
                    ) : (
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: "rgba(99,102,241,0.15)",
                            border: "1px solid rgba(99,102,241,0.3)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                            <Plus size={20} style={{ color: "#818cf8" }} />
                        </div>
                    )}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>
                        Create new notebook
                    </span>
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                </div>

                <NoteCard viewNoteDetail={viewNoteDetail} notebooks={notes} />
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="np-fade-2" style={{ display: "flex", justifyContent: "center" }}>
                    <Pagination>
                        <PaginationContent style={{ gap: 6 }}>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                                />
                            </PaginationItem>

                            {[...Array(totalPages)].map((_, i) => (
                                <PaginationItem key={i}>
                                    <PaginationLink
                                        isActive={page === i + 1}
                                        onClick={() => setPage(i + 1)}
                                    >
                                        {i + 1}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}

                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}
        </div>
    )
}

export default NotePage