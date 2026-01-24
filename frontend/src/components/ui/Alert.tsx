/**
 * Alert Component
 *
 * Display contextual feedback messages.
 * Supports multiple variants with appropriate icons.
 *
 * @example
 * <Alert variant="success" title="Berhasil!">
 *   Data telah berhasil disimpan.
 * </Alert>
 *
 * <Alert variant="error" dismissible onDismiss={() => setShow(false)}>
 *   Terjadi kesalahan saat menyimpan data.
 * </Alert>
 */

import React from "react";
import { cn } from "@utils/cn";
import {
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiInformationCircle,
  HiXMark,
} from "react-icons/hi2";

export interface AlertProps {
  variant?: "success" | "error" | "warning" | "info";
  title?: string;
  children: React.ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

const icons = {
  success: HiCheckCircle,
  error: HiXCircle,
  warning: HiExclamationTriangle,
  info: HiInformationCircle,
};

const styles = {
  success: {
    container: "bg-success-50 border-success-200 text-success-800",
    icon: "text-success-500",
    title: "text-success-800",
  },
  error: {
    container: "bg-danger-50 border-danger-200 text-danger-800",
    icon: "text-danger-500",
    title: "text-danger-800",
  },
  warning: {
    container: "bg-warning-50 border-warning-200 text-warning-800",
    icon: "text-warning-500",
    title: "text-warning-800",
  },
  info: {
    container: "bg-info-50 border-info-200 text-info-800",
    icon: "text-info-500",
    title: "text-info-800",
  },
};

export function Alert({
  variant = "info",
  title,
  children,
  dismissible = false,
  onDismiss,
  className,
  icon,
}: AlertProps) {
  const Icon = icon ? null : icons[variant];
  const variantStyles = styles[variant];

  return (
    <div
      role="alert"
      className={cn("flex gap-3 p-4 rounded-lg border", variantStyles.container, className)}
    >
      {/* Icon */}
      {icon ||
        (Icon && <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", variantStyles.icon)} />)}

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <h4 className={cn("font-semibold text-sm mb-1", variantStyles.title)}>{title}</h4>
        )}
        <div className="text-sm">{children}</div>
      </div>

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={onDismiss}
          className={cn("flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors", "-m-1")}
          aria-label="Dismiss"
        >
          <HiXMark className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

export default Alert;
