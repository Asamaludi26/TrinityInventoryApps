import React from "react";
import { cn } from "@utils/cn";
import { textStyles } from "@utils/designSystem";

/**
 * Text Component - Semantic text rendering with design system integration
 * Provides consistent typography across the application
 *
 * @example
 * <Text as="h1">Main Heading</Text>
 * <Text as="p" size="body" color="muted">Subtitle</Text>
 * <Text weight="semibold">Emphasized text</Text>
 */

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "label" | "div";
  size?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "bodyLarge"
    | "bodySmall"
    | "caption"
    | "label"
    | "code";
  weight?: "normal" | "medium" | "semibold" | "bold";
  color?:
    | "default"
    | "muted"
    | "primary"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "light";
  align?: "left" | "center" | "right" | "justify";
  truncate?: boolean;
  lineClamp?: number;
}

const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = "p",
      size = "body",
      weight = "normal",
      color = "default",
      align = "left",
      truncate = false,
      lineClamp,
      className,
      ...props
    },
    ref,
  ) => {
    // Font weight mapping
    const weightStyles = {
      normal: "font-normal",
      medium: "font-medium",
      semibold: "font-semibold",
      bold: "font-bold",
    };

    // Color mapping
    const colorStyles = {
      default: "text-gray-900 dark:text-gray-100",
      muted: "text-gray-600 dark:text-gray-400",
      primary: "text-primary-600 dark:text-primary-400",
      success: "text-success-600 dark:text-success-400",
      warning: "text-warning-600 dark:text-warning-400",
      danger: "text-danger-600 dark:text-danger-400",
      info: "text-info-600 dark:text-info-400",
      light: "text-gray-500 dark:text-gray-500",
    };

    // Text alignment
    const alignStyles = {
      left: "text-left",
      center: "text-center",
      right: "text-right",
      justify: "text-justify",
    };

    // Build className
    const finalClassName = cn(
      textStyles[size],
      weightStyles[weight],
      colorStyles[color],
      alignStyles[align],
      truncate && "truncate",
      lineClamp && `line-clamp-${lineClamp}`,
      className,
    );

    return React.createElement(Component, {
      ref,
      className: finalClassName,
      ...props,
    });
  },
);

Text.displayName = "Text";

export default Text;
