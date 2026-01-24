import React, { useRef, useState, useEffect, useMemo } from "react";
import { SearchIcon } from "../../../components/icons/SearchIcon";
import { FilterIcon } from "../../../components/icons/FilterIcon";
import { CloseIcon } from "../../../components/icons/CloseIcon";
import { CustomSelect } from "../../../components/ui/CustomSelect";
import { ItemStatus } from "../../../types";

interface HandoverFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  filters: { status: string };
  onFilterChange: (filters: { status: string }) => void;
}

export const HandoverFilterBar: React.FC<HandoverFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  filters,
  onFilterChange,
}) => {
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const statusOptions = Object.values(ItemStatus)
    .filter((s) =>
      [
        ItemStatus.COMPLETED,
        ItemStatus.IN_PROGRESS,
        ItemStatus.PENDING,
      ].includes(s),
    )
    .map((s) => ({ value: s, label: s }));

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        filterPanelRef.current &&
        !filterPanelRef.current.contains(event.target as Node)
      ) {
        setIsFilterPanelOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const hasActiveFilters = !!filters.status;

  return (
    <div className="p-4 mb-4 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl shadow-md dark:shadow-lg dark:shadow-black/20">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon className="w-5 h-5 text-gray-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Cari No. Dokumen, Pihak, Barang..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-slate-100 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 dark:placeholder-slate-400"
          />
        </div>

        {/* Filter Button & Panel */}
        <div className="relative" ref={filterPanelRef}>
          <button
            onClick={() => setIsFilterPanelOpen((p) => !p)}
            className={`inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-semibold transition-all duration-200 border rounded-lg shadow-sm sm:w-auto 
                            ${hasActiveFilters ? "bg-gray-50 dark:bg-slate-700 border-primary-500 text-primary-600 dark:text-primary-400" : "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600"}
                        `}
          >
            <FilterIcon className="w-4 h-4" /> <span>Filter</span>
          </button>
          {isFilterPanelOpen && (
            <>
              <div
                onClick={() => setIsFilterPanelOpen(false)}
                className="fixed inset-0 z-20 bg-black/25 dark:bg-black/50 sm:hidden"
              />
              <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-2xl dark:shadow-black/40 sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-72">
                <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Filter Handover
                  </h3>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="p-1 text-gray-400 dark:text-slate-400 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                  >
                    <CloseIcon className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-slate-200 mb-2">
                      Status
                    </label>
                    <div className="space-y-2">
                      {statusOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            onFilterChange({
                              status:
                                filters.status === opt.value ? "" : opt.value,
                            })
                          }
                          className={`w-full px-3 py-2 text-sm rounded-md border text-left transition-colors ${filters.status === opt.value ? "bg-primary-600 border-primary-600 text-white font-semibold" : "bg-white dark:bg-slate-700 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-600"}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900/50 border-t dark:border-slate-700">
                  <button
                    onClick={() => {
                      onFilterChange({ status: "" });
                      setIsFilterPanelOpen(false);
                    }}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-600"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setIsFilterPanelOpen(false)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 dark:bg-primary-500 rounded-lg shadow-sm hover:bg-primary-700 dark:hover:bg-primary-600"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-slate-700 animate-fade-in-up mt-3">
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
              Status: <span className="font-bold">{filters.status}</span>
              <button
                onClick={() => onFilterChange({ status: "" })}
                className="p-0.5 ml-1 rounded-full hover:bg-blue-200 text-blue-500"
              >
                <CloseIcon className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={() => onFilterChange({ status: "" })}
            className="text-xs text-gray-500 hover:text-red-600 hover:underline px-2 py-1"
          >
            Hapus Semua
          </button>
        </div>
      )}
    </div>
  );
};
