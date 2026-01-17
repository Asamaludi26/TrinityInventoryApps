import { cn } from "./cn";

/**
 * Design utilities for consistent styling across the application
 * Following the Design System defined in Docs/03_STANDARDS_AND_PROCEDURES/DESIGN_SYSTEM.md
 */

/**
 * Typography scale - consistent text sizing across application
 */
export const textStyles = {
  h1: "text-4xl font-bold leading-tight text-gray-900",
  h2: "text-3xl font-bold leading-snug text-gray-900",
  h3: "text-2xl font-semibold leading-snug text-gray-900",
  h4: "text-xl font-semibold leading-normal text-gray-900",
  h5: "text-lg font-semibold leading-normal text-gray-900",
  h6: "text-base font-semibold leading-normal text-gray-900",

  // Body text
  body: "text-sm leading-normal text-gray-700",
  bodyLarge: "text-base leading-relaxed text-gray-700",
  bodySmall: "text-xs leading-normal text-gray-600",

  // Special cases
  caption: "text-xs font-medium text-gray-500 uppercase tracking-wide",
  label: "text-sm font-medium text-gray-700",
  code: "text-xs font-mono text-gray-900 bg-gray-100 rounded px-2 py-1",
};

/**
 * Spacing utilities for consistent layout
 * Maps to Tailwind spacing scale
 */
export const spacing = {
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
  xl: "p-8",
  "2xl": "p-12",
};

/**
 * Card/Container base styles
 */
export const cardStyles = {
  base: "bg-white rounded-lg border border-gray-200 shadow-sm dark:bg-gray-800 dark:border-gray-700",
  interactive:
    "hover:shadow-md hover:border-gray-300 transition-all duration-200",
  elevated: "shadow-card bg-white rounded-lg dark:bg-gray-800",
  outlined: "border-2 border-gray-200 rounded-lg dark:border-gray-700",
};

/**
 * Input base styles
 */
export const inputStyles = {
  base: "w-full px-4 py-2.5 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 transition-colors duration-200",
  focus:
    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
  disabled:
    "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed disabled:border-gray-200",
  error: "border-danger-500 focus:ring-danger-500",
  success: "border-success-500 focus:ring-success-500",
};

/**
 * Badge styles
 */
export const badgeStyles = {
  primary:
    "bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200",
  success:
    "bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200",
  warning:
    "bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-200",
  danger:
    "bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-200",
  info: "bg-info-100 text-info-800 dark:bg-info-900 dark:text-info-200",
  neutral: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200",
};

/**
 * Status color mappings
 */
export const statusColorMap = {
  success: "text-success-600 bg-success-50",
  warning: "text-warning-600 bg-warning-50",
  danger: "text-danger-600 bg-danger-50",
  info: "text-info-600 bg-info-50",
  neutral: "text-gray-600 bg-gray-50",
};

/**
 * Create responsive grid classes
 */
export function gridColumns(cols: {
  mobile?: number;
  tablet?: number;
  desktop?: number;
}) {
  const { mobile = 1, tablet = 2, desktop = 3 } = cols;
  return cn(
    `grid grid-cols-${mobile}`,
    `md:grid-cols-${tablet}`,
    `lg:grid-cols-${desktop}`,
    "gap-4",
  );
}

/**
 * Create flex utilities
 */
export const flexStyles = {
  center: "flex items-center justify-center",
  between: "flex items-center justify-between",
  start: "flex items-start justify-start",
  column: "flex flex-col",
  columnCenter: "flex flex-col items-center justify-center",
};

/**
 * Transition utilities
 */
export const transitions = {
  fast: "transition duration-150 ease-in-out",
  normal: "transition duration-200 ease-in-out",
  slow: "transition duration-300 ease-in-out",
};

/**
 * Shadow utilities mapped to design system
 */
export const shadows = {
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  soft: "shadow-soft",
  card: "shadow-card",
  dropdown: "shadow-dropdown",
};

/**
 * Border radius utilities
 */
export const borderRadius = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};

/**
 * Accessible color utilities that maintain WCAG AA contrast
 */
export const wcagColor = {
  darkText: "text-gray-900", // On light backgrounds
  lightText: "text-white", // On dark backgrounds
  mutedText: "text-gray-600", // Secondary text
  placeholderText: "text-gray-400", // Placeholder text
};

/**
 * Helper to create text with proper contrast
 */
export function createContrastText(
  bgColor: "light" | "dark" | "primary" = "light",
) {
  const maps = {
    light: wcagColor.darkText,
    dark: wcagColor.lightText,
    primary: "text-white", // Primary is always dark enough for white text
  };
  return maps[bgColor];
}
