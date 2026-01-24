/**
 * Click Outside Hook
 *
 * Detect clicks outside of a referenced element.
 * Useful for closing dropdowns, modals, popovers, etc.
 *
 * @example
 * const dropdownRef = useRef<HTMLDivElement>(null);
 *
 * useOnClickOutside(dropdownRef, () => {
 *   setIsOpen(false);
 * });
 *
 * return <div ref={dropdownRef}>Dropdown content</div>;
 */

import { useEffect, RefObject } from "react";

type EventType = MouseEvent | TouchEvent;

export function useOnClickOutside<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: EventType) => void,
  mouseEvent: "mousedown" | "mouseup" = "mousedown"
): void {
  useEffect(() => {
    const listener = (event: EventType) => {
      const el = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    // Add event listeners
    document.addEventListener(mouseEvent, listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener(mouseEvent, listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler, mouseEvent]);
}

export default useOnClickOutside;
