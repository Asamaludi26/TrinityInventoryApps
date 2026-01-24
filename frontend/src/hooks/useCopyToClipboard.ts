/**
 * Copy to Clipboard Hook
 *
 * Provides functionality to copy text to clipboard with status feedback.
 *
 * @example
 * const { copy, copied, error } = useCopyToClipboard();
 *
 * <Button onClick={() => copy("Text to copy")}>
 *   {copied ? "Copied!" : "Copy"}
 * </Button>
 */

import { useState, useCallback } from "react";

interface UseCopyToClipboardReturn {
  /** Copy text to clipboard */
  copy: (text: string) => Promise<boolean>;
  /** Whether text was recently copied */
  copied: boolean;
  /** Error if copy failed */
  error: Error | null;
  /** Reset copied state */
  reset: () => void;
}

export function useCopyToClipboard(
  /** How long to show "copied" state (ms) */
  timeout = 2000
): UseCopyToClipboardReturn {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      // Reset state
      setCopied(false);
      setError(null);

      // Check if clipboard API is available
      if (!navigator?.clipboard) {
        // Fallback for older browsers
        try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const success = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
            return true;
          } else {
            throw new Error("execCommand copy failed");
          }
        } catch (err) {
          setError(err instanceof Error ? err : new Error("Copy failed"));
          return false;
        }
      }

      // Modern clipboard API
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Copy failed"));
        return false;
      }
    },
    [timeout]
  );

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
  }, []);

  return { copy, copied, error, reset };
}

export default useCopyToClipboard;
