/**
 * Tabs Component
 *
 * Accessible tab navigation using Headless UI.
 * Supports both horizontal and vertical orientations.
 *
 * @example
 * <Tabs defaultIndex={0}>
 *   <Tabs.List>
 *     <Tabs.Tab>Overview</Tabs.Tab>
 *     <Tabs.Tab>Details</Tabs.Tab>
 *     <Tabs.Tab>Settings</Tabs.Tab>
 *   </Tabs.List>
 *   <Tabs.Panels>
 *     <Tabs.Panel>Overview content</Tabs.Panel>
 *     <Tabs.Panel>Details content</Tabs.Panel>
 *     <Tabs.Panel>Settings content</Tabs.Panel>
 *   </Tabs.Panels>
 * </Tabs>
 */

import React, { Fragment } from "react";
import { Tab } from "@headlessui/react";
import { cn } from "@utils/cn";

// ============================================================================
// Tabs Root
// ============================================================================

interface TabsProps {
  children: React.ReactNode;
  defaultIndex?: number;
  selectedIndex?: number;
  onChange?: (index: number) => void;
  vertical?: boolean;
  className?: string;
}

function TabsRoot({
  children,
  defaultIndex = 0,
  selectedIndex,
  onChange,
  vertical = false,
  className,
}: TabsProps) {
  return (
    <Tab.Group
      defaultIndex={defaultIndex}
      selectedIndex={selectedIndex}
      onChange={onChange}
      vertical={vertical}
    >
      <div className={cn(vertical && "flex gap-4", className)}>{children}</div>
    </Tab.Group>
  );
}

// ============================================================================
// Tabs List
// ============================================================================

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "pills" | "underline";
}

function TabsList({ children, className, variant = "default" }: TabsListProps) {
  const variantStyles = {
    default: "flex gap-1 bg-gray-100 p-1 rounded-lg",
    pills: "flex gap-2",
    underline: "flex gap-4 border-b border-gray-200",
  };

  return <Tab.List className={cn(variantStyles[variant], className)}>{children}</Tab.List>;
}

// ============================================================================
// Tab Button
// ============================================================================

interface TabButtonProps {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

function TabButton({ children, className, disabled = false }: TabButtonProps) {
  return (
    <Tab as={Fragment}>
      {({ selected }) => (
        <button
          disabled={disabled}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-md transition-all",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
            selected
              ? "bg-white text-primary-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900 hover:bg-white/50",
            disabled && "opacity-50 cursor-not-allowed",
            className
          )}
        >
          {children}
        </button>
      )}
    </Tab>
  );
}

// ============================================================================
// Tabs Panels Container
// ============================================================================

interface TabsPanelsProps {
  children: React.ReactNode;
  className?: string;
}

function TabsPanels({ children, className }: TabsPanelsProps) {
  return <Tab.Panels className={cn("mt-4", className)}>{children}</Tab.Panels>;
}

// ============================================================================
// Tab Panel
// ============================================================================

interface TabPanelProps {
  children: React.ReactNode;
  className?: string;
}

function TabPanel({ children, className }: TabPanelProps) {
  return (
    <Tab.Panel
      className={cn(
        "rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500",
        className
      )}
    >
      {children}
    </Tab.Panel>
  );
}

// ============================================================================
// Compound Component Export
// ============================================================================

export const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabButton,
  Panels: TabsPanels,
  Panel: TabPanel,
});

export default Tabs;
