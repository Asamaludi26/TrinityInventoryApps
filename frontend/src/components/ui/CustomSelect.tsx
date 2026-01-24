import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { ChevronDownIcon } from "../icons/ChevronDownIcon";
import { CheckIcon } from "../icons/CheckIcon";
import { InboxIcon } from "../icons/InboxIcon";
import { PlusIcon } from "../icons/PlusIcon";
import { SearchIcon } from "../icons/SearchIcon";

interface Option {
  value: string;
  label: string;
  indicator?: React.ReactNode;
  disabled?: boolean;
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  emptyStateMessage?: string;
  emptyStateButtonLabel?: string;
  onEmptyStateClick?: () => void;
  direction?: "up" | "down";
  isSearchable?: boolean;
  // New props for sticky footer action
  actionLabel?: string;
  onActionClick?: () => void;
  // Accessibility
  id?: string;
  "aria-label"?: string;
}

/**
 * CustomSelect - Dropdown select dengan fitur search dan keyboard navigation.
 * Mendukung aksesibilitas penuh dengan ARIA attributes.
 */
export const CustomSelect: React.FC<CustomSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  disabled = false,
  emptyStateMessage = "Tidak ada pilihan tersedia.",
  emptyStateButtonLabel,
  onEmptyStateClick,
  direction = "down",
  isSearchable = false,
  actionLabel,
  onActionClick,
  id,
  "aria-label": ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = useMemo(() => {
    if (!isSearchable || !searchQuery) {
      return options.filter((opt) => !opt.disabled);
    }
    return options.filter(
      (option) => !option.disabled && option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [options, isSearchable, searchQuery]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset state when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setHighlightedIndex(-1);
      if (isSearchable && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 50);
      }
    }
  }, [isOpen, isSearchable]);

  // Scroll highlighted option into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const highlightedEl = listRef.current.children[highlightedIndex] as HTMLElement;
      if (highlightedEl) {
        highlightedEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case "Escape":
          event.preventDefault();
          setIsOpen(false);
          break;
        case "ArrowDown":
          event.preventDefault();
          if (!isOpen) {
            setIsOpen(true);
          } else {
            setHighlightedIndex((prev) => (prev < filteredOptions.length - 1 ? prev + 1 : prev));
          }
          break;
        case "ArrowUp":
          event.preventDefault();
          if (isOpen) {
            setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          }
          break;
        case "Home":
          if (isOpen) {
            event.preventDefault();
            setHighlightedIndex(0);
          }
          break;
        case "End":
          if (isOpen) {
            event.preventDefault();
            setHighlightedIndex(filteredOptions.length - 1);
          }
          break;
        case "Tab":
          if (isOpen) {
            setIsOpen(false);
          }
          break;
      }
    },
    [disabled, isOpen, highlightedIndex, filteredOptions, handleSelect]
  );

  const directionClasses =
    direction === "down" ? "mt-1 origin-top" : "mb-1 bottom-full origin-bottom";

  return (
    <div className="relative w-full" ref={wrapperRef} onKeyDown={handleKeyDown}>
      <button
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`flex items-center justify-between w-full px-3 py-2 text-left bg-gray-50 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-600 dark:focus:ring-primary-400 dark:focus:ring-offset-slate-900 ${disabled ? "bg-gray-200/60 text-gray-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500" : "text-gray-900 cursor-pointer dark:text-white"}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel || placeholder}
        aria-activedescendant={
          highlightedIndex >= 0 ? `option-${filteredOptions[highlightedIndex]?.value}` : undefined
        }
      >
        <div className="flex items-center gap-2 truncate">
          {selectedOption?.indicator}
          <span
            className={`truncate ${selectedOption ? "font-medium text-gray-900 dark:text-white" : "text-gray-500 dark:text-slate-400"}`}
            title={selectedOption ? selectedOption.label : placeholder}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 dark:text-slate-500 transform transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : "rotate-0"}`}
        />
      </button>

      <div
        className={`absolute z-20 w-full overflow-hidden bg-white border border-gray-200 rounded-md shadow-lg flex flex-col dark:bg-slate-800 dark:border-slate-700
                    ${directionClasses}
                    ${isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        style={{
          transition: "opacity 150ms ease-in-out, transform 150ms ease-in-out",
        }}
        role="listbox"
        aria-label={ariaLabel || "Options"}
      >
        {isSearchable && (
          <div className="p-2 border-b border-gray-200 dark:border-slate-700">
            <div className="relative">
              <SearchIcon className="absolute w-4 h-4 text-gray-400 dark:text-slate-500 transform -translate-y-1/2 top-1/2 left-3" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Cari..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(-1);
                }}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="w-full h-9 py-2 pl-9 pr-4 text-sm bg-gray-100 text-gray-600 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-600 dark:focus:ring-primary-400 dark:focus:border-primary-400 dark:placeholder-slate-400"
                aria-label="Search options"
              />
            </div>
          </div>
        )}

        <div className="overflow-y-auto max-h-56 custom-scrollbar">
          {filteredOptions.length > 0 ? (
            <ul ref={listRef} role="listbox">
              {filteredOptions.map((option, index) => (
                <li
                  key={option.value}
                  id={`option-${option.value}`}
                  onClick={() => handleSelect(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 text-sm cursor-pointer transition-colors duration-150
                                        ${
                                          value === option.value
                                            ? "bg-primary-50 text-primary-600 font-semibold"
                                            : highlightedIndex === index
                                              ? "bg-gray-100 text-gray-900"
                                              : "text-gray-900 hover:bg-gray-50"
                                        }`}
                  role="option"
                  aria-selected={value === option.value}
                  title={option.label}
                >
                  <div className="flex items-center gap-2">
                    {option.indicator}
                    <span className="truncate">{option.label}</span>
                  </div>
                  {value === option.value && <CheckIcon className="w-4 h-4" />}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-sm text-gray-500">
              <InboxIcon className="w-8 h-8 mx-auto text-gray-400" />
              <p className="mt-2">
                {searchQuery ? `Tidak ada hasil untuk "${searchQuery}".` : emptyStateMessage}
              </p>
              {onEmptyStateClick && emptyStateButtonLabel && !searchQuery && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(false);
                    onEmptyStateClick();
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 mt-3 text-xs font-semibold text-white transition-colors rounded-md shadow-sm bg-primary-500 hover:bg-primary-600"
                >
                  <PlusIcon className="w-3.5 h-3.5" />
                  {emptyStateButtonLabel}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sticky Action Button in Dropdown Footer */}
        {actionLabel && onActionClick && (
          <div className="p-2 border-t border-gray-100 bg-gray-50 dark:border-slate-700 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
                onActionClick();
              }}
              className="flex items-center justify-center w-full gap-2 px-3 py-2 text-xs font-semibold text-primary-600 bg-white border border-gray-200 rounded-md hover:bg-primary-50 hover:border-primary-200 transition-colors shadow-sm dark:text-primary-400 dark:bg-slate-800 dark:border-slate-600 dark:hover:bg-primary-500/10 dark:hover:border-primary-500/30"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
