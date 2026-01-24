/**
 * Dropdown Menu Component
 *
 * Accessible dropdown menu using Headless UI.
 * Supports keyboard navigation and screen readers.
 *
 * @example
 * <Dropdown>
 *   <Dropdown.Trigger>
 *     <Button>Options</Button>
 *   </Dropdown.Trigger>
 *   <Dropdown.Menu>
 *     <Dropdown.Item onClick={handleEdit}>Edit</Dropdown.Item>
 *     <Dropdown.Item onClick={handleDelete} variant="danger">Delete</Dropdown.Item>
 *   </Dropdown.Menu>
 * </Dropdown>
 */

import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { cn } from "@utils/cn";

// ============================================================================
// Dropdown Root
// ============================================================================

interface DropdownProps {
  children: React.ReactNode;
}

function DropdownRoot({ children }: DropdownProps) {
  return (
    <Menu as="div" className="relative inline-block text-left">
      {children}
    </Menu>
  );
}

// ============================================================================
// Dropdown Trigger
// ============================================================================

interface DropdownTriggerProps {
  children: React.ReactNode;
  className?: string;
}

function DropdownTrigger({ children, className }: DropdownTriggerProps) {
  return <Menu.Button className={className}>{children}</Menu.Button>;
}

// ============================================================================
// Dropdown Menu
// ============================================================================

interface DropdownMenuProps {
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
  width?: "auto" | "sm" | "md" | "lg";
}

function DropdownMenu({ children, className, align = "right", width = "auto" }: DropdownMenuProps) {
  const widthClasses = {
    auto: "",
    sm: "w-40",
    md: "w-48",
    lg: "w-56",
  };

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={cn(
          "absolute z-50 mt-2 origin-top-right rounded-lg bg-white shadow-lg ring-1 ring-black/5 focus:outline-none",
          align === "left" ? "left-0" : "right-0",
          widthClasses[width],
          className
        )}
      >
        <div className="py-1">{children}</div>
      </Menu.Items>
    </Transition>
  );
}

// ============================================================================
// Dropdown Item
// ============================================================================

interface DropdownItemProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
  icon?: React.ReactNode;
  className?: string;
}

function DropdownItem({
  children,
  onClick,
  disabled = false,
  variant = "default",
  icon,
  className,
}: DropdownItemProps) {
  return (
    <Menu.Item disabled={disabled}>
      {({ active }) => (
        <button
          onClick={onClick}
          disabled={disabled}
          className={cn(
            "flex w-full items-center gap-2 px-4 py-2 text-sm",
            active && "bg-gray-100",
            variant === "danger" && "text-danger-600",
            variant === "default" && "text-gray-700",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {icon && <span className="w-4 h-4">{icon}</span>}
          {children}
        </button>
      )}
    </Menu.Item>
  );
}

// ============================================================================
// Dropdown Divider
// ============================================================================

function DropdownDivider() {
  return <div className="my-1 h-px bg-gray-200" />;
}

// ============================================================================
// Dropdown Label
// ============================================================================

interface DropdownLabelProps {
  children: React.ReactNode;
}

function DropdownLabel({ children }: DropdownLabelProps) {
  return (
    <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </div>
  );
}

// ============================================================================
// Compound Component Export
// ============================================================================

export const Dropdown = Object.assign(DropdownRoot, {
  Trigger: DropdownTrigger,
  Menu: DropdownMenu,
  Item: DropdownItem,
  Divider: DropdownDivider,
  Label: DropdownLabel,
});

export default Dropdown;
