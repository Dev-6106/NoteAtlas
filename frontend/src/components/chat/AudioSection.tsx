import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music2, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { closeAudioCard } from "@/store/rightPanelSlice";
import { truncateTitle } from "@/util/truncateTitle";

interface AudioSectionProps {
  audioUrl: string;
  title?: string;
}

export default function AudioSection({ audioUrl, title }: AudioSectionProps) {
  const dispatch = useAppDispatch();
  const { audioCard } = useAppSelector((state) => state.rightPanel);

  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().then(() => setIsPlaying(true)).catch(console.warn);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;
    setProgress(0);
    setDuration(0);
    setIsPlaying(false);
    audio.load();

    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration || 0);
    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.volume = volume;

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl, title, volume]);

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = value[0];
    audio.currentTime = newTime;
    setProgress(newTime);
  };

  const toggleMute = () => {
    const newVol = volume > 0 ? 0 : 0.8;
    setVolume(newVol);
    if (audioRef.current) audioRef.current.volume = newVol;
  };

  if (!audioCard?.show) return null;

  return (
    <div className="surface p-4 rounded-xl shadow-lg border border-emerald-500/20 bg-emerald-500/5 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Music2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-foreground text-sm truncate">
              {truncateTitle(title, 30) || "Generated Audio Briefing"}
            </span>
            <span className="text-xs text-muted-foreground">Audio Overview</span>
          </div>
        </div>
        <button
          onClick={() => dispatch(closeAudioCard())}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <audio ref={audioRef} src={audioUrl} preload="auto" />

      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shrink-0 shadow-sm"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 pl-1" />}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <Slider
            value={[progress]}
            max={duration || 1}
            step={0.1}
            onValueChange={handleSeek}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <button 
          onClick={toggleMute}
          className="p-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors shrink-0"
        >
          {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function formatTime(time: number) {
  if (isNaN(time) || !isFinite(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
