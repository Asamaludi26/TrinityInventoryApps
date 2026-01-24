import React, { useState } from "react";
import { Asset, Page } from "../../../types";
import { ExclamationTriangleIcon } from "../../../components/icons/ExclamationTriangleIcon";
import { useStockAnalysis, StockItem } from "../hooks/useStockAnalysis";
import { CriticalStockPanel } from "./stock/CriticalStockPanel";
import { LowStockPanel } from "./stock/LowStockPanel";

interface StockAlertWidgetProps {
  assets: Asset[];
  setActivePage: (page: Page, filters?: any) => void;
  thresholds: Record<string, number>;
}

export const StockAlertWidget: React.FC<StockAlertWidgetProps> = ({
  assets,
  setActivePage,
  thresholds,
}) => {
  const [activeTab, setActiveTab] = useState<"critical" | "low">("critical");

  const { criticalItems, lowItems, totalCritical, totalLow } = useStockAnalysis(assets, thresholds);

  const handleNavigateToRestock = (itemsToRestock: StockItem[]) => {
    const prefillItems = itemsToRestock.map((item) => {
      return {
        name: item.name,
        brand: item.brand,
        currentStock: item.count,
        threshold: item.threshold, // Menggunakan threshold langsung dari item
      };
    });

    setActivePage("request", {
      prefillItems,
      // FORCE LOGIC: Restock dari dashboard otomatis mengunci tujuan ke Inventory
      forcedAllocationTarget: "Inventory",
    });
  };

  const bgSoft =
    activeTab === "critical" ? "bg-red-50 dark:bg-red-900/30" : "bg-amber-50 dark:bg-amber-900/30";
  const textStrong =
    activeTab === "critical"
      ? "text-red-700 dark:text-red-400"
      : "text-amber-700 dark:text-amber-400";

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07)] dark:shadow-lg dark:shadow-black/20 overflow-hidden flex flex-col">
      <div className="px-6 py-5 border-b border-gray-50 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${bgSoft} ${textStrong}`}>
            <ExclamationTriangleIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Peringatan Stok</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Pantau ketersediaan aset yang kritis
            </p>
          </div>
        </div>

        <div className="flex bg-gray-50 dark:bg-slate-900 p-1 rounded-xl border border-gray-100 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("critical")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "critical"
                ? "bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-sm ring-1 ring-black/5 dark:ring-slate-600"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${activeTab === "critical" ? "bg-red-500" : "bg-gray-300 dark:bg-slate-600"}`}
            ></span>
            Habis ({totalCritical})
          </button>
          <button
            onClick={() => setActiveTab("low")}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === "low"
                ? "bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-black/5 dark:ring-slate-600"
                : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${activeTab === "low" ? "bg-amber-500" : "bg-gray-300 dark:bg-slate-600"}`}
            ></span>
            Menipis ({totalLow})
          </button>
        </div>
      </div>

      <div className="p-6 bg-white/50 dark:bg-slate-800/50">
        {activeTab === "critical" ? (
          <CriticalStockPanel items={criticalItems} onRestock={handleNavigateToRestock} />
        ) : (
          <LowStockPanel items={lowItems} onRestock={handleNavigateToRestock} />
        )}
      </div>
    </div>
  );
};
