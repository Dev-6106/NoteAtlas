import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface SuggestedInputProps {
  questions: string[];
  selectQuestion: (question: string) => void;
}

export function SuggestedInput({ questions, selectQuestion }: SuggestedInputProps) {
  const chipsRef = useRef<HTMLDivElement | null>(null);
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;

    const check = () => {
      setShowArrows(el.scrollWidth > el.clientWidth + 4);
    };

    check();
    window.addEventListener("resize", check);

    const mo = new MutationObserver(check);
    mo.observe(el, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", check);
      mo.disconnect();
    };
  }, []);

  const scroll = (dir: 1 | -1) => {
    chipsRef.current?.scrollBy({
      left: dir * Math.max(200, chipsRef.current.clientWidth * 0.6),
      behavior: "smooth",
    });
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="relative">
      {showArrows && (
        <button
          onClick={() => scroll(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-secondary border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Scroll suggestions left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      <div
        ref={chipsRef}
        className="flex gap-2 overflow-x-auto scrollbar-none px-2"
      >
        {questions.map((q, i) => (
          <button
            key={i}
            onClick={() => selectQuestion(q)}
            className="whitespace-nowrap shrink-0 rounded-full bg-secondary border border-border/60 px-3.5 py-1.5 text-sm text-secondary-foreground hover:bg-muted hover:text-foreground hover:border-muted-foreground/30 transition-all active:scale-[0.97]"
          >
            {q}
          </button>
        ))}
      </div>

      {showArrows && (
        <button
          onClick={() => scroll(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-secondary border border-border shadow-sm flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          aria-label="Scroll suggestions right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
