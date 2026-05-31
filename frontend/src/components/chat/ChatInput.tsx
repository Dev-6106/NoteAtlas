import { memo } from "react";

type ChatInputProps = {
    inputValue: string;
    setInputValue: (val: string) => void;
    onKeyDownMessage: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export const ChatInput = memo(({ inputValue, setInputValue, onKeyDownMessage }: ChatInputProps) => (
    <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={onKeyDownMessage}
        placeholder="Start typing..."
        style={{
            flex: 1,
            background: "transparent",
            outline: "none",
            border: "none",
            fontSize: 14,
            color: "#e2e8f0",
            padding: "8px",
            fontFamily: "'DM Sans', system-ui, sans-serif",
        }}
        aria-label="Message input"
    />
));
