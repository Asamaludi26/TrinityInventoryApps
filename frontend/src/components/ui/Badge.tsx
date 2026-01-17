import React from "react";
import { cn } from "@utils/cn";
import { badgeStyles } from "@utils/designSystem";

/**
 * Badge Component - Small label element for status, tags, or categories
 * Follows design system color palette
 *
 * @example
 * <Badge variant="primary">Active</Badge>
 * <Badge variant="success">Approved</Badge>
 * <Badge variant="danger" dismissible onDismiss={() => {}} />
 */

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md" | "lg";
  rounded?: "full" | "lg" | "md";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  dismissible?: boolean;
  onDismiss?: () => void;
  dot?: boolean;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = "primary",
      size = "md",
      rounded = "full",
      icon,
      iconPosition = "left",
      dismissible = false,
      onDismiss,
      dot = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const sizeClasses = {
      sm: "px-2.5 py-1 text-xs font-medium",
      md: "px-3 py-1.5 text-sm font-medium",
      lg: "px-4 py-2 text-base font-medium",
    };

    const roundedClasses = {
      full: "rounded-full",
      lg: "rounded-lg",
      md: "rounded-md",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-2 whitespace-nowrap",
          sizeClasses[size],
          badgeStyles[variant],
          roundedClasses[rounded],
          "transition-colors duration-200",
          className,
        )}
        {...props}
      >
        {/* Dot indicator */}
        {dot && (
          <span
            className="w-2 h-2 rounded-full bg-current"
            aria-hidden="true"
          />
        )}

        {/* Left Icon */}
        {icon && iconPosition === "left" && (
          <span className="flex">{icon}</span>
        )}

        {/* Content */}
        <span>{children}</span>

        {/* Right Icon */}
        {icon && iconPosition === "right" && (
          <span className="flex">{icon}</span>
        )}

        {/* Dismiss Button */}
        {dismissible && onDismiss && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss();
            }}
            className="ml-1 hover:opacity-75 transition-opacity focus:outline-none"
            aria-label="Remove badge"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </span>
    );
  },
);

Badge.displayName = "Badge";

export default Badge;
