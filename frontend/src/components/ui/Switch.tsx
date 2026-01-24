/**
 * Switch/Toggle Component
 *
 * Accessible toggle switch using Headless UI.
 *
 * @example
 * const [enabled, setEnabled] = useState(false);
 *
 * <Switch
 *   checked={enabled}
 *   onChange={setEnabled}
 *   label="Enable notifications"
 * />
 */

import React from "react";
import { Switch as HeadlessSwitch } from "@headlessui/react";
import { cn } from "@utils/cn";

export interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeStyles = {
  sm: {
    switch: "h-5 w-9",
    dot: "h-3 w-3",
    translate: "translate-x-4",
  },
  md: {
    switch: "h-6 w-11",
    dot: "h-4 w-4",
    translate: "translate-x-5",
  },
  lg: {
    switch: "h-7 w-14",
    dot: "h-5 w-5",
    translate: "translate-x-7",
  },
};

export function Switch({
  checked,
  onChange,
  label,
  description,
  disabled = false,
  size = "md",
  className,
}: SwitchProps) {
  const sizes = sizeStyles[size];

  return (
    <HeadlessSwitch.Group>
      <div className={cn("flex items-center gap-3", className)}>
        <HeadlessSwitch
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent",
            "transition-colors duration-200 ease-in-out",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2",
            checked ? "bg-primary-600" : "bg-gray-200",
            disabled && "opacity-50 cursor-not-allowed",
            sizes.switch
          )}
        >
          <span
            aria-hidden="true"
            className={cn(
              "pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0",
              "transition duration-200 ease-in-out",
              checked ? sizes.translate : "translate-x-1",
              sizes.dot
            )}
          />
        </HeadlessSwitch>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <HeadlessSwitch.Label
                className={cn("text-sm font-medium text-gray-900", disabled && "opacity-50")}
              >
                {label}
              </HeadlessSwitch.Label>
            )}
            {description && (
              <HeadlessSwitch.Description
                className={cn("text-sm text-gray-500", disabled && "opacity-50")}
              >
                {description}
              </HeadlessSwitch.Description>
            )}
          </div>
        )}
      </div>
    </HeadlessSwitch.Group>
  );
}

export default Switch;
