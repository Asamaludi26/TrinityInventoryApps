import React, { useMemo, useState, useEffect, useRef } from "react";
import { Asset, User, AssetStatus, PreviewData } from "../../types";
import { useSortableData, SortConfig } from "../../hooks/useSortableData";
import { PaginationControls } from "../../components/ui/PaginationControls";
import { SearchIcon } from "../../components/icons/SearchIcon";
import { InboxIcon } from "../../components/icons/InboxIcon";
import { SortIcon } from "../../components/icons/SortIcon";
import { SortAscIcon } from "../../components/icons/SortAscIcon";
import { SortDescIcon } from "../../components/icons/SortDescIcon";
import { getStatusClass } from "../assetRegistration/RegistrationPage";
import { WrenchIcon } from "../../components/icons/WrenchIcon";
import { SpinnerIcon } from "../../components/icons/SpinnerIcon";
import { ClickableLink } from "../../components/ui/ClickableLink";
import { BsTools, BsTruck } from "react-icons/bs";
import { SummaryCard } from "../dashboard/components/SummaryCard";
import { FilterIcon } from "../../components/icons/FilterIcon";
import { CloseIcon } from "../../components/icons/CloseIcon";
import { CustomSelect } from "../../components/ui/CustomSelect";

// Stores
import { useAssetStore } from "../../stores/useAssetStore";
import { useMasterDataStore } from "../../stores/useMasterDataStore";

interface RepairManagementPageProps {
  currentUser: User;
  onShowPreview: (data: PreviewData) => void;
  onStartRepair: (asset: Asset) => void;
  onAddProgressUpdate: (asset: Asset) => void;
  onReceiveFromRepair: (asset: Asset) => void;
  onCompleteRepair: (asset: Asset) => void;
  onDecommission: (asset: Asset) => void;
}

type RepairAsset = Asset & {
  reporter?: string;
  reportDate?: string;
  technician?: string;
  vendor?: string;
  estimatedDate?: string;
};

const SortableHeader: React.FC<{
  children: React.ReactNode;
  columnKey: keyof RepairAsset;
  sortConfig: SortConfig<RepairAsset> | null;
  requestSort: (key: keyof RepairAsset) => void;
}> = ({ children, columnKey, sortConfig, requestSort }) => {
  const isSorted = sortConfig?.key === columnKey;
  const direction = isSorted ? sortConfig.direction : undefined;

  const getSortIcon = () => {
    if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400" />;
    if (direction === "ascending")
      return <SortAscIcon className="w-4 h-4 text-primary-500" />;
    return <SortDescIcon className="w-4 h-4 text-primary-500" />;
  };

  return (
    <th
      scope="col"
      className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500"
    >
      <button
        onClick={() => requestSort(columnKey)}
        className="flex items-center space-x-1 group"
      >
        <span>{children}</span>
        <span className="opacity-50 group-hover:opacity-100">
          {getSortIcon()}
        </span>
      </button>
    </th>
  );
};

const RepairManagementPage: React.FC<RepairManagementPageProps> = ({
  onShowPreview,
  onStartRepair,
  onAddProgressUpdate,
  onReceiveFromRepair,
  onCompleteRepair,
  onDecommission,
}) => {
  const assets = useAssetStore((state) => state.assets);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filter State
  const initialFilterState = { status: "" };
  const [filters, setFilters] = useState(initialFilterState);
  const [tempFilters, setTempFilters] = useState(filters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  // Click outside handler for filter panel
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
  }, [filterPanelRef]);

  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setTempFilters(initialFilterState);
    setIsFilterPanelOpen(false);
  };

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterPanelOpen(false);
  };

  const handleRemoveFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setTempFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const statusOptions = [
    { value: AssetStatus.DAMAGED, label: "Rusak (Menunggu)" },
    { value: AssetStatus.UNDER_REPAIR, label: "Sedang Diperbaiki (Internal)" },
    { value: AssetStatus.OUT_FOR_REPAIR, label: "Perbaikan Eksternal" },
  ];

  const repairAssets = useMemo<RepairAsset[]>(() => {
    return assets
      .filter((a) =>
        [
          AssetStatus.DAMAGED,
          AssetStatus.UNDER_REPAIR,
          AssetStatus.OUT_FOR_REPAIR,
        ].includes(a.status as AssetStatus),
      )
      .map((asset) => {
        const reportLog = [...(asset.activityLog || [])]
          .reverse()
          .find((log) => log.action === "Kerusakan Dilaporkan");
        const startLog = [...(asset.activityLog || [])]
          .reverse()
          .find((log) => log.action === "Proses Perbaikan Dimulai");

        // Improved Safety Regex Extraction (with optional chaining already present)
        const technician = startLog?.details.match(/oleh (.*?)\./)?.[1];
        const vendor = startLog?.details.match(/ke (.*?)\s\(/)?.[1];
        const estimatedDate = startLog?.details.match(
          /(?:selesai|kembali): (.*?)\./,
        )?.[1];

        return {
          ...asset,
          reporter: reportLog?.user,
          reportDate: reportLog?.timestamp,
          technician,
          vendor,
          estimatedDate,
        };
      });
  }, [assets]);

  const filteredAssets = useMemo(() => {
    return repairAssets.filter((asset) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        asset.name.toLowerCase().includes(searchLower) ||
        asset.id.toLowerCase().includes(searchLower) ||
        (asset.reporter &&
          asset.reporter.toLowerCase().includes(searchLower)) ||
        (asset.technician &&
          asset.technician.toLowerCase().includes(searchLower)) ||
        (asset.vendor && asset.vendor.toLowerCase().includes(searchLower));
      const matchesStatus = filters.status
        ? asset.status === filters.status
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [repairAssets, searchQuery, filters]);

  const {
    items: sortedAssets,
    requestSort,
    sortConfig,
  } = useSortableData(filteredAssets, {
    key: "reportDate",
    direction: "descending",
  });

  const totalItems = sortedAssets.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedAssets = sortedAssets.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const summary = useMemo(
    () => ({
      waiting: repairAssets.filter((a) => a.status === AssetStatus.DAMAGED)
        .length,
      inProgress: repairAssets.filter(
        (a) => a.status === AssetStatus.UNDER_REPAIR,
      ).length,
      external: repairAssets.filter(
        (a) => a.status === AssetStatus.OUT_FOR_REPAIR,
      ).length,
    }),
    [repairAssets],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filters, itemsPerPage]);

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Manajemen Perbaikan Aset
      </h1>

      <div className="grid grid-cols-1 gap-5 mb-6 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          title="Menunggu Aksi"
          value={summary.waiting}
          icon={WrenchIcon}
          color="amber"
          onClick={() => {
            setFilters({ status: AssetStatus.DAMAGED });
            setTempFilters({ status: AssetStatus.DAMAGED });
          }}
          isActive={filters.status === AssetStatus.DAMAGED}
        />
        <SummaryCard
          title="Sedang Dikerjakan"
          value={summary.inProgress}
          icon={BsTools}
          color="blue"
          onClick={() => {
            setFilters({ status: AssetStatus.UNDER_REPAIR });
            setTempFilters({ status: AssetStatus.UNDER_REPAIR });
          }}
          isActive={filters.status === AssetStatus.UNDER_REPAIR}
        />
        <SummaryCard
          title="Perbaikan Eksternal"
          value={summary.external}
          icon={BsTruck}
          color="purple"
          onClick={() => {
            setFilters({ status: AssetStatus.OUT_FOR_REPAIR });
            setTempFilters({ status: AssetStatus.OUT_FOR_REPAIR });
          }}
          isActive={filters.status === AssetStatus.OUT_FOR_REPAIR}
        />
      </div>

      <div className="p-4 mb-4 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl shadow-md dark:shadow-lg dark:shadow-black/20">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute w-5 h-5 text-gray-400 dark:text-slate-500 transform -translate-y-1/2 top-1/2 left-3" />
            <input
              type="text"
              placeholder="Cari aset, pelapor, teknisi, vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Filter Button & Panel */}
          <div className="relative" ref={filterPanelRef}>
            <button
              onClick={() => {
                setTempFilters(filters);
                setIsFilterPanelOpen((p) => !p);
              }}
              className={`inline-flex items-center justify-center gap-2 w-full h-10 px-4 text-sm font-semibold transition-all duration-200 border rounded-lg shadow-sm sm:w-auto 
                                ${activeFilterCount > 0 ? "bg-gray-50 dark:bg-slate-700 border-primary-500 text-primary-600 dark:text-primary-400" : "bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-700"}
                            `}
            >
              <FilterIcon className="w-4 h-4" /> <span>Filter</span>{" "}
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold text-white rounded-full bg-primary-600">
                  {activeFilterCount}
                </span>
              )}
            </button>
            {isFilterPanelOpen && (
              <>
                <div
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="fixed inset-0 z-20 bg-black/25 sm:hidden"
                />
                <div className="fixed top-32 inset-x-4 z-30 origin-top rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg dark:shadow-xl dark:shadow-black/30 sm:absolute sm:top-full sm:inset-x-auto sm:right-0 sm:mt-2 sm:w-72">
                  <div className="flex items-center justify-between p-4 border-b dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Filter Perbaikan
                    </h3>
                    <button
                      onClick={() => setIsFilterPanelOpen(false)}
                      className="p-1 text-gray-400 dark:text-slate-500 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
                    >
                      <CloseIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">
                        Status
                      </label>
                      <CustomSelect
                        options={[
                          { value: "", label: "Semua Status" },
                          ...statusOptions,
                        ]}
                        value={tempFilters.status}
                        onChange={(v) =>
                          setTempFilters((f) => ({ ...f, status: v }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 border-t dark:border-slate-700">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
                    >
                      Reset
                    </button>
                    <button
                      onClick={handleApplyFilters}
                      className="px-4 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Active Filter Chips */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-slate-700 animate-fade-in-up mt-3">
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800 rounded-full">
                Status: <span className="font-bold">{filters.status}</span>
                <button
                  onClick={() => handleRemoveFilter("status")}
                  className="p-0.5 ml-1 rounded-full hover:bg-blue-200 text-blue-500"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-500 hover:text-red-600 hover:underline px-2 py-1"
            >
              Hapus Semua
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl shadow-md dark:shadow-lg dark:shadow-black/20">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <SortableHeader
                  columnKey="name"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  Aset
                </SortableHeader>
                <SortableHeader
                  columnKey="status"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  Status
                </SortableHeader>
                <SortableHeader
                  columnKey="reporter"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  Pelapor & Tanggal
                </SortableHeader>
                <th
                  scope="col"
                  className="px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500 dark:text-slate-400"
                >
                  Penanggung Jawab
                </th>
                <SortableHeader
                  columnKey="estimatedDate"
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                >
                  Estimasi Selesai
                </SortableHeader>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {paginatedAssets.length > 0 ? (
                paginatedAssets.map((asset) => (
                  <tr
                    key={asset.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ClickableLink
                        onClick={() =>
                          onShowPreview({ type: "asset", id: asset.id })
                        }
                      >
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {asset.name}
                        </p>
                      </ClickableLink>
                      <p className="text-xs text-gray-500 dark:text-slate-400 font-mono">
                        {asset.id}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(asset.status as AssetStatus)}`}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-800 dark:text-slate-200">
                        {asset.reporter || "N/A"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {asset.reportDate
                          ? new Date(asset.reportDate).toLocaleDateString(
                              "id-ID",
                            )
                          : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-300 whitespace-nowrap">
                      {asset.technician || asset.vendor || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 dark:text-slate-300 whitespace-nowrap">
                      {asset.estimatedDate || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right whitespace-nowrap">
                      {asset.status === AssetStatus.DAMAGED && (
                        <button
                          onClick={() => onStartRepair(asset)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-primary-600 rounded-md shadow-sm hover:bg-primary-700"
                        >
                          Mulai Perbaikan
                        </button>
                      )}
                      {asset.status === AssetStatus.UNDER_REPAIR && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAddProgressUpdate(asset)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => onCompleteRepair(asset)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-success rounded-md shadow-sm hover:bg-green-700"
                          >
                            Selesaikan
                          </button>
                        </div>
                      )}
                      {asset.status === AssetStatus.OUT_FOR_REPAIR && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onAddProgressUpdate(asset)}
                            className="px-3 py-1.5 text-xs font-semibold text-primary-600 bg-blue-100 rounded-md hover:bg-blue-200"
                          >
                            Update
                          </button>
                          <button
                            onClick={() => onReceiveFromRepair(asset)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-success rounded-md shadow-sm hover:bg-green-700"
                          >
                            Terima Aset
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-500 dark:text-slate-400">
                    <InboxIcon className="w-12 h-12 mx-auto text-gray-300 dark:text-slate-600" />
                    <p className="mt-2 font-semibold">
                      Tidak ada aset yang perlu diperbaiki sesuai filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalItems > 0 && (
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            startIndex={startIndex}
            endIndex={startIndex + paginatedAssets.length}
          />
        )}
      </div>
    </div>
  );
};

export default RepairManagementPage;
