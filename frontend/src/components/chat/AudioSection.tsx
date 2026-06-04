import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioSectionProps {
  audioUrl?: string;
  title?: string;
}

const AudioSection = ({ audioUrl, title }: AudioSectionProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => setPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioUrl]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  if (!audioUrl) return null;

  return (
    <div
      style={{
        borderRadius: 14,
        border: "1px solid var(--border-default)",
        background: "linear-gradient(135deg, rgba(74,222,128,0.06) 0%, rgba(109,95,246,0.06) 100%)",
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
    >
      <audio ref={audioRef} src={audioUrl} muted={muted} />

      {/* Title */}
      {title && (
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-2)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          🎧 {title}
        </span>
      )}

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            border: "none",
            background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(74,222,128,0.3)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          {playing ? (
            <Pause size={14} style={{ color: "#fff" }} />
          ) : (
            <Play size={14} style={{ color: "#fff", marginLeft: 2 }} />
          )}
        </button>

        {/* Progress bar */}
        <div
          onClick={seek}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: "var(--border-default)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 2,
              background: "linear-gradient(90deg, #4ade80, #22c55e)",
              transition: "width 0.15s linear",
            }}
          />
        </div>

        {/* Time */}
        <span
          style={{
            fontSize: 11,
            color: "var(--text-3)",
            fontWeight: 500,
            whiteSpace: "nowrap",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {fmt(audioRef.current?.currentTime || 0)} / {fmt(duration)}
        </span>

        {/* Mute toggle */}
        <button
          onClick={() => setMuted(!muted)}
          style={{
            width: 28,
            height: 28,
            borderRadius: 6,
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
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.color = "var(--primary-brand)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
};

export default AudioSection;
