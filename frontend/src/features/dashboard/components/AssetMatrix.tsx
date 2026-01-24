import React, { useMemo, useState } from "react";
import { Asset, AssetCategory, AssetStatus } from "../../../types";
import { ArchiveBoxIcon } from "../../../components/icons/ArchiveBoxIcon";
import { DollarIcon } from "../../../components/icons/DollarIcon";
import { ChevronRightIcon } from "../../../components/icons/ChevronRightIcon";

interface AssetMatrixProps {
  assets: Asset[];
  categories: AssetCategory[];
  onCellClick: (category: string, status: AssetStatus) => void;
}

type MatrixMode = "count" | "value";

export const AssetMatrix: React.FC<AssetMatrixProps> = ({
  assets,
  categories,
  onCellClick,
}) => {
  const [mode, setMode] = useState<MatrixMode>("count");

  const statuses = Object.values(AssetStatus);

  // 1. Process Data into Matrix Map
  const matrixData = useMemo(() => {
    const map = new Map<string, { count: number; value: number }>();
    let maxCount = 0;
    let maxValue = 0;

    // Initialize map
    categories.forEach((cat) => {
      statuses.forEach((status) => {
        map.set(`${cat.name}|${status}`, { count: 0, value: 0 });
      });
    });

    // Populate
    assets.forEach((asset) => {
      const key = `${asset.category}|${asset.status}`;
      const current = map.get(key) || { count: 0, value: 0 };

      const price = asset.purchasePrice || 0;

      const updated = {
        count: current.count + 1,
        value: current.value + price,
      };
      map.set(key, updated);

      if (updated.count > maxCount) maxCount = updated.count;
      if (updated.value > maxValue) maxValue = updated.value;
    });

    return { map, maxCount, maxValue };
  }, [assets, categories, statuses]);

  // 2. Helper to determine cell intensity (Modern Heatmap logic)
  const getIntensityClass = (val: number, max: number) => {
    if (val === 0) return "bg-gray-50/50 dark:bg-slate-700/50 text-gray-300 dark:text-slate-600";
    const percentage = (val / max) * 100;

    if (mode === "count") {
      if (percentage > 75)
        return "bg-primary-600 text-white font-bold shadow-md shadow-blue-200 dark:shadow-blue-900/50";
      if (percentage > 50)
        return "bg-blue-400 dark:bg-blue-500 text-white font-medium shadow-sm";
      if (percentage > 25) return "bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 font-medium";
      return "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300";
    } else {
      // Value mode uses Green/Emerald theme
      if (percentage > 75)
        return "bg-emerald-600 text-white font-bold shadow-md shadow-emerald-200 dark:shadow-emerald-900/50";
      if (percentage > 50)
        return "bg-emerald-400 dark:bg-emerald-500 text-white font-medium shadow-sm";
      if (percentage > 25) return "bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200 font-medium";
      return "bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300";
    }
  };

  const formatValue = (val: number) => {
    if (mode === "count") return val.toLocaleString("id-ID");

    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(1)}M`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}jt`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}rb`;
    return val.toString();
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-lg dark:shadow-black/20 overflow-hidden flex flex-col h-full">
      {/* Header Control */}
      <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-800">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg flex items-center justify-center">
              <div className="grid grid-cols-2 gap-0.5 w-4 h-4">
                <div className="bg-current rounded-[1px] opacity-40"></div>
                <div className="bg-current rounded-[1px]"></div>
                <div className="bg-current rounded-[1px]"></div>
                <div className="bg-current rounded-[1px] opacity-40"></div>
              </div>
            </div>
            Matriks Distribusi Aset
          </h3>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 ml-11">
            Peta persebaran aset berdasarkan kategori & status
          </p>
        </div>

        {/* Modern Segmented Control */}
        <div className="flex bg-gray-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setMode("count")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "count"
                ? "bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <ArchiveBoxIcon className="w-3.5 h-3.5" />
            Unit
          </button>
          <button
            onClick={() => setMode("value")}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === "value"
                ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-black/5 dark:ring-white/10"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <DollarIcon className="w-3.5 h-3.5" />
            Nilai
          </button>
        </div>
      </div>

      {/* The Matrix Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6">
        <div className="min-w-[800px]">
          {" "}
          {/* Force width for scroll on small screens */}
          {/* Column Headers (Status) */}
          <div className="grid grid-cols-[220px_repeat(auto-fit,minmax(100px,1fr))] gap-3 mb-3">
            <div className="font-semibold text-gray-400 dark:text-slate-500 text-[10px] uppercase tracking-widest self-end pb-2 pl-2">
              Kategori
            </div>
            {statuses.map((status) => (
              <div key={status} className="text-center pb-2">
                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                    status === AssetStatus.IN_STORAGE
                      ? "bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300"
                      : status === AssetStatus.IN_USE
                        ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                        : status === AssetStatus.DAMAGED
                          ? "bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400"
                          : "bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                  }`}
                >
                  {status.replace(" ", " ")}
                </span>
              </div>
            ))}
            <div className="text-center pb-2 font-bold text-gray-800 dark:text-white text-[10px] uppercase tracking-widest">
              Total
            </div>
          </div>
          {/* Rows (Categories) */}
          <div className="space-y-3">
            {categories.map((cat) => {
              // Row Total Calculation
              const rowTotal = statuses.reduce((acc, status) => {
                const data = matrixData.map.get(`${cat.name}|${status}`);
                return (
                  acc + (mode === "count" ? data?.count || 0 : data?.value || 0)
                );
              }, 0);

              return (
                <div
                  key={cat.id}
                  className="grid grid-cols-[220px_repeat(auto-fit,minmax(100px,1fr))] gap-3 items-center group"
                >
                  {/* Row Label */}
                  <div className="text-sm font-semibold text-gray-600 dark:text-slate-300 truncate pr-4 py-2 flex items-center justify-between group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors pl-2 rounded-lg group-hover:bg-gray-50 dark:group-hover:bg-slate-700">
                    {cat.name}
                    <ChevronRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400 dark:text-slate-500 transform translate-x-2 group-hover:translate-x-0 transition-all" />
                  </div>

                  {/* Cells */}
                  {statuses.map((status) => {
                    const data = matrixData.map.get(
                      `${cat.name}|${status}`,
                    ) || { count: 0, value: 0 };
                    const val = mode === "count" ? data.count : data.value;
                    const max =
                      mode === "count"
                        ? matrixData.maxCount
                        : matrixData.maxValue;

                    return (
                      <button
                        key={status}
                        onClick={() => val > 0 && onCellClick(cat.name, status)}
                        disabled={val === 0}
                        className={`h-10 rounded-lg flex items-center justify-center text-xs transition-all duration-200 transform hover:scale-105 hover:ring-2 ring-offset-1 ring-transparent ${getIntensityClass(val, max)} ${val > 0 ? "cursor-pointer hover:ring-current/20" : "cursor-default"}`}
                        title={`${cat.name} - ${status}: ${mode === "value" ? "Rp " : ""}${val.toLocaleString("id-ID")}`}
                      >
                        {formatValue(val)}
                      </button>
                    );
                  })}

                  {/* Row Total Cell */}
                  <div className="h-10 flex items-center justify-center font-bold text-sm text-gray-800 dark:text-white bg-gray-50 dark:bg-slate-700 rounded-lg">
                    {formatValue(rowTotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
