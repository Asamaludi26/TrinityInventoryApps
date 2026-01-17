/**
 * Component Library Barrel Exports
 * Central export point for all UI components
 * Ensures consistent API and easy imports across the application
 */

// ===== NEW DESIGN SYSTEM COMPONENTS =====
// Layout components
export { default as Card } from "./Card";

// Form components
export { default as Button } from "./Button";
export type { ButtonProps } from "./Button";
export { default as Input } from "./Input";
export type { InputProps } from "./Input";
export { default as Text } from "./Text";
export type { TextProps } from "./Text";

// Feedback components
export { default as Badge } from "./Badge";
export type { BadgeProps } from "./Badge";

// ===== EXISTING COMPONENTS (using named exports) =====
export { default as Modal } from "./Modal";
export { Checkbox } from "./Checkbox";
export { ConfirmDialog } from "./ConfirmDialog";
export { CustomSelect } from "./CustomSelect";
export { CreatableSelect } from "./CreatableSelect";
export { default as DatePicker } from "./DatePicker";
export { StatusBadge } from "./StatusBadge";
export { ActionButton } from "./ActionButton";
export { Tooltip } from "./Tooltip";
export { PaginationControls } from "./PaginationControls";
export { PageSkeleton } from "./PageSkeleton";
export { Skeleton } from "./Skeleton";
export { ContentSkeleton } from "./ContentSkeleton";
export { FullPageLoader } from "./FullPageLoader";
export { TopLoadingBar } from "./TopLoadingBar";
export { ErrorBoundary } from "./ErrorBoundary";
export { GlobalScannerModal } from "./GlobalScannerModal";
export { Letterhead } from "./Letterhead";
export { ApprovalStamp } from "./ApprovalStamp";
export { RejectionStamp } from "./RejectionStamp";
export { SignatureStamp } from "./SignatureStamp";
export { AssetLabel } from "./AssetLabel";
export { Avatar } from "./Avatar";
export { default as FloatingActionBar } from "./FloatingActionBar";
export { NotificationBell } from "./NotificationBell";
export { CommandPalette } from "./CommandPalette";
export { WhatsAppSimulationModal } from "./WhatsAppSimulationModal";
export { InstallToCustomerModal } from "./InstallToCustomerModal";
export { MaterialAllocationModal } from "./MaterialAllocationModal";
export { ModelManagementModal } from "./ModelManagementModal";
export { TypeManagementModal } from "./TypeManagementModal";
export { ClickableLink } from "./ClickableLink";

// This index file makes it easy to manage exports
// Usage: import { Button, Input, Card } from '@components/ui'
