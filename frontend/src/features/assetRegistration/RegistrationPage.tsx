import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Asset,
  AssetStatus,
  Request,
  User,
  PreviewData,
  AssetCategory,
  Page,
  RequestItem,
  ParsedScanResult,
  AssetType,
  AssetCondition,
} from "../../types";
import { useNotification } from "../../providers/NotificationProvider";
import { useSortableData, SortConfig } from "../../hooks/useSortableData";
import { exportToCSV } from "../../utils/csvExporter";
import { Checkbox } from "../../components/ui/Checkbox";
import { SortAscIcon } from "../../components/icons/SortAscIcon";
import { SortDescIcon } from "../../components/icons/SortDescIcon";
import { SortIcon } from "../../components/icons/SortIcon";
import { ExportIcon } from "../../components/icons/ExportIcon";
import { useLongPress } from "../../hooks/useLongPress";
import { SearchIcon } from "../../components/icons/SearchIcon";
import { PaginationControls } from "../../components/ui/PaginationControls";
import { CustomerIcon } from "../../components/icons/CustomerIcon";
import { PencilIcon } from "../../components/icons/PencilIcon";
import { ClickableLink } from "../../components/ui/ClickableLink";
import { CustomSelect } from "../../components/ui/CustomSelect";
import { FilterIcon } from "../../components/icons/FilterIcon";
import { ModelManagementModal } from "../../components/ui/ModelManagementModal";
import { TypeManagementModal } from "../../components/ui/TypeManagementModal";
import { EyeIcon } from "../../components/icons/EyeIcon";
import { CloseIcon } from "../../components/icons/CloseIcon";
import { InboxIcon } from "../../components/icons/InboxIcon";
import { TrashIcon } from "../../components/icons/TrashIcon";
import { QrCodeIcon } from "../../components/icons/QrCodeIcon";
import { BulkLabelModal } from "./components/BulkLabelModal";
import Modal from "../../components/ui/Modal";
import { SpinnerIcon } from "../../components/icons/SpinnerIcon";
import { ExclamationTriangleIcon } from "../../components/icons/ExclamationTriangleIcon";
import {
  BsTruck,
  BsTag,
  BsPencilSquare,
  BsInfoCircle,
  BsChevronDown,
  BsBuilding,
  BsPersonBadge,
  BsX,
} from "react-icons/bs";
import DatePicker from "../../components/ui/DatePicker";

// Components
import { RegistrationForm } from "./components/RegistrationForm";
import { RegistrationFormData } from "./types";

// Stores
import { useAssetStore } from "../../stores/useAssetStore";
import { useRequestStore } from "../../stores/useRequestStore";
import { useMasterDataStore } from "../../stores/useMasterDataStore";

interface ItemRegistrationProps {
  currentUser: User;
  prefillData?: { request: Request; itemToRegister?: RequestItem } | null;
  onClearPrefill: () => void;
  onInitiateHandover: (asset: Asset) => void;
  onInitiateDismantle: (asset: Asset) => void;
  onInitiateInstallation: (asset: Asset) => void;
  assetToViewId: string | null;
  initialFilters?: any;
  onClearInitialFilters: () => void;
  itemToEdit: { type: string; id?: string; data?: any } | null;
  onClearItemToEdit: () => void;
  onShowPreview: (data: PreviewData) => void;
  setActivePage: (page: Page, initialState?: any) => void;
  setIsGlobalScannerOpen: (isOpen: boolean) => void;
  setScanContext: (context: "global" | "form") => void;
  setFormScanCallback: (
    callback: ((data: ParsedScanResult) => void) | null,
  ) => void;
}

export const getStatusClass = (status: AssetStatus | string) => {
  switch (status) {
    case AssetStatus.IN_USE:
      return "bg-info-light text-info-text";
    case AssetStatus.IN_CUSTODY:
      return "bg-purple-100 text-purple-800";
    case AssetStatus.IN_STORAGE:
      return "bg-gray-100 text-gray-800";
    case AssetStatus.UNDER_REPAIR:
      return "bg-blue-100 text-blue-700";
    case AssetStatus.OUT_FOR_REPAIR:
      return "bg-purple-100 text-purple-700";
    case AssetStatus.DAMAGED:
      return "bg-warning-light text-warning-text";
    case AssetStatus.DECOMMISSIONED:
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const SortableHeader: React.FC<{
  children: React.ReactNode;
  columnKey: keyof Asset;
  sortConfig: SortConfig<Asset> | null;
  requestSort: (key: keyof Asset) => void;
  className?: string;
}> = ({ children, columnKey, sortConfig, requestSort, className }) => {
  const isSorted = sortConfig?.key === columnKey;
  const direction = isSorted ? sortConfig.direction : undefined;
  const getSortIcon = () => {
    if (!isSorted) return <SortIcon className="w-4 h-4 text-gray-400 dark:text-slate-500" />;
    if (direction === "ascending")
      return <SortAscIcon className="w-4 h-4 text-primary-500" />;
    return <SortDescIcon className="w-4 h-4 text-primary-500" />;
  };
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-sm font-semibold tracking-wider text-left text-gray-500 dark:text-slate-400 ${className}`}
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

// --- REFACTORED COMPONENT: SelectedAssetsList ---
const SelectedAssetsList: React.FC<{
  assets: Asset[];
  onRemove: (id: string) => void;
}> = ({ assets, onRemove }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (assets.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm dark:shadow-lg dark:shadow-black/20 overflow-hidden mb-5">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-slate-900 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors border-b border-gray-200 dark:border-slate-700"
      >
        <div className="flex items-center gap-2">
          <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {assets.length}
          </span>
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-300">
            Item Terpilih
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
          <span>{isExpanded ? "Tutup Daftar" : "Lihat Daftar"}</span>
          <BsChevronDown
            className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="max-h-48 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-800 p-2">
          <ul className="space-y-1">
            {assets.map((asset) => (
              <li
                key={asset.id}
                className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 group border border-transparent hover:border-gray-200 dark:hover:border-slate-600 transition-all"
              >
                <div className="flex flex-col min-w-0 pr-3">
                  <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {asset.name}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-mono">
                    {asset.id}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(asset.id)}
                  className="p-1 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                  title="Hapus dari seleksi"
                >
                  <BsX className="w-5 h-5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface RegistrationTableProps {
  assets: Asset[];
  onDetailClick: (asset: Asset) => void;
  onDeleteClick: (id: string) => void;
  sortConfig: SortConfig<Asset> | null;
  requestSort: (key: keyof Asset) => void;
  selectedAssetIds: string[];
  onSelectOne: (id: string) => void;
  onSelectAll: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isBulkSelectMode: boolean;
  onEnterBulkMode: () => void;
  onShowPreview: (data: PreviewData) => void;
}

const RegistrationTable: React.FC<RegistrationTableProps> = ({
  assets,
  onDetailClick,
  onDeleteClick,
  sortConfig,
  requestSort,
  selectedAssetIds,
  onSelectOne,
  onSelectAll,
  isBulkSelectMode,
  onEnterBulkMode,
  onShowPreview,
}) => {
  const longPressHandlers = useLongPress(onEnterBulkMode, 500);
  const handleRowClick = (asset: Asset) => {
    if (isBulkSelectMode) {
      onSelectOne(asset.id);
    } else {
      onDetailClick(asset);
    }
  };

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
      <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-slate-900">
        <tr>
          {isBulkSelectMode && (
            <th scope="col" className="px-6 py-3">
              <Checkbox
                checked={
                  selectedAssetIds.length === assets.length && assets.length > 0
                }
                onChange={onSelectAll}
                aria-label="Pilih semua aset"
              />
            </th>
          )}
          <SortableHeader
            columnKey="name"
            sortConfig={sortConfig}
            requestSort={requestSort}
          >
            Aset
          </SortableHeader>
          <SortableHeader
            columnKey="location"
            sortConfig={sortConfig}
            requestSort={requestSort}
          >
            Lokasi / Pengguna
          </SortableHeader>
          <SortableHeader
            columnKey="status"
            sortConfig={sortConfig}
            requestSort={requestSort}
          >
            Status
          </SortableHeader>
          <th className="relative px-6 py-3">
            <span className="sr-only">Aksi</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
        {assets.length > 0 ? (
          assets.map((asset) => (
            <tr
              key={asset.id}
              {...longPressHandlers}
              onClick={() => handleRowClick(asset)}
              className={`transition-colors cursor-pointer ${selectedAssetIds.includes(asset.id) ? "bg-blue-50 dark:bg-blue-900/30" : asset.isDismantled ? "bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30" : "hover:bg-gray-50 dark:hover:bg-slate-700"}`}
            >
              {isBulkSelectMode && (
                <td
                  className="px-6 py-4 align-top"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedAssetIds.includes(asset.id)}
                    onChange={() => onSelectOne(asset.id)}
                  />
                </td>
              )}
              <td className="px-6 py-4 lg:whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    {asset.name}
                  </span>
                  {asset.lastModifiedDate && (
                    <span
                      title={`Diubah: ${new Date(asset.lastModifiedDate).toLocaleString("id-ID")} oleh ${asset.lastModifiedBy}`}
                    >
                      <PencilIcon className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500" />
                    </span>
                  )}
                  {asset.isDismantled && (
                    <span className="px-2 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                      Dismantled
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-400">
                  {asset.id} &bull; {asset.category}
                </div>
              </td>
              <td className="px-6 py-4 lg:whitespace-nowrap">
                {asset.currentUser && asset.currentUser.startsWith("TMI-") ? (
                  <div className="flex items-center gap-2">
                    <CustomerIcon className="w-5 h-5 text-gray-400 dark:text-slate-500 flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <ClickableLink
                          onClick={() =>
                            onShowPreview({
                              type: "customer",
                              id: asset.currentUser!,
                            })
                          }
                        >
                          Pelanggan: {asset.currentUser}
                        </ClickableLink>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm font-medium text-gray-800 dark:text-slate-200">
                      {asset.location || "-"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-slate-400">
                      {asset.currentUser || "Tidak ada pengguna"}
                    </div>
                  </>
                )}
              </td>
              <td className="px-6 py-4 lg:whitespace-nowrap">
                <span
                  className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(asset.status)}`}
                >
                  {asset.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-right lg:whitespace-nowrap">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetailClick(asset);
                    }}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-slate-400 transition-colors bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-info-light dark:hover:bg-blue-900/50 hover:text-info-text dark:hover:text-blue-400"
                    title="Lihat Detail"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClick(asset.id);
                    }}
                    className="flex items-center justify-center w-8 h-8 text-gray-500 dark:text-slate-400 transition-colors bg-gray-100 dark:bg-slate-700 rounded-full hover:bg-danger-light dark:hover:bg-red-900/50 hover:text-danger-text dark:hover:text-red-400"
                    title="Hapus"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td
              colSpan={isBulkSelectMode ? 5 : 4}
              className="px-6 py-12 text-center text-gray-500 dark:text-slate-400"
            >
              <div className="flex flex-col items-center">
                <InboxIcon className="w-12 h-12 text-gray-400 dark:text-slate-500" />
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                  Tidak Ada Data Aset
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
                  Ubah filter atau buat aset baru.
                </p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const ItemRegistration: React.FC<ItemRegistrationProps> = (props) => {
  // ... existing implementation same as before
  const {
    currentUser,
    setActivePage,
    onShowPreview,
    setIsGlobalScannerOpen,
    setScanContext,
    setFormScanCallback,
    prefillData,
    itemToEdit,
    onClearPrefill,
    onClearItemToEdit,
    initialFilters,
    onClearInitialFilters,
  } = props;

  // Stores
  const assets = useAssetStore((state) => state.assets);
  const addAsset = useAssetStore((state) => state.addAsset);
  const updateAsset = useAssetStore((state) => state.updateAsset);
  const updateAssetBatch = useAssetStore((state) => state.updateAssetBatch); // Batch Update
  const deleteAsset = useAssetStore((state) => state.deleteAsset);
  const categories = useAssetStore((state) => state.categories);
  const updateRequestRegistration = useRequestStore(
    (state) => state.updateRequestRegistration,
  );
  const users = useMasterDataStore((state) => state.users); // Access users for bulk move assignment
  const addNotification = useNotification();

  // State
  const [view, setView] = useState<"list" | "form">("list");
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isBulkLabelModalOpen, setIsBulkLabelModalOpen] = useState(false);

  // NEW: Bulk Action Modals State
  const [isBulkMoveModalOpen, setIsBulkMoveModalOpen] = useState(false);
  const [isBulkStatusModalOpen, setIsBulkStatusModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false);

  // Bulk Logic Data
  const [moveMode, setMoveMode] = useState<"location" | "user">("location"); // 'location' or 'user'
  const [bulkTargetLocation, setBulkTargetLocation] =
    useState("Gudang Inventori");
  const [bulkTargetLocationDetail, setBulkTargetLocationDetail] = useState("");
  const [bulkTargetUser, setBulkTargetUser] = useState(""); // NEW: Target User for Move
  const [bulkTargetStatus, setBulkTargetStatus] = useState<AssetStatus>(
    AssetStatus.IN_STORAGE,
  );
  const [bulkDeleteConfirmationText, setBulkDeleteConfirmationText] =
    useState("");

  // Bulk Edit Data (Attributes)
  const [bulkEditAttributes, setBulkEditAttributes] = useState<{
    brand: string;
    vendor: string;
    purchaseDate: Date | null;
    warrantyEndDate: Date | null;
    notes: string;
  }>({
    brand: "",
    vendor: "",
    purchaseDate: null,
    warrantyEndDate: null,
    notes: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  // Modals state for Type/Model management
  const [modelModalState, setModelModalState] = useState<{
    isOpen: boolean;
    category: AssetCategory | null;
    type: AssetType | null;
  }>({ isOpen: false, category: null, type: null });
  const [typeModalState, setTypeModalState] = useState<{
    isOpen: boolean;
    category: AssetCategory | null;
    typeToEdit: AssetType | null;
  }>({ isOpen: false, category: null, typeToEdit: null });

  // Filter/Sort/Search state
  const [searchQuery, setSearchQuery] = useState("");
  const initialFilterState = { category: "", status: "", condition: "" };
  const [filters, setFilters] = useState(initialFilterState);
  const [tempFilters, setTempFilters] = useState(filters);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isBulkSelectMode, setIsBulkSelectMode] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);

  // Filter click outside effect
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

  useEffect(() => {
    if (prefillData || itemToEdit) {
      if (itemToEdit) {
        const asset = assets.find((a) => a.id === itemToEdit.id);
        if (asset) setEditingAsset(asset);
      }
      setView("form");
    }
  }, [prefillData, itemToEdit, assets]);

  // Sorting and Filtering
  const {
    items: sortedAssets,
    requestSort,
    sortConfig,
  } = useSortableData<Asset>(
    assets.filter((a) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        a.name.toLowerCase().includes(searchLower) ||
        a.id.toLowerCase().includes(searchLower);

      const matchesCategory = filters.category
        ? a.category === filters.category
        : true;
      const matchesStatus = filters.status ? a.status === filters.status : true;
      const matchesCondition = filters.condition
        ? a.condition === filters.condition
        : true;

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesCondition
      );
    }),
    { key: "registrationDate", direction: "descending" },
  );

  const paginatedAssets = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAssets.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAssets, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);

  // Helper: Remove asset from selection
  const handleRemoveFromSelection = (id: string) => {
    setSelectedAssetIds((prev) => prev.filter((aId) => aId !== id));
  };

  const selectedAssetsObjects = useMemo(() => {
    return assets.filter((a) => selectedAssetIds.includes(a.id));
  }, [assets, selectedAssetIds]);

  // Filter Logic Functions
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter(Boolean).length;
  }, [filters]);

  const handleApplyFilters = () => {
    setFilters(tempFilters);
    setIsFilterPanelOpen(false);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters(initialFilterState);
    setTempFilters(initialFilterState);
    setIsFilterPanelOpen(false);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (key: keyof typeof filters) => {
    setFilters((prev) => ({ ...prev, [key]: "" }));
    setTempFilters((prev) => ({ ...prev, [key]: "" }));
  };

  const categoryFilterOptions = useMemo(
    () => categories.map((c) => ({ value: c.name, label: c.name })),
    [categories],
  );
  const statusFilterOptions = Object.values(AssetStatus).map((s) => ({
    value: s,
    label: s,
  }));
  const conditionFilterOptions = Object.values(AssetCondition).map((c) => ({
    value: c,
    label: c,
  }));

  // --- BULK ACTION HANDLERS ---

  const handleBulkMove = async () => {
    setIsLoading(true);
    try {
      // Logic Cerdas:
      // Mode Location: Pindah fisik/gudang. Reset user.
      // Mode User: Pindah tanggung jawab. Set user, set status Custody/Use.

      const updates: Partial<Asset> = {};

      if (moveMode === "location") {
        updates.location = bulkTargetLocation;
        updates.locationDetail = bulkTargetLocationDetail || undefined;
        // Jika ke Gudang, reset user
        if (
          bulkTargetLocation === "Gudang Inventori" ||
          bulkTargetLocation.includes("Gudang")
        ) {
          updates.status = AssetStatus.IN_STORAGE;
          updates.currentUser = null;
        }
      } else {
        // Move to User
        if (!bulkTargetUser) {
          throw new Error("Pilih user tujuan.");
        }
        updates.currentUser = bulkTargetUser;
        updates.status = AssetStatus.IN_CUSTODY; // Safe default for bulk handover
        updates.location = `Dipegang: ${bulkTargetUser}`;
      }

      await updateAssetBatch(
        selectedAssetIds,
        updates,
        `Bulk Move: ${selectedAssetIds.length} items to ${moveMode === "location" ? bulkTargetLocation : bulkTargetUser}`,
      );

      addNotification(
        `${selectedAssetIds.length} aset berhasil dipindahkan.`,
        "success",
      );
      setIsBulkMoveModalOpen(false);
      setBulkTargetLocationDetail("");
      setBulkTargetUser("");
      setSelectedAssetIds([]);
      setIsBulkSelectMode(false);
    } catch (error: any) {
      addNotification(error.message || "Gagal memindahkan aset.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async () => {
    setIsLoading(true);
    try {
      await updateAssetBatch(
        selectedAssetIds,
        {
          status: bulkTargetStatus,
        },
        `Bulk Status Change: ${bulkTargetStatus}`,
      );

      addNotification(
        `${selectedAssetIds.length} aset diubah statusnya menjadi ${bulkTargetStatus}.`,
        "success",
      );
      setIsBulkStatusModalOpen(false);
      setSelectedAssetIds([]);
      setIsBulkSelectMode(false);
    } catch (error) {
      addNotification("Gagal mengubah status.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkEdit = async () => {
    setIsLoading(true);
    try {
      // Filter hanya field yang diisi (tidak kosong)
      const updates: Partial<Asset> = {};
      if (bulkEditAttributes.brand.trim())
        updates.brand = bulkEditAttributes.brand;
      if (bulkEditAttributes.vendor.trim())
        updates.vendor = bulkEditAttributes.vendor;
      if (bulkEditAttributes.notes.trim())
        updates.notes = bulkEditAttributes.notes;
      if (bulkEditAttributes.purchaseDate)
        updates.purchaseDate = bulkEditAttributes.purchaseDate
          .toISOString()
          .split("T")[0];
      if (bulkEditAttributes.warrantyEndDate)
        updates.warrantyEndDate = bulkEditAttributes.warrantyEndDate
          .toISOString()
          .split("T")[0];

      if (Object.keys(updates).length === 0) {
        addNotification("Tidak ada perubahan atribut yang dipilih.", "warning");
        setIsLoading(false);
        return;
      }

      await updateAssetBatch(selectedAssetIds, updates, `Bulk Attribute Edit`);

      addNotification(
        `${selectedAssetIds.length} aset berhasil diperbarui atributnya.`,
        "success",
      );
      setIsBulkEditModalOpen(false);
      // Reset form
      setBulkEditAttributes({
        brand: "",
        vendor: "",
        purchaseDate: null,
        warrantyEndDate: null,
        notes: "",
      });
      setSelectedAssetIds([]);
      setIsBulkSelectMode(false);
    } catch (error) {
      addNotification("Gagal memperbarui atribut aset.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const { deletableAssets, lockedAssets } = useMemo(() => {
    const selected = assets.filter((a) => selectedAssetIds.includes(a.id));
    const deletable = selected.filter((a) =>
      [
        AssetStatus.IN_STORAGE,
        AssetStatus.DECOMMISSIONED,
        AssetStatus.DAMAGED,
      ].includes(a.status as AssetStatus),
    );
    const locked = selected.filter(
      (a) =>
        ![
          AssetStatus.IN_STORAGE,
          AssetStatus.DECOMMISSIONED,
          AssetStatus.DAMAGED,
        ].includes(a.status as AssetStatus),
    );
    return { deletableAssets: deletable, lockedAssets: locked };
  }, [assets, selectedAssetIds]);

  const handleBulkDelete = async () => {
    // Safety Check for large deletion
    if (
      deletableAssets.length >= 5 &&
      bulkDeleteConfirmationText !== "DELETE"
    ) {
      addNotification(
        "Konfirmasi keamanan salah. Ketik 'DELETE' untuk melanjutkan.",
        "error",
      );
      return;
    }

    setIsLoading(true);
    try {
      await Promise.all(deletableAssets.map((a) => deleteAsset(a.id)));
      addNotification(
        `${deletableAssets.length} aset berhasil dihapus.`,
        "success",
      );
      setIsBulkDeleteModalOpen(false);
      setBulkDeleteConfirmationText("");
      setSelectedAssetIds([]);
      setIsBulkSelectMode(false);
    } catch (error) {
      addNotification("Gagal menghapus aset.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // --- SMART PRINT LOGIC ---
  const handleOpenPrintModal = () => {
    if (selectedAssetIds.length === 0) {
      addNotification(
        "Pilih minimal satu aset untuk mencetak label.",
        "warning",
      );
      return;
    }
    setIsBulkLabelModalOpen(true);
  };

  // Handlers
  const handleSave = async (
    data: RegistrationFormData,
    assetIdToUpdate?: string,
  ) => {
    if (assetIdToUpdate) {
      const updates: Partial<Asset> = {
        name: data.assetName,
        category: data.category,
        type: data.type,
        brand: data.brand,
        purchasePrice: data.purchasePrice,
        vendor: data.vendor,
        poNumber: data.poNumber,
        invoiceNumber: data.invoiceNumber,
        purchaseDate: data.purchaseDate,
        registrationDate: data.registrationDate,
        warrantyEndDate: data.warrantyEndDate,
        condition: data.condition,
        location: data.location,
        locationDetail: data.locationDetail,
        currentUser: data.currentUser,
        notes: data.notes,
        serialNumber: data.bulkItems[0]?.serialNumber,
        macAddress: data.bulkItems[0]?.macAddress,
        initialBalance: data.bulkItems[0]?.initialBalance,
        currentBalance: data.bulkItems[0]?.currentBalance,
      };
      await updateAsset(assetIdToUpdate, updates);
      addNotification(`Aset ${data.assetName} berhasil diperbarui.`, "success");
    } else {
      // Create New Asset(s)
      const newAssets: Asset[] = data.bulkItems.map((item, index) => {
        const generatedId = `AST-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(Math.floor(Math.random() * 10000)).padStart(4, "0")}-${index}`;

        const itemQuantity = 1;

        return {
          id: generatedId,
          name: data.assetName,
          category: data.category,
          type: data.type,
          brand: data.brand,
          serialNumber: item.serialNumber || undefined,
          macAddress: item.macAddress || undefined,
          purchasePrice: data.purchasePrice,
          vendor: data.vendor,
          poNumber: data.poNumber,
          invoiceNumber: data.invoiceNumber,
          purchaseDate: data.purchaseDate,
          warrantyEndDate: data.warrantyEndDate,
          registrationDate: data.registrationDate,
          recordedBy: data.recordedBy,
          status: AssetStatus.IN_STORAGE,
          condition: data.condition,
          location: data.location,
          locationDetail: data.locationDetail,
          currentUser: data.currentUser,
          notes: data.notes,
          attachments: data.attachments,
          activityLog: [
            {
              id: `log-init-${Date.now()}-${index}`,
              timestamp: new Date().toISOString(),
              user: data.recordedBy,
              action: "Aset Dicatat",
              details: "Aset baru didaftarkan ke sistem.",
              referenceId: data.relatedRequestId || undefined,
            },
          ],
          woRoIntNumber: data.relatedRequestId,

          // Measurement Fields
          initialBalance: item.initialBalance,
          currentBalance: item.currentBalance,

          quantity: itemQuantity,
        };
      });

      await Promise.all(newAssets.map((asset) => addAsset(asset)));

      if (data.relatedRequestId && prefillData?.itemToRegister) {
        const registeredCount = newAssets.length;
        await updateRequestRegistration(
          data.relatedRequestId,
          prefillData.itemToRegister.id,
          registeredCount,
        );
        setActivePage("request", { openDetailForId: data.relatedRequestId });
        return;
      }

      addNotification(
        `${newAssets.length} aset berhasil didaftarkan.`,
        "success",
      );
    }

    setView("list");
    setEditingAsset(null);
    onClearPrefill();
    onClearItemToEdit();
  };

  const handleStartScan = (itemId: number) => {
    setScanContext("form");
    setIsGlobalScannerOpen(true);
  };

  const handleDetailClick = (asset: Asset) => {
    onShowPreview({ type: "asset", id: asset.id });
  };

  const handleDeleteClick = async (id: string) => {
    if (window.confirm("Hapus aset ini?")) {
      await deleteAsset(id);
      addNotification("Aset berhasil dihapus", "success");
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) setSelectedAssetIds(paginatedAssets.map((a) => a.id));
    else setSelectedAssetIds([]);
  };

  const handleSelectOne = (id: string) => {
    setSelectedAssetIds((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id],
    );
  };

  // Pass the actual asset objects to the Modal
  const selectedAssetsForPrint = useMemo(() => {
    return assets.filter((a) => selectedAssetIds.includes(a.id));
  }, [assets, selectedAssetIds]);

  const assetLocations = [
    "Gudang Inventori",
    "Data Center Lt. 1",
    "POP Cempaka Putih",
    "Gudang Teknisi",
    "Kantor Marketing",
    "Mobil Tim Engineer",
    "Kantor Engineer",
    "Kantor NOC",
  ];
  const userOptions = users.map((u) => ({ value: u.name, label: u.name }));

  // Render
  if (view === "form") {
    return (
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Pencatatan Aset</h1>
          <button
            onClick={() => {
              setView("list");
              setEditingAsset(null);
              onClearPrefill();
              onClearItemToEdit();
            }}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Kembali ke Daftar
          </button>
        </div>
        <div className="p-4 sm:p-6 bg-white border border-gray-200/80 rounded-xl shadow-md pb-24">
          <RegistrationForm
            onBack={() => {
              setView("list");
              setEditingAsset(null);
              onClearPrefill();
              onClearItemToEdit();
            }}
            onSave={handleSave}
            prefillData={prefillData}
            editingAsset={editingAsset}
            currentUser={currentUser}
            assetCategories={categories}
            setActivePage={setActivePage}
            openModelModal={(c, t) =>
              setModelModalState({ isOpen: true, category: c, type: t })
            }
            openTypeModal={(c, t) =>
              setTypeModalState({ isOpen: true, category: c, typeToEdit: t })
            }
            onStartScan={handleStartScan}
            setFormScanCallback={setFormScanCallback}
          />
        </div>

        {modelModalState.isOpen &&
          modelModalState.category &&
          modelModalState.type && (
            <ModelManagementModal
              isOpen={modelModalState.isOpen}
              onClose={() =>
                setModelModalState({ ...modelModalState, isOpen: false })
              }
              parentInfo={{
                category: modelModalState.category,
                type: modelModalState.type,
              }}
            />
          )}
        {typeModalState.isOpen && typeModalState.category && (
          <TypeManagementModal
            isOpen={typeModalState.isOpen}
            onClose={() =>
              setTypeModalState({ ...typeModalState, isOpen: false })
            }
            parentCategory={typeModalState.category}
            typeToEdit={typeModalState.typeToEdit}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Daftar Aset</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportToCSV(sortedAssets, "daftar_aset.csv")}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700"
          >
            <ExportIcon className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => {
              setView("form");
              setEditingAsset(null);
            }}
            className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 rounded-lg shadow-sm bg-primary-600 hover:bg-primary-700"
          >
            Catat Aset Baru
          </button>
        </div>
      </div>

      <div className="p-4 mb-4 bg-white dark:bg-slate-800 border border-gray-200/80 dark:border-slate-700 rounded-xl shadow-md dark:shadow-lg dark:shadow-black/20 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-grow">
            <SearchIcon className="absolute w-5 h-5 text-gray-400 dark:text-slate-500 transform -translate-y-1/2 top-1/2 left-3" />
            <input
              type="text"
              placeholder="Cari aset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 py-2 pl-10 pr-4 text-sm text-gray-900 dark:text-white bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-primary-500 focus:border-primary-500 placeholder-gray-400 dark:placeholder-slate-500"
            />
          </div>

          {/* Filter Button & Panel */}
          <div className="relative" ref={filterPanelRef}>
            <button
              onClick={() => {
                setTempFilters(filters);
                setIsFilterPanelOpen((p) => !p);
              }}
              className={`inline-flex items-center justify-center gap-2 h-10 px-4 text-sm font-semibold transition-all duration-200 border rounded-lg shadow-sm sm:w-auto 
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
                      Filter Aset
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
                        Kategori
                      </label>
                      <CustomSelect
                        options={[
                          { value: "", label: "Semua Kategori" },
                          ...categoryFilterOptions,
                        ]}
                        value={tempFilters.category}
                        onChange={(v) =>
                          setTempFilters((f) => ({ ...f, category: v }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                      </label>
                      <CustomSelect
                        options={[
                          { value: "", label: "Semua Status" },
                          ...statusFilterOptions,
                        ]}
                        value={tempFilters.status}
                        onChange={(v) =>
                          setTempFilters((f) => ({ ...f, status: v }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Kondisi
                      </label>
                      <CustomSelect
                        options={[
                          { value: "", label: "Semua Kondisi" },
                          ...conditionFilterOptions,
                        ]}
                        value={tempFilters.condition}
                        onChange={(v) =>
                          setTempFilters((f) => ({ ...f, condition: v }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 border-t">
                    <button
                      onClick={handleResetFilters}
                      className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
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

        {/* Bulk Action Bar */}
        {isBulkSelectMode && (
          <div className="p-4 bg-blue-50 border-l-4 border-primary-500 rounded-r-lg animate-fade-in-up">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-primary-600">
                  {selectedAssetIds.length} item terpilih
                </span>
                <div className="h-5 border-l border-gray-300"></div>

                {/* Refined Action Buttons */}
                <button
                  onClick={() => {
                    setMoveMode("location");
                    setIsBulkMoveModalOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-blue-800 bg-blue-100 rounded-md hover:bg-blue-200 shadow-sm transition-colors"
                >
                  <BsTruck className="w-4 h-4" /> Pindah
                </button>
                <button
                  onClick={() => setIsBulkStatusModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-indigo-800 bg-indigo-100 rounded-md hover:bg-indigo-200 shadow-sm transition-colors"
                >
                  <BsTag className="w-4 h-4" /> Status
                </button>
                <button
                  onClick={() => setIsBulkEditModalOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-amber-800 bg-amber-100 rounded-md hover:bg-amber-200 shadow-sm transition-colors"
                >
                  <BsPencilSquare className="w-4 h-4" /> Edit Atribut
                </button>
                <button
                  onClick={handleOpenPrintModal}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-gray-800 bg-gray-100 rounded-md hover:bg-gray-200 shadow-sm transition-colors"
                >
                  <QrCodeIcon className="w-4 h-4" /> Label
                </button>

                <div className="h-5 border-l border-gray-300"></div>

                <button
                  onClick={() => setIsBulkDeleteModalOpen(true)}
                  className="px-3 py-1.5 text-sm font-semibold text-red-600 bg-red-100 rounded-md hover:bg-red-200 shadow-sm transition-colors"
                >
                  Hapus
                </button>
              </div>
              <button
                onClick={() => {
                  setIsBulkSelectMode(false);
                  setSelectedAssetIds([]);
                }}
                className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {/* ACTIVE FILTER CHIPS */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 animate-fade-in-up">
            {filters.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full">
                Kategori: <span className="font-bold">{filters.category}</span>
                <button
                  onClick={() => handleRemoveFilter("category")}
                  className="p-0.5 ml-1 rounded-full hover:bg-blue-200 text-blue-500"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-100 rounded-full">
                Status: <span className="font-bold">{filters.status}</span>
                <button
                  onClick={() => handleRemoveFilter("status")}
                  className="p-0.5 ml-1 rounded-full hover:bg-purple-200 text-purple-500"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </span>
            )}
            {filters.condition && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100 rounded-full">
                Kondisi: <span className="font-bold">{filters.condition}</span>
                <button
                  onClick={() => handleRemoveFilter("condition")}
                  className="p-0.5 ml-1 rounded-full hover:bg-orange-200 text-orange-500"
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
          <RegistrationTable
            assets={paginatedAssets}
            onDetailClick={handleDetailClick}
            onDeleteClick={handleDeleteClick}
            sortConfig={sortConfig}
            requestSort={requestSort}
            selectedAssetIds={selectedAssetIds}
            onSelectOne={handleSelectOne}
            onSelectAll={handleSelectAll}
            isBulkSelectMode={isBulkSelectMode}
            onEnterBulkMode={() => setIsBulkSelectMode(true)}
            onShowPreview={onShowPreview}
          />
        </div>
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={sortedAssets.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          startIndex={(currentPage - 1) * itemsPerPage}
          endIndex={(currentPage - 1) * itemsPerPage + paginatedAssets.length}
        />
      </div>

      {/* Bulk Label Modal */}
      {isBulkLabelModalOpen && (
        <BulkLabelModal
          isOpen={isBulkLabelModalOpen}
          onClose={() => setIsBulkLabelModalOpen(false)}
          assets={selectedAssetsForPrint} // Ensure this prop is passed
        />
      )}

      {/* Bulk Move Modal (Refined) */}
      <Modal
        isOpen={isBulkMoveModalOpen}
        onClose={() => setIsBulkMoveModalOpen(false)}
        title={`Pindahkan ${selectedAssetIds.length} Aset`}
        size="lg" // Increased size
        footerContent={
          <>
            <button
              onClick={() => setIsBulkMoveModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkMove}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700"
            >
              {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />} Simpan
            </button>
          </>
        }
      >
        <div className="space-y-5">
          {/* Selected List Component */}
          <SelectedAssetsList
            assets={selectedAssetsObjects}
            onRemove={handleRemoveFromSelection}
          />

          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 flex gap-2">
            <BsInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              Jika dipindahkan ke <strong>Gudang Inventori</strong>, aset akan
              otomatis berstatus <strong>Di Gudang (IN_STORAGE)</strong> dan
              Penanggung Jawab dikosongkan.
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setMoveMode("location")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                moveMode === "location"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BsBuilding className="w-4 h-4" /> Pindah Lokasi (Gudang)
            </button>
            <button
              type="button"
              onClick={() => setMoveMode("user")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all ${
                moveMode === "user"
                  ? "bg-white text-primary-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <BsPersonBadge className="w-4 h-4" /> Serah Terima (User)
            </button>
          </div>

          {moveMode === "location" ? (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lokasi Baru
                </label>
                <CustomSelect
                  options={assetLocations.map((l) => ({ value: l, label: l }))}
                  value={bulkTargetLocation}
                  onChange={setBulkTargetLocation}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Detail Lokasi (Rak/Lantai)
                </label>
                <input
                  type="text"
                  className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-600 focus:border-primary-600"
                  value={bulkTargetLocationDetail}
                  onChange={(e) => setBulkTargetLocationDetail(e.target.value)}
                  placeholder="Contoh: Rak B-02"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-up">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Penanggung Jawab Baru
                </label>
                <CustomSelect
                  options={userOptions}
                  value={bulkTargetUser}
                  onChange={setBulkTargetUser}
                  isSearchable
                  placeholder="Pilih user..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Status aset akan menjadi <strong>Dipegang (Custody)</strong>.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Bulk Status Modal */}
      <Modal
        isOpen={isBulkStatusModalOpen}
        onClose={() => setIsBulkStatusModalOpen(false)}
        title={`Ubah Status ${selectedAssetIds.length} Aset`}
        size="lg"
        footerContent={
          <>
            <button
              onClick={() => setIsBulkStatusModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkStatusChange}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700"
            >
              {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />} Simpan
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <SelectedAssetsList
            assets={selectedAssetsObjects}
            onRemove={handleRemoveFromSelection}
          />
          <p className="text-sm text-gray-600">
            Pilih status baru yang akan diterapkan ke semua aset yang dipilih.
            Riwayat perubahan akan dicatat.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Baru
            </label>
            <CustomSelect
              options={Object.values(AssetStatus).map((s) => ({
                value: s,
                label: s,
              }))}
              value={bulkTargetStatus}
              onChange={(v) => setBulkTargetStatus(v as AssetStatus)}
            />
          </div>
        </div>
      </Modal>

      {/* Bulk Edit Attribute Modal (NEW) */}
      <Modal
        isOpen={isBulkEditModalOpen}
        onClose={() => setIsBulkEditModalOpen(false)}
        title={`Edit Atribut ${selectedAssetIds.length} Aset`}
        size="xl" // Larger for form
        footerContent={
          <>
            <button
              onClick={() => setIsBulkEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleBulkEdit}
              disabled={isLoading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg shadow-sm hover:bg-primary-700"
            >
              {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />} Simpan
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <SelectedAssetsList
            assets={selectedAssetsObjects}
            onRemove={handleRemoveFromSelection}
          />

          <div className="p-3 bg-blue-50 text-blue-800 text-xs rounded-lg border border-blue-100 flex gap-2">
            <BsInfoCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              Hanya field yang diisi yang akan diperbarui. Kosongkan field jika
              tidak ingin mengubah data tersebut.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-600 focus:border-primary-600"
                value={bulkEditAttributes.brand}
                onChange={(e) =>
                  setBulkEditAttributes((prev) => ({
                    ...prev,
                    brand: e.target.value,
                  }))
                }
                placeholder="Biarkan kosong..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vendor
              </label>
              <input
                type="text"
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-600 focus:border-primary-600"
                value={bulkEditAttributes.vendor}
                onChange={(e) =>
                  setBulkEditAttributes((prev) => ({
                    ...prev,
                    vendor: e.target.value,
                  }))
                }
                placeholder="Biarkan kosong..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Beli
              </label>
              <DatePicker
                id="bulkPurchaseDate"
                selectedDate={bulkEditAttributes.purchaseDate}
                onDateChange={(d) =>
                  setBulkEditAttributes((prev) => ({
                    ...prev,
                    purchaseDate: d,
                  }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Akhir Garansi
              </label>
              <DatePicker
                id="bulkWarrantyDate"
                selectedDate={bulkEditAttributes.warrantyEndDate}
                onDateChange={(d) =>
                  setBulkEditAttributes((prev) => ({
                    ...prev,
                    warrantyEndDate: d,
                  }))
                }
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan Tambahan
              </label>
              <textarea
                rows={2}
                className="block w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-primary-600 focus:border-primary-600"
                value={bulkEditAttributes.notes}
                onChange={(e) =>
                  setBulkEditAttributes((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                placeholder="Tambahkan catatan untuk semua aset terpilih..."
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal with Logic */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        title="Konfirmasi Hapus Massal"
        size="md"
        hideDefaultCloseButton
      >
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center w-14 h-14 mx-auto text-red-600 bg-red-100 rounded-full">
            <ExclamationTriangleIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Hapus {deletableAssets.length} Aset?
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Tindakan ini permanen dan tidak dapat diurungkan.
            </p>
          </div>

          <SelectedAssetsList
            assets={selectedAssetsObjects}
            onRemove={handleRemoveFromSelection}
          />

          {/* Enhanced Safety Check for large deletions */}
          {deletableAssets.length >= 5 && (
            <div className="text-left bg-red-50 p-4 rounded-lg border border-red-200">
              <label className="block text-xs font-bold text-red-800 mb-1 uppercase tracking-wide">
                Konfirmasi Keamanan
              </label>
              <p className="text-xs text-red-600 mb-2">
                Karena Anda menghapus banyak item ({deletableAssets.length}),
                silakan ketik <strong>DELETE</strong> untuk melanjutkan.
              </p>
              <input
                type="text"
                className="w-full px-3 py-2 border border-red-300 rounded focus:ring-red-500 focus:border-red-500 text-sm"
                value={bulkDeleteConfirmationText}
                onChange={(e) => setBulkDeleteConfirmationText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          )}

          {/* Smart Warning */}
          {lockedAssets.length > 0 && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-left text-sm">
              <p className="font-bold text-amber-800 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-4 h-4" />{" "}
                {lockedAssets.length} Aset Dilewati
              </p>
              <p className="text-amber-700 mt-1 text-xs">
                Aset berikut sedang digunakan (IN_USE / IN_CUSTODY /
                UNDER_REPAIR) dan tidak dapat dihapus:
              </p>
              <ul className="list-disc list-inside mt-1 text-xs text-amber-800 max-h-24 overflow-y-auto pl-2">
                {lockedAssets.map((a) => (
                  <li key={a.id}>
                    {a.name} ({a.id})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end pt-5 mt-5 space-x-3 border-t">
          <button
            onClick={() => setIsBulkDeleteModalOpen(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleBulkDelete}
            disabled={
              isLoading ||
              deletableAssets.length === 0 ||
              (deletableAssets.length >= 5 &&
                bulkDeleteConfirmationText !== "DELETE")
            }
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-danger rounded-lg shadow-sm hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading && <SpinnerIcon className="w-4 h-4 mr-2" />}
            {deletableAssets.length > 0
              ? `Ya, Hapus (${deletableAssets.length})`
              : "Tidak ada aset valid"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ItemRegistration;
