import { memo, useRef, useEffect, useCallback } from "react";

type ChatInputProps = {
  inputValue: string;
  setInputValue: (val: string) => void;
  onSend: () => void;
};

export const ChatInput = memo(({ inputValue, setInputValue, onSend }: ChatInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to content
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [inputValue, adjustHeight]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <textarea
      ref={textareaRef}
      rows={1}
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder="Ask anything about your sources..."
      className="flex-1 bg-transparent outline-none text-sm leading-relaxed placeholder:text-muted-foreground px-3 py-2.5 resize-none max-h-40 custom-scrollbar"
      aria-label="Message input"
    />
  );
});

ChatInput.displayName = "ChatInput";
