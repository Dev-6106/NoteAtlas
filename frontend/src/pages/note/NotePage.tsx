import { useEffect, useState } from "react";
import { Plus, Search, Sparkles, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { fetchNotes } from "@/store/noteSlice";
import NoteCard from "@/components/note/NoteCard";
import CreateNoteModal from "@/components/note/createNoteModal/CreateNoteModal";
import { NoteCardSkeleton } from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { useDebounce } from "@/hooks/useDebounce";

export default function NotePage() {
  const dispatch = useAppDispatch();
  const { notes, loading } = useAppSelector((state) => state.notes);
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (user?._id) {
      dispatch(fetchNotes({ page: 1, search: debouncedSearch, userId: user._id }));
    }
  }, [dispatch, debouncedSearch, user?._id]);

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">My Notebooks</h1>
          <p className="text-muted-foreground text-sm">
            Organize your research, chat with documents, and generate insights.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search notebooks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-9 py-2 h-10 bg-secondary/50 border border-border/60 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring focus:bg-background shadow-sm transition-all placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 h-10 bg-primary text-primary-foreground font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">New Notebook</span>
          </button>
        </div>
      </div>

      {/* Grid section */}
      {loading && notes.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <NoteCardSkeleton key={i} />
          ))}
        </div>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 stagger-in">
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="w-full py-24 flex flex-col items-center justify-center text-center border-2 border-dashed border-border/60 rounded-2xl bg-secondary/10 fade-in">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 border border-border/50 shadow-sm">
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-foreground">No notebooks found</h3>
          <p className="text-muted-foreground max-w-sm mb-8 text-sm leading-relaxed">
            {debouncedSearch 
              ? `No results matching "${debouncedSearch}". Try a different term or clear your search.` 
              : "Create your first notebook to start chatting with your documents, generating mind maps, and more."}
          </p>
          {!debouncedSearch && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Create Notebook
            </button>
          )}
        </div>
      )}

      {isModalOpen && (
        <CreateNoteModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
