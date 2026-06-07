import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Headphones } from "lucide-react";

interface AudioSectionProps {
  audioUrl?: string;
  title?: string;
}

const AudioSection = ({ audioUrl, title }: AudioSectionProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Audio Context Setup for Waveform
    let audioCtx: AudioContext;
    let analyser: AnalyserNode;
    let source: MediaElementAudioSourceNode;
    let animationId: number;

    const setupAudioContext = () => {
        if (!audioCtx && audio) {
            try {
                audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
                analyser = audioCtx.createAnalyser();
                analyser.fftSize = 64;
                // Check if source was already created to avoid exception
                if (!(audio as any).sourceNode) {
                    source = audioCtx.createMediaElementSource(audio);
                    (audio as any).sourceNode = source;
                    source.connect(analyser);
                    analyser.connect(audioCtx.destination);
                } else {
                    analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 64;
                    (audio as any).sourceNode.connect(analyser);
                    analyser.connect(audioCtx.destination);
                }
            } catch (e) {
                console.error("Audio context error:", e);
            }
        }
    };

    const drawWaveform = () => {
        if (!canvasRef.current || !analyser) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const barWidth = (canvas.width / bufferLength) * 2.2;
        let x = 0;

        // Determine styling based on computed styles of primary variables to adapt to light/dark
        const computedStyle = getComputedStyle(document.body);
        const primaryColor = computedStyle.getPropertyValue('--primary-brand').trim() || 'var(--text-1)';
        const secondaryColor = computedStyle.getPropertyValue('--primary-light').trim() || '#ccc';

        for (let i = 0; i < bufferLength; i++) {
            let barHeight = (dataArray[i] / 255) * canvas.height;
            if (barHeight < 2) barHeight = 2; // minimum height
            
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, canvas.height - barHeight);
            gradient.addColorStop(0, primaryColor);
            gradient.addColorStop(1, secondaryColor);
            
            ctx.fillStyle = gradient;
            
            // Rounded bars for premium feel
            ctx.beginPath();
            ctx.roundRect(x, canvas.height - barHeight, barWidth - 1, barHeight, [4, 4, 4, 4]);
            ctx.fill();
            
            x += barWidth;
        }

        animationId = requestAnimationFrame(drawWaveform);
    };

    audio.addEventListener('play', () => {
        setupAudioContext();
        if (audioCtx?.state === 'suspended') {
            audioCtx.resume();
        }
        drawWaveform();
    });

    audio.addEventListener('pause', () => {
        cancelAnimationFrame(animationId);
    });

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
      cancelAnimationFrame(animationId);
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
        borderRadius: 16,
        border: "1px solid var(--border-default)",
        background: "var(--bg-card)",
        backdropFilter: "blur(12px)",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        boxShadow: "var(--shadow-card)",
      }}
    >
      <audio ref={audioRef} src={audioUrl} muted={muted} crossOrigin="anonymous" />

      {/* Waveform Visualization */}
      <div style={{ width: "100%", height: 44, display: "flex", justifyContent: "center", marginBottom: -4 }}>
          <canvas ref={canvasRef} width={240} height={44} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Title */}
      {title && (
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-1)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}
        >
          <Headphones size={15} style={{ verticalAlign: "text-bottom", marginRight: 6 }} /> {title}
        </span>
      )}

      {/* Controls row */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Play / Pause */}
        <button
          onClick={togglePlay}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            border: "none",
            background: "var(--primary-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "var(--shadow-sm)",
            transition: "transform 0.2s, filter 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.06)";
            e.currentTarget.style.filter = "brightness(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.filter = "brightness(1)";
          }}
        >
          {playing ? (
            <Pause size={16} style={{ color: "var(--bg-surface)" }} />
          ) : (
            <Play size={16} style={{ color: "var(--bg-surface)", marginLeft: 2 }} />
          )}
        </button>

        {/* Progress bar */}
        <div
          onClick={seek}
          style={{
            flex: 1,
            height: 6,
            borderRadius: 3,
            background: "var(--primary-surface)",
            border: "1px solid var(--border-default)",
            cursor: "pointer",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: "100%",
              borderRadius: 3,
              background: "var(--primary-brand)",
              transition: "width 0.1s linear",
            }}
          />
        </div>

        {/* Time */}
        <span
          style={{
            fontSize: 12,
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
            width: 32,
            height: 32,
            borderRadius: 8,
            border: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "var(--border-accent)";
            e.currentTarget.style.color = "var(--text-1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--border-default)";
            e.currentTarget.style.color = "var(--text-3)";
          }}
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </div>
  );
};

export default AudioSection;
