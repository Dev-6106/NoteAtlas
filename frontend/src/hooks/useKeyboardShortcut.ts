import { useEffect } from "react";

/**
 * Register a global keyboard shortcut.
 * Automatically prevents default and handles modifier keys.
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { ctrl = false, shift = false, alt = false, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Don't trigger in input/textarea fields unless Escape
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable;

      if (isInput && key !== "Escape") return;

      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesCtrl = ctrl ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey;
      const matchesShift = shift ? e.shiftKey : !e.shiftKey;
      const matchesAlt = alt ? e.altKey : !e.altKey;

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [key, callback, ctrl, shift, alt, enabled]);
}
