import { memo } from "react";

type ChatInputProps = {
  inputValue: string;
  setInputValue: (val: string) => void;
  onKeyDownMessage: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const ChatInput = memo(
  ({ inputValue, setInputValue, onKeyDownMessage }: ChatInputProps) => (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value)}
      onKeyDown={onKeyDownMessage}
      placeholder="Ask anything about your sources…"
      aria-label="Message input"
      style={{
        flex: 1,
        background: "transparent",
        border: "none",
        outline: "none",
        fontSize: 14,
        fontWeight: 400,
        color: "var(--text-1)",
        padding: "6px 4px",
        fontFamily: "inherit",
        minWidth: 0,
      }}
    />
  )
);