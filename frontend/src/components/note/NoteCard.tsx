import { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { MoreVertical, BookOpen, Clock, Settings, Trash2 } from "lucide-react";
import type { NoteType } from "@/types/note-types";
import { useClickOutside } from "@/hooks/useClickOutside";

interface Props {
  note: NoteType;
}

// Subtle accent colors for card variety
const ACCENT_COLORS = [
  { bg: "rgba(99, 102, 241, 0.06)", border: "rgba(99, 102, 241, 0.35)" },
  { bg: "rgba(168, 85, 247, 0.06)", border: "rgba(168, 85, 247, 0.35)" },
  { bg: "rgba(59, 130, 246, 0.06)", border: "rgba(59, 130, 246, 0.35)" },
  { bg: "rgba(236, 72, 153, 0.06)", border: "rgba(236, 72, 153, 0.35)" },
  { bg: "rgba(16, 185, 129, 0.06)", border: "rgba(16, 185, 129, 0.35)" },
  { bg: "rgba(245, 158, 11, 0.06)", border: "rgba(245, 158, 11, 0.35)" },
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export default function NoteCard({ note }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsMenuOpen(false), isMenuOpen);

  const accent = useMemo(
    () => ACCENT_COLORS[hashString(note._id) % ACCENT_COLORS.length],
    [note._id]
  );

  const formattedDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(note.createdAt || Date.now())),
    [note.createdAt]
  );

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    },
    []
  );

  return (
    <Link
      to={`/notes/${note._id}`}
      className="group block relative h-[200px] flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card hover:border-muted-foreground/20 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
    >
      {/* Accent top border */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ backgroundColor: accent.border }}
      />

      {/* Decorative glow */}
      <div
        className="absolute -top-10 -right-10 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ backgroundColor: accent.bg }}
      />

      <div className="p-5 flex-1 flex flex-col z-10">
        <div className="flex justify-between items-start mb-3">
          <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center border border-border/60 group-hover:scale-105 transition-transform duration-300">
            {note.image && !note.image.includes("uploads") ? (
              <span className="text-xl">{note.image}</span>
            ) : note.image ? (
              <img
                src={note.image}
                alt={note.title}
                className="w-full h-full object-cover rounded-xl"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.innerHTML =
                    '<span class="text-xl">📓</span>';
                }}
              />
            ) : (
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            )}
          </div>

          <div ref={menuRef} className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsMenuOpen(!isMenuOpen);
              }}
              onKeyDown={handleMenuKeyDown}
              className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Note options"
              aria-expanded={isMenuOpen}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div
                className="absolute top-8 right-0 w-36 surface shadow-xl rounded-lg py-1 z-50 scale-in"
                role="menu"
                onKeyDown={handleMenuKeyDown}
              >
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Settings className="w-3.5 h-3.5" /> Rename
                </button>
                <button
                  role="menuitem"
                  className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <h3 className="text-base font-semibold text-foreground line-clamp-2 leading-snug">
          {note.title}
        </h3>
      </div>

      <div className="px-5 py-3 border-t border-border/40 bg-secondary/20 flex items-center justify-between text-[11px] font-medium text-muted-foreground z-10">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-secondary/80 border border-border/40">
          {note.docs?.length || 0} sources
        </span>
      </div>
    </Link>
  );
}