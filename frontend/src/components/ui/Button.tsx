import React from "react";
import { cn } from "@utils/cn";

/**
 * Button Component - Primary interactive element following design system
 * Supports multiple variants, sizes, and states
 *
 * @example
 * <Button variant="primary" size="md">Save</Button>
 * <Button variant="secondary" disabled>Disabled</Button>
 * <Button variant="destructive" size="sm">Delete</Button>
 */

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      className,
      isLoading = false,
      disabled = false,
      fullWidth = false,
      icon,
      iconPosition = "left",
      children,
      ...props
    },
    ref,
  ) => {
    // Base styles - all buttons share these
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

    // Size variants
    const sizeStyles = {
      xs: "px-3 py-1.5 text-xs",
      sm: "px-3.5 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-5 py-3 text-base",
      xl: "px-6 py-3.5 text-base",
    };

    // Color variants following design system
    const variantStyles = {
      // Primary - Main action button
      primary:
        "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-primary-500 dark:bg-primary-500 dark:hover:bg-primary-600",

      // Secondary - Alternative action
      secondary:
        "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 focus:ring-gray-500 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600",

      // Outline - Minimal action
      outline:
        "bg-transparent text-primary-600 border-2 border-primary-600 hover:bg-primary-50 active:bg-primary-100 focus:ring-primary-500 dark:text-primary-400 dark:border-primary-400 dark:hover:bg-primary-950",

      // Destructive - Dangerous action (delete, remove)
      destructive:
        "bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-800 focus:ring-danger-500 dark:bg-danger-500 dark:hover:bg-danger-600",

      // Ghost - Low emphasis
      ghost:
        "bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 focus:ring-gray-500 dark:text-gray-300 dark:hover:bg-gray-800",
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          baseStyles,
          sizeStyles[size],
          variantStyles[variant],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className={cn(
              "animate-spin",
              icon && iconPosition === "left" && "mr-2",
              icon && iconPosition === "right" && "ml-2",
            )}
            width="1em"
            height="1em"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6m0 0l-3-3m3 3l3-3" strokeLinecap="round" />
          </svg>
        )}

        {/* Left icon */}
        {icon && iconPosition === "left" && !isLoading && (
          <span className="mr-2 flex">{icon}</span>
        )}

        {/* Text */}
        <span>{children}</span>

        {/* Right icon */}
        {icon && iconPosition === "right" && !isLoading && (
          <span className="ml-2 flex">{icon}</span>
        )}
      </button>
    );
  },
);

Button.displayName = "Button";

export default Button;
