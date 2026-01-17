import React from "react";
import { SpinnerIcon } from "../icons/SpinnerIcon";
import { cn } from "../../utils/cn";

interface ActionButtonProps {
  onClick?: () => void;
  text: string;
  icon?: React.FC<{ className?: string }>;
  color: "primary" | "success" | "danger" | "info" | "secondary" | "special";
  disabled?: boolean;
  title?: string;
  className?: string;
}

/**
 * ActionButton - Quick action button with icon and color variants
 * Updated to use design system color tokens (primary-600, success-600, etc.)
 */
export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  text,
  icon: Icon,
  color,
  disabled,
  title,
  className = "",
}) => {
  // Using design system color tokens from tailwind.config.js
  const colors = {
    primary:
      "bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white focus:ring-primary-500",
    success:
      "bg-success-600 hover:bg-success-700 active:bg-success-800 text-white focus:ring-success-500",
    danger:
      "bg-danger-600 hover:bg-danger-700 active:bg-danger-800 text-white focus:ring-danger-500",
    info: "bg-info-600 hover:bg-info-700 active:bg-info-800 text-white focus:ring-info-500",
    secondary:
      "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800 border border-gray-300 focus:ring-gray-500",
    special:
      "bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white focus:ring-purple-500",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={cn(
        "w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg shadow-sm",
        "transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2",
        "disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:opacity-60",
        colors[color],
        className,
      )}
    >
      {disabled && <SpinnerIcon className="w-4 h-4 animate-spin" />}
      {Icon && !disabled && <Icon className="w-4 h-4" />}
      {text}
    </button>
  );
};
