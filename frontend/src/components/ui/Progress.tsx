/**
 * Progress Bar Component
 *
 * Visual indicator of progress or loading state.
 *
 * @example
 * <Progress value={75} />
 * <Progress value={50} variant="success" showLabel />
 * <Progress indeterminate />
 */

import React from "react";
import { cn } from "@utils/cn";

export interface ProgressProps {
  /** Current value (0-100) */
  value?: number;
  /** Maximum value */
  max?: number;
  /** Visual variant */
  variant?: "primary" | "success" | "warning" | "danger";
  /** Size of the progress bar */
  size?: "sm" | "md" | "lg";
  /** Show percentage label */
  showLabel?: boolean;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Accessible label */
  "aria-label"?: string;
}

const variantStyles = {
  primary: "bg-primary-500",
  success: "bg-success-500",
  warning: "bg-warning-500",
  danger: "bg-danger-500",
};

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
};

export function Progress({
  value = 0,
  max = 100,
  variant = "primary",
  size = "md",
  showLabel = false,
  indeterminate = false,
  className,
  "aria-label": ariaLabel,
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("w-full", className)}>
      <div
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={ariaLabel}
        className={cn("w-full bg-gray-200 rounded-full overflow-hidden", sizeStyles[size])}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300 ease-out",
            variantStyles[variant],
            indeterminate && "animate-indeterminate"
          )}
          style={{
            width: indeterminate ? "30%" : `${percentage}%`,
          }}
        />
      </div>
      {showLabel && !indeterminate && (
        <div className="mt-1 text-xs text-gray-600 text-right">{Math.round(percentage)}%</div>
      )}

      {/* Add CSS for indeterminate animation */}
      <style>{`
        @keyframes indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(400%);
          }
        }
        .animate-indeterminate {
          animation: indeterminate 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Progress;
