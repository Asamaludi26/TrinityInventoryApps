/**
 * Hooks Barrel Export
 *
 * Central export for all custom hooks.
 *
 * @example
 * import { useZodForm, useDebounce, useMediaQuery } from "@hooks";
 */

// Form hooks
export { useZodForm, getFieldError, hasFieldError } from "./useZodForm";

// Utility hooks
export { useActionableItems } from "./useActionableItems";
export { useFileAttachment } from "./useFileAttachment";
export { useGenericFilter } from "./useGenericFilter";
export { useLongPress } from "./useLongPress";
export { useSortableData } from "./useSortableData";

// State & Storage hooks
export { useDebounce, useDebouncedCallback } from "./useDebounce";
export { useLocalStorage } from "./useLocalStorage";

// UI/UX hooks
export { useMediaQuery, useBreakpoint } from "./useMediaQuery";
export { useOnClickOutside } from "./useOnClickOutside";
export { useCopyToClipboard } from "./useCopyToClipboard";

// Query hooks (re-export)
export * from "./queries";
