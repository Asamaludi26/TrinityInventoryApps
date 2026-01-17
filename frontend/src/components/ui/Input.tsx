import React from "react";
import { cn } from "@utils/cn";
import { inputStyles } from "@utils/designSystem";

/**
 * Input Component - Unified input field following design system
 * Supports various states (error, success, disabled) and variants
 *
 * @example
 * <Input type="text" placeholder="Enter text" />
 * <Input error="This field is required" />
 * <Input success icon={<CheckIcon />} />
 */

export interface InputProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type" | "size"
> {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "date"
    | "time"
    | "datetime-local";
  label?: string;
  error?: string;
  success?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  hint?: string;
  helperText?: string;
  required?: boolean;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "filled" | "flushed";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      label,
      error,
      success,
      icon,
      iconPosition = "left",
      hint,
      helperText,
      required = false,
      size = "md",
      variant = "default",
      className,
      disabled,
      ...props
    },
    ref,
  ) => {
    const sizeStyles = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-4 py-3 text-base",
    };

    const variantStyles = {
      default: `bg-white border border-gray-300 hover:border-gray-400 ${error ? "border-danger-500" : success ? "border-success-500" : ""}`,
      filled: "bg-gray-50 border-b-2 border-gray-300 hover:bg-gray-100",
      flushed: "bg-transparent border-b-2 border-gray-300 px-0",
    };

    const inputClassName = cn(
      inputStyles.base,
      inputStyles.focus,
      inputStyles.disabled,
      sizeStyles[size],
      variantStyles[variant],
      error && inputStyles.error,
      success && inputStyles.success,
      icon && iconPosition === "left" && "pl-10",
      icon && iconPosition === "right" && "pr-10",
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {required && <span className="text-danger-600 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {/* Left Icon */}
          {icon && iconPosition === "left" && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}

          {/* Input Element */}
          <input
            ref={ref}
            type={type}
            disabled={disabled}
            className={inputClassName}
            {...props}
          />

          {/* Right Icon (Error or Success indicator) */}
          {iconPosition === "right" && icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none flex items-center">
              {icon}
            </div>
          )}

          {/* Error Indicator Icon */}
          {error && !icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-danger-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18.21 5.79A1 1 0 0016 5h-1V4a1 1 0 10-2 0v1h-2V4a1 1 0 10-2 0v1H9V4a1 1 0 10-2 0v1H5V4a1 1 0 10-2 0v1H2a1 1 0 100 2h16a1 1 0 100-2zM2 8h16v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Success Indicator Icon */}
          {success && !error && !icon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-success-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <p className="mt-1 text-sm text-danger-600 dark:text-danger-400">
            {error}
          </p>
        )}

        {/* Hint or Helper Text */}
        {(hint || helperText) && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {hint || helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
