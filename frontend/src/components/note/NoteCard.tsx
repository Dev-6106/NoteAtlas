import type { NoteType } from '@/types/note-types';
import { formatDate } from '@/util/formatDate';
import { truncateTitle } from '@/util/truncateTitle';
import DefaultImage from '@/assets/default.png';

type NoteCardProps = {
  notebooks: NoteType[];
  viewNoteDetail: (id: string) => void;
};

// Subtle single-hue variants — all purple family to stay on-brand
const cardAccents = [
  { bg: "rgba(109,95,246,0.07)", border: "rgba(109,95,246,0.18)", glow: "rgba(109,95,246,0.18)" },
  { bg: "rgba(139,112,246,0.07)", border: "rgba(139,112,246,0.18)", glow: "rgba(139,112,246,0.18)" },
  { bg: "rgba(167,139,250,0.06)", border: "rgba(167,139,250,0.16)", glow: "rgba(167,139,250,0.16)" },
  { bg: "rgba(196,181,253,0.05)", border: "rgba(196,181,253,0.14)", glow: "rgba(196,181,253,0.14)" },
  { bg: "rgba(78,58,180,0.08)", border: "rgba(78,58,180,0.2)", glow: "rgba(78,58,180,0.2)" },
  { bg: "rgba(99,80,220,0.07)", border: "rgba(99,80,220,0.18)", glow: "rgba(99,80,220,0.18)" },
];

const NoteCard = ({ notebooks, viewNoteDetail }: NoteCardProps) => {
  return (<>
    {notebooks.map((note: NoteType, index: number) => {
      const accent = cardAccents[index % cardAccents.length];
      return (
        <div
          key={note._id}
          onClick={() => viewNoteDetail(note?._id)}
          style={{
            position: "relative",
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
            overflow: "hidden",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(-4px)";
            el.style.boxShadow = `0 20px 48px ${accent.glow}`;
            el.style.borderColor = "rgba(109,95,246,0.45)";
            el.style.background = "rgba(255,255,255,0.04)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLDivElement;
            el.style.transform = "translateY(0)";
            el.style.boxShadow = "none";
            el.style.borderColor = accent.border;
            el.style.background = accent.bg;
          }}
        >
          {/* Subtle inner glow top-right */}
          <div style={{
            position: "absolute", top: -20, right: -20,
            width: 100, height: 100, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent.glow} 0%, transparent 70%)`,
            pointerEvents: "none",
          }} />

          {/* Image / emoji */}
          <div style={{ height: 72, marginBottom: 10, display: "flex", alignItems: "flex-start" }}>
            {note?.image && (
              typeof note.image === "string" && note.image.startsWith("http") ? (
                <img
                  src={note.image || DefaultImage}
                  onError={e => { e.currentTarget.src = DefaultImage; }}
                  width={68}
                  style={{ borderRadius: 10, opacity: 0.88, objectFit: "cover" }}
                  alt=""
                />
              ) : (
                <span style={{ fontSize: "3.2rem", lineHeight: 1 }}>{note.image}</span>
              )
            )}
          </div>

          {/* Content */}
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", flex: 1 }}>
            <h2 style={{
              fontSize: 14.5, fontWeight: 600,
              color: "#f0eeff",
              letterSpacing: "-0.2px",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.45,
              marginBottom: 6,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}>
              {truncateTitle(note.title)}
            </h2>
            <p style={{
              fontSize: 11.5, color: "#4e4872",
              fontWeight: 500, fontFamily: "'DM Sans', system-ui, sans-serif",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span>{formatDate(note.createdAt)}</span>
              <span style={{ width: 3, height: 3, borderRadius: "50%", background: "#4e4872", flexShrink: 0, display: "inline-block" }} />
              <span>{note?.docs?.length ?? 0} source{note?.docs?.length !== 1 ? 's' : ''}</span>
            </p>
          </div>
        </div>
      );
    })}
  </>);
};

export default NoteCard;