
import type { NoteType } from '@/types/note-types';
import { formatDate } from '@/util/formatDate';
import { truncateTitle } from '@/util/truncateTitle';

import DefaultImage from '@/assets/default.png';

type NoteCardProps = {
    notebooks: NoteType[];
    viewNoteDetail: (id: string) => void;
};

/* Dark-themed accent colors for card variety */
const cardAccents = [
  { bg: "rgba(99,102,241,0.08)", border: "rgba(99,102,241,0.2)", glow: "rgba(99,102,241,0.15)" },
  { bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.2)", glow: "rgba(139,92,246,0.15)" },
  { bg: "rgba(59,130,246,0.08)", border: "rgba(59,130,246,0.2)", glow: "rgba(59,130,246,0.15)" },
  { bg: "rgba(245,158,11,0.06)", border: "rgba(245,158,11,0.18)", glow: "rgba(245,158,11,0.12)" },
  { bg: "rgba(34,197,94,0.06)", border: "rgba(34,197,94,0.18)", glow: "rgba(34,197,94,0.12)" },
  { bg: "rgba(236,72,153,0.06)", border: "rgba(236,72,153,0.18)", glow: "rgba(236,72,153,0.12)" },
  { bg: "rgba(14,165,233,0.06)", border: "rgba(14,165,233,0.18)", glow: "rgba(14,165,233,0.12)" },
  { bg: "rgba(168,85,247,0.08)", border: "rgba(168,85,247,0.2)", glow: "rgba(168,85,247,0.15)" },
];

function getCardAccent(index: number) {
  return cardAccents[index % cardAccents.length];
}

const NoteCard = ({ notebooks, viewNoteDetail }: NoteCardProps) => {

    return (<>
        {
            notebooks.map((note: NoteType, index: number) => {
                const accent = getCardAccent(index);
                return (
                    <div
                        key={note._id}
                        onClick={() => viewNoteDetail(note?._id)}
                        style={{
                            position: "relative",
                            padding: 16,
                            borderRadius: 16,
                            height: 180,
                            background: accent.bg,
                            border: `1px solid ${accent.border}`,
                            backdropFilter: "blur(8px)",
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            display: "flex",
                            flexDirection: "column",
                            overflow: "hidden",
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(-3px)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = `0 16px 40px ${accent.glow}`;
                            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(99,102,241,0.4)";
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                            (e.currentTarget as HTMLDivElement).style.borderColor = accent.border;
                        }}
                    >
                        {/* Image area */}
                        <div style={{ height: 80, marginBottom: 8 }}>
                            {note?.image && (
                                typeof note.image === "string" && note.image.startsWith("http")
                                    ? (
                                        <img
                                            src={note.image || DefaultImage}
                                            onError={(e) => {
                                                e.currentTarget.src = DefaultImage;
                                            }}
                                            width={80}
                                            style={{ paddingTop: 8, borderRadius: 8, opacity: 0.9 }}
                                        />
                                    )
                                    : (
                                        <span style={{ fontSize: "3.5rem" }}>
                                            {note.image}
                                        </span>
                                    )
                            )}
                        </div>

                        {/* Content */}
                        <div style={{
                            display: "flex", flexDirection: "column",
                            justifyContent: "flex-end", flex: 1,
                        }}>
                            <h2 style={{
                                fontSize: 15, fontWeight: 700,
                                color: "#f1f5f9",
                                letterSpacing: "-0.2px",
                                overflow: "hidden",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                lineHeight: 1.4,
                                marginBottom: 4,
                            }}>
                                {truncateTitle(note.title)}
                            </h2>
                            <p style={{
                                fontSize: 12, color: "#475569",
                                fontWeight: 500,
                            }}>
                                {formatDate(note.createdAt)} • {note?.docs?.length} sources
                            </p>
                        </div>
                    </div>
                );
            })
        }
    </>);
};

export default NoteCard;