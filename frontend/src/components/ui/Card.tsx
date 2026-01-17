import React from "react";
import { cn } from "@utils/cn";
import { cardStyles } from "@utils/designSystem";

/**
 * Card Component - Container element for organizing content
 * Provides consistent layout and styling across the application
 *
 * @example
 * <Card>
 *   <Card.Header title="Card Title" />
 *   <Card.Body>Content here</Card.Body>
 *   <Card.Footer>Footer content</Card.Footer>
 * </Card>
 */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "filled";
  interactive?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
  clickable?: boolean;
}

interface CardComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  action?: React.ReactNode;
  divider?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = "default",
      interactive = false,
      padding = "md",
      clickable = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const variantClasses = {
      default: cardStyles.base,
      elevated: cardStyles.elevated,
      outlined: cardStyles.outlined,
      filled: "bg-gray-50 rounded-lg dark:bg-gray-800",
    };

    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-4",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={cn(
          variantClasses[variant],
          paddingClasses[padding],
          interactive && cardStyles.interactive,
          clickable && "cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = "Card";

/**
 * Card Header - Top section of card with title and optional action
 */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  CardComponentProps & { title?: React.ReactNode }
>(({ title, action, divider = true, className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between",
      divider && "pb-4 border-b border-gray-200 dark:border-gray-700",
      className,
    )}
    {...props}
  >
    {title && (
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
    )}
    {action && <div className="flex items-center gap-2">{action}</div>}
  </div>
));

CardHeader.displayName = "CardHeader";

/**
 * Card Body - Main content area of card
 */
const CardBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("py-4", className)} {...props} />
));

CardBody.displayName = "CardBody";

/**
 * Card Footer - Bottom section of card
 */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "pt-4 border-t border-gray-200 dark:border-gray-700",
      className,
    )}
    {...props}
  />
));

CardFooter.displayName = "CardFooter";

// Compound component pattern with proper typing
type CardComponent = typeof Card & {
  Header: typeof CardHeader;
  Body: typeof CardBody;
  Footer: typeof CardFooter;
};

const CardWithSubComponents = Card as CardComponent;
CardWithSubComponents.Header = CardHeader;
CardWithSubComponents.Body = CardBody;
CardWithSubComponents.Footer = CardFooter;

export default CardWithSubComponents;
