import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  Asset,
  AssetCategory,
  StockMovement,
  MovementType,
  AssetStatus,
  ActivityLogEntry,
  ItemStatus,
} from "../types";
import { assetsApi, stockApi, categoriesApi, unifiedApi } from "../services/api";
import { useNotificationStore } from "./useNotificationStore";
import { useMasterDataStore } from "./useMasterDataStore";
import { useAuthStore } from "./useAuthStore";
import { useRequestStore } from "./useRequestStore";

// --- INTERFACE DEFINITION ---
interface AssetState {
  assets: Asset[];
  categories: AssetCategory[];
  stockMovements: StockMovement[];
  thresholds: Record<string, number>;
  isLoading: boolean;

  // Asset Actions
  fetchAssets: () => Promise<void>;
  fetchCategories: () => Promise<void>; // Added explicit category fetch
  addAsset: (
    asset: Asset | (Asset & { initialBalance?: number; currentBalance?: number })
  ) => Promise<void>;
  updateAsset: (id: string, data: Partial<Asset>) => Promise<void>;
  updateAssetBatch: (ids: string[], data: Partial<Asset>, referenceId?: string) => Promise<void>;
  deleteAsset: (id: string) => Promise<void>;

  // Category Actions (NEW RESTFUL METHODS)
  createCategory: (data: Omit<AssetCategory, "id" | "types">) => Promise<AssetCategory>;
  updateCategoryDetails: (id: number, data: Partial<AssetCategory>) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  updateCategories: (categories: AssetCategory[]) => Promise<void>; // Keep for backward compatibility if needed

  updateThresholds: (thresholds: Record<string, number>) => void;

  // Stock Movement & Logic Actions
  recordMovement: (movement: Omit<StockMovement, "id" | "balanceAfter">) => Promise<void>;
  getStockHistory: (name: string, brand: string) => StockMovement[];
  getTechnicianStock: (technicianName: string) => Asset[];
  checkAvailability: (
    itemName: string,
    brand: string,
    qtyNeeded: number,
    requestUnit?: string,
    excludeRequestId?: string
  ) => {
    physicalCount: number;
    totalContent: number;
    reservedCount: number;
    reservedContent: number;
    availableCount: number;
    availableContent: number;
    availableSmart: number;
    isSufficient: boolean;
    isFragmented: boolean;
    isMeasurement: boolean;
    unitType: "container" | "base";
    containerUnit: string;
    baseUnit: string;
    recommendedSourceIds: string[];
  };
  validateStockForRequest: (
    items: {
      itemName: string;
      itemTypeBrand: string;
      quantity: number;
      unit?: string;
    }[],
    excludeRequestId?: string
  ) => { valid: boolean; errors: string[] };
  consumeMaterials: (
    materials: {
      materialAssetId?: string;
      itemName: string;
      brand: string;
      quantity: number;
      unit: string;
    }[],
    context: {
      customerId?: string;
      location?: string;
      docNumber?: string;
      technicianName?: string;
    }
  ) => Promise<{ success: boolean; errors: string[] }>;
}

// --- UTILITY: INTEGER ENFORCEMENT & SAFETY ---
const toInt = (num: number | undefined | null): number => {
  if (num === undefined || num === null || isNaN(num)) return 0;
  return Math.round(num);
};

const sanitizeBulkAsset = (
  asset: Asset | Partial<Asset>,
  categories: AssetCategory[],
  existingAsset?: Asset
): Asset | Partial<Asset> => {
  const categoryName = asset.category || existingAsset?.category;
  const typeName = asset.type || existingAsset?.type;
  if (!categoryName || !typeName) return asset;
  const category = categories.find((c) => c.name === categoryName);
  const type = category?.types.find((t) => t.name === typeName);
  if (type?.trackingMethod === "bulk") {
    return { ...asset, serialNumber: undefined, macAddress: undefined };
  }
  return asset;
};

// Helper Notifikasi
const notifyAdmins = (type: string, refId: string, message: string) => {
  const users = useMasterDataStore.getState().users;
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) return;

  users
    .filter((u) => u.role === "Admin Logistik" || u.role === "Super Admin")
    .forEach((admin) => {
      if (admin.id !== currentUser.id) {
        useNotificationStore.getState().addSystemNotification({
          recipientId: admin.id,
          actorName: currentUser.name,
          type: type,
          referenceId: refId,
          message: message,
        });
      }
    });
};

export const useAssetStore = create<AssetState>()(
  persist(
    (set, get) => ({
      assets: [],
      categories: [],
      stockMovements: [],
      thresholds: {},
      isLoading: false,

      // --- ASSET ACTIONS ---

      fetchAssets: async () => {
        set({ isLoading: true });
        try {
          const assets = await unifiedApi.refreshAssets();
          const categories = await unifiedApi.refreshCategories();
          set({
            assets,
            categories,
            isLoading: false,
          });
        } catch (error) {
          console.error("[AssetStore] fetchAssets failed:", error);
          set({ isLoading: false });
        }
      },

      fetchCategories: async () => {
        try {
          const categories = await unifiedApi.refreshCategories();
          set({ categories });
        } catch (error) {
          console.error("[AssetStore] fetchCategories failed:", error);
        }
      },

      addAsset: async (rawAsset) => {
        const asset = sanitizeBulkAsset(rawAsset, get().categories) as Asset;

        // STRICT INTEGER ENFORCEMENT ON BALANCE
        if ((rawAsset as any).initialBalance !== undefined) {
          asset.initialBalance = toInt((rawAsset as any).initialBalance);
          asset.currentBalance = toInt(
            (rawAsset as any).currentBalance ?? (rawAsset as any).initialBalance
          );
        }

        // STRICT INTEGER ON QUANTITY (For Bulk Count)
        if ((rawAsset as any).quantity) {
          (asset as any).quantity = toInt((rawAsset as any).quantity);
        }

        try {
          const newAsset = await assetsApi.create(asset);
          set((state) => ({ assets: [newAsset, ...state.assets] }));

          const category = get().categories.find((c) => c.name === asset.category);
          const type = category?.types.find((t) => t.name === asset.type);

          let logQty = 1;
          if (asset.initialBalance !== undefined) {
            logQty = asset.initialBalance;
          } else if (type?.trackingMethod === "bulk" && (rawAsset as any).quantity) {
            logQty = (rawAsset as any).quantity;
          }

          await get().recordMovement({
            assetName: asset.name,
            brand: asset.brand,
            date: asset.registrationDate,
            type: "IN_PURCHASE",
            quantity: logQty,
            referenceId: asset.poNumber || "Initial",
            actor: asset.recordedBy,
            notes: "Penerimaan barang baru",
            locationContext: "WAREHOUSE",
          });
        } catch (error) {
          console.error("[AssetStore] addAsset failed:", error);
          throw error;
        }
      },

      updateAsset: async (id, rawData) => {
        const current = get().assets;
        const originalAsset = current.find((a) => a.id === id);
        if (!originalAsset) return;

        const data = sanitizeBulkAsset(rawData, get().categories, originalAsset);

        if (data.currentBalance !== undefined) {
          data.currentBalance = Math.max(0, toInt(data.currentBalance));
        }
        if (data.initialBalance !== undefined) {
          data.initialBalance = Math.max(0, toInt(data.initialBalance));
        }

        try {
          const updatedAsset = await assetsApi.update(id, data as Partial<Asset>);
          set((state) => ({
            assets: state.assets.map((a) => (a.id === id ? updatedAsset : a)),
          }));

          if (originalAsset && data.status && data.status !== originalAsset.status) {
            let type: MovementType | null = null;
            const isMeasurement = originalAsset.currentBalance !== undefined;
            const qtyToLog = isMeasurement ? originalAsset.currentBalance || 0 : 1;

            if (
              originalAsset.status === AssetStatus.IN_STORAGE &&
              data.status !== AssetStatus.IN_STORAGE
            ) {
              if (data.status === AssetStatus.IN_USE) type = "OUT_INSTALLATION";
              else if (data.status === AssetStatus.DAMAGED) type = "OUT_BROKEN";
            } else if (
              originalAsset.status !== AssetStatus.IN_STORAGE &&
              data.status === AssetStatus.IN_STORAGE
            ) {
              type = "IN_RETURN";
            }

            if (type) {
              await get().recordMovement({
                assetName: originalAsset.name,
                brand: originalAsset.brand,
                date: new Date().toISOString(),
                type: type,
                quantity: qtyToLog,
                referenceId: (data as any).woRoIntNumber || "Status Update",
                actor: "System",
                notes: isMeasurement
                  ? `Perubahan status fisik (Log: ${qtyToLog} Base Unit): ${originalAsset.status} -> ${data.status}`
                  : `Perubahan status: ${originalAsset.status} -> ${data.status}`,
              });
            }

            if (data.status === AssetStatus.DAMAGED) {
              notifyAdmins(
                "ASSET_DAMAGED_REPORT",
                id,
                `melaporkan kerusakan pada aset ${originalAsset.name}`
              );
            }
          }
        } catch (error) {
          console.error("[AssetStore] updateAsset failed:", error);
          throw error;
        }
      },

      updateAssetBatch: async (ids, rawData, referenceId = "Batch Update") => {
        const current = get().assets;
        const currentUser = useAuthStore.getState().currentUser?.name || "System";
        const movementsToLog: Omit<StockMovement, "id" | "balanceAfter">[] = [];

        const updated = current.map((a) => {
          if (ids.includes(a.id)) {
            const isMovingOut =
              a.status === AssetStatus.IN_STORAGE &&
              rawData.status &&
              rawData.status !== AssetStatus.IN_STORAGE;
            const isMovingIn =
              a.status !== AssetStatus.IN_STORAGE && rawData.status === AssetStatus.IN_STORAGE;

            if (isMovingOut || isMovingIn) {
              const isMeasurement = a.currentBalance !== undefined;
              const qtyToLog = isMeasurement ? a.currentBalance || 0 : 1;

              movementsToLog.push({
                assetName: a.name,
                brand: a.brand,
                date: new Date().toISOString(),
                type: isMovingOut ? "OUT_HANDOVER" : "IN_RETURN",
                quantity: qtyToLog,
                referenceId: referenceId,
                actor: currentUser,
                notes: isMeasurement
                  ? `Batch Move (${isMovingOut ? "Keluar" : "Masuk"}): ${a.id} berisi ${qtyToLog}`
                  : `Batch Move: ${a.id}`,
                locationContext: isMovingOut ? "WAREHOUSE" : "CUSTODY",
              });
            }

            const newLog: ActivityLogEntry = {
              id: `log-batch-${Date.now()}-${Math.random()}`,
              timestamp: new Date().toISOString(),
              user: currentUser,
              action: "Batch Update",
              details: `Status diubah menjadi: ${rawData.status || "Updated"} (Ref: ${referenceId})`,
            };

            return {
              ...a,
              ...rawData,
              activityLog: [...(a.activityLog || []), newLog],
            };
          }
          return a;
        });

        try {
          await Promise.all(
            ids.map((id) => {
              const asset = updated.find((a) => a.id === id);
              if (asset) return assetsApi.update(id, rawData);
            })
          );
          set({ assets: updated });

          for (const mov of movementsToLog) {
            await get().recordMovement(mov);
          }
        } catch (error) {
          console.error("[AssetStore] updateAssetBatch failed:", error);
          throw error;
        }
      },

      deleteAsset: async (id) => {
        const current = get().assets;
        const assetToDelete = current.find((a) => a.id === id);

        try {
          await assetsApi.delete(id);
          set((state) => ({ assets: state.assets.filter((a) => a.id !== id) }));

          if (assetToDelete && assetToDelete.status === "Di Gudang") {
            const isMeasurement = assetToDelete.currentBalance !== undefined;
            const qtyToLog = isMeasurement ? assetToDelete.currentBalance || 0 : 1;

            await get().recordMovement({
              assetName: assetToDelete.name,
              brand: assetToDelete.brand,
              date: new Date().toISOString(),
              type: "OUT_ADJUSTMENT",
              quantity: qtyToLog,
              referenceId: "DELETE",
              actor: "System",
              notes: "Aset dihapus dari sistem",
            });
          }
        } catch (error) {
          console.error("[AssetStore] deleteAsset failed:", error);
          throw error;
        }
      },

      // --- CATEGORY ACTIONS (UPDATED) ---

      // ... di dalam src/stores/useAssetStore.ts ...

      createCategory: async (data) => {
        try {
          // 1. Kirim data ke API (tanpa 'types' agar tidak ditolak Backend)
          const response = await categoriesApi.create(data as any);

          // 2. NORMALISASI DATA (FIX CRASH)
          // Backend mengembalikan object tanpa 'types'.
          // Kita harus memastikannya ada sebelum masuk ke State Frontend.
          const newCategory = {
            ...response,
            types: response.types || [], // <--- INI KUNCI PERBAIKANNYA
            associatedDivisions: response.associatedDivisions || [],
          };

          // 3. Update State dengan data yang sudah aman
          set((state) => ({
            categories: [...state.categories, newCategory],
          }));

          return newCategory;
        } catch (error) {
          console.error("[AssetStore] createCategory failed:", error);
          throw error;
        }
      },

      updateCategoryDetails: async (id, data) => {
        // Panggil endpoint PATCH /api/v1/categories/:id
        try {
          const updatedCategory = await categoriesApi.update(id, data);
          set((state) => ({
            categories: state.categories.map((c) => (c.id === id ? updatedCategory : c)),
          }));
        } catch (error) {
          console.error("[AssetStore] updateCategoryDetails failed:", error);
          throw error;
        }
      },

      deleteCategory: async (id) => {
        // Panggil endpoint DELETE /api/v1/categories/:id
        try {
          await categoriesApi.delete(id);
          set((state) => ({
            categories: state.categories.filter((c) => c.id !== id),
          }));
        } catch (error) {
          console.error("[AssetStore] deleteCategory failed:", error);
          throw error;
        }
      },

      updateCategories: async (categories) => {
        // Deprecated: Bulk update (PUT)
        try {
          await categoriesApi.updateAll(categories);
          set({ categories });
        } catch (error) {
          console.error("[AssetStore] updateCategories failed:", error);
          throw error;
        }
      },

      // --- LOGIC & HELPERS ---

      updateThresholds: (thresholds) => {
        set({ thresholds });
      },

      recordMovement: async (movementData) => {
        const finalMovement = {
          ...movementData,
          quantity: Math.max(0, toInt(movementData.quantity)),
        };
        try {
          const newMovement = await stockApi.recordMovement(finalMovement);
          set((state) => ({
            stockMovements: [newMovement, ...state.stockMovements],
          }));
        } catch (error) {
          console.error("[AssetStore] recordMovement failed:", error);
        }
      },

      getStockHistory: (name, brand) => {
        return get()
          .stockMovements.filter((m) => m.assetName === name && m.brand === brand)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getTechnicianStock: (technicianName) => {
        return get().assets.filter(
          (a) =>
            (a.status === AssetStatus.IN_CUSTODY || a.status === AssetStatus.IN_USE) &&
            a.currentUser === technicianName
        );
      },

      checkAvailability: (itemName, brand, qtyNeeded, requestUnit, excludeRequestId) => {
        const assets = get().assets;
        const categories = get().categories;
        const requests = useRequestStore.getState().requests;

        const qtyNeededInt = Math.ceil(qtyNeeded);

        let isMeasurement = false;
        let containerUnit = "Unit";
        let baseUnit = "Unit";

        for (const cat of categories) {
          for (const typ of cat.types) {
            const model = typ.standardItems?.find((m) => m.name === itemName && m.brand === brand);
            if (model) {
              if (model.bulkType === "measurement") {
                isMeasurement = true;
                containerUnit = model.unitOfMeasure || "Hasbal";
                baseUnit = model.baseUnitOfMeasure || "Meter";
              } else {
                containerUnit = model.unitOfMeasure || typ.unitOfMeasure || "Unit";
              }
              break;
            }
          }
          if (isMeasurement) break;
        }

        const isRequestingContainer = !requestUnit || requestUnit === containerUnit;

        const allPhysicalAssets = assets.filter(
          (a) => a.name === itemName && a.brand === brand && a.status === AssetStatus.IN_STORAGE
        );

        let effectivePhysicalAssets = allPhysicalAssets;

        if (isMeasurement && isRequestingContainer) {
          effectivePhysicalAssets = allPhysicalAssets.filter((a) => {
            const current = a.currentBalance ?? 0;
            const initial = a.initialBalance ?? 0;
            return current >= initial - 0.0001;
          });
        }

        const totalPhysicalCount = allPhysicalAssets.length;
        const totalPhysicalContent = toInt(
          allPhysicalAssets.reduce((sum, a) => sum + (a.currentBalance ?? 0), 0)
        );

        const activeRequests = requests.filter(
          (r) =>
            r.id !== excludeRequestId &&
            ![ItemStatus.COMPLETED, ItemStatus.REJECTED, ItemStatus.CANCELLED].includes(r.status)
        );

        let reservedCount = 0;
        let reservedContent = 0;

        activeRequests.forEach((req) => {
          const matchingItems = req.items.filter(
            (i) => i.itemName === itemName && i.itemTypeBrand === brand
          );
          matchingItems.forEach((item) => {
            const status = req.itemStatuses?.[item.id];
            if (status?.status === "stock_allocated") {
              const qty = toInt(status.approvedQuantity ?? item.quantity);
              const itemUnit = item.unit || "Unit";

              if (isMeasurement) {
                if (itemUnit === containerUnit) {
                  reservedCount += qty;
                } else {
                  reservedContent += qty;
                }
              } else {
                reservedCount += qty;
              }
            }
          });
        });

        reservedContent = toInt(reservedContent);

        const availableCount = Math.max(0, effectivePhysicalAssets.length - reservedCount);

        const sortedAssets = [...effectivePhysicalAssets].sort((a, b) => {
          if (isMeasurement && !isRequestingContainer) {
            const aIsPartial = (a.currentBalance ?? 0) < (a.initialBalance ?? 0);
            const bIsPartial = (b.currentBalance ?? 0) < (b.initialBalance ?? 0);
            if (aIsPartial && !bIsPartial) return -1;
            if (!aIsPartial && bIsPartial) return 1;
          }
          return new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime();
        });

        const assetsAvailableForAllocation = sortedAssets.slice(reservedCount);

        const rawAvailableContentSum = assetsAvailableForAllocation.reduce(
          (sum, a) => sum + (a.currentBalance ?? 0),
          0
        );
        const availableContent = Math.max(0, toInt(rawAvailableContentSum - reservedContent));

        let isSufficient = false;
        let isFragmented = false;
        let recommendedSourceIds: string[] = [];

        if (isMeasurement) {
          if (isRequestingContainer) {
            isSufficient = availableCount >= qtyNeededInt;
            recommendedSourceIds = assetsAvailableForAllocation
              .slice(0, qtyNeededInt)
              .map((a) => a.id);
          } else {
            isSufficient = availableContent >= qtyNeededInt;
            const perfectFit = assetsAvailableForAllocation.find(
              (a) => (a.currentBalance ?? 0) >= qtyNeededInt
            );

            if (!perfectFit && isSufficient) {
              isFragmented = true;
            }

            if (perfectFit) {
              recommendedSourceIds = [perfectFit.id];
            } else {
              let accumulated = 0;
              for (const a of assetsAvailableForAllocation) {
                if (accumulated >= qtyNeededInt) break;
                recommendedSourceIds.push(a.id);
                accumulated += a.currentBalance ?? 0;
              }
            }
          }
        } else {
          isSufficient = availableCount >= qtyNeededInt;
          recommendedSourceIds = assetsAvailableForAllocation
            .slice(0, qtyNeededInt)
            .map((a) => a.id);
        }

        return {
          physicalCount: totalPhysicalCount,
          totalContent: totalPhysicalContent,
          reservedCount,
          reservedContent,
          availableCount,
          availableContent,
          availableSmart: isMeasurement
            ? isRequestingContainer
              ? availableCount
              : availableContent
            : availableCount,
          isSufficient,
          isFragmented,
          isMeasurement,
          unitType: isRequestingContainer ? "container" : "base",
          containerUnit,
          baseUnit,
          recommendedSourceIds,
        };
      },

      validateStockForRequest: (items, excludeRequestId) => {
        const errors: string[] = [];
        const self = get();
        items.forEach((item) => {
          const check = self.checkAvailability(
            item.itemName,
            item.itemTypeBrand,
            item.quantity,
            item.unit,
            excludeRequestId
          );
          if (!check.isSufficient) {
            const unitLabel = check.unitType === "container" ? check.containerUnit : check.baseUnit;
            const avail = check.availableSmart;
            errors.push(
              `${item.itemName}: Stok tidak cukup (Butuh: ${item.quantity} ${unitLabel}, Ada: ${avail} ${unitLabel})`
            );
          }
        });
        return { valid: errors.length === 0, errors };
      },

      consumeMaterials: async (materials, context) => {
        // ... (KODE consumeMaterials TIDAK SAYA UBAH KARENA SUDAH BENAR & PANJANG) ...
        // ... (Silakan copy-paste logika consumeMaterials dari kode Anda sebelumnya) ...
        const { assets, categories } = get();
        const errors: string[] = [];

        const actorName =
          context.technicianName || useAuthStore.getState().currentUser?.name || "System";

        type PlannedUpdate = {
          assetId: string;
          updates: Partial<Asset>;
          movementLog: Omit<StockMovement, "id" | "balanceAfter">;
        };

        const plan: PlannedUpdate[] = [];
        const tempBalances: Record<string, number> = {};

        for (const mat of materials) {
          let isBulk = false;
          let isMeasurement = false;

          for (const cat of categories) {
            for (const type of cat.types) {
              const model = type.standardItems?.find(
                (i) => i.name === mat.itemName && i.brand === mat.brand
              );
              if (model) {
                if (type.trackingMethod === "bulk") isBulk = true;
                if (model.bulkType === "measurement") isMeasurement = true;
                break;
              }
            }
            if (isBulk) break;
          }

          const qtyToDeduct = Math.ceil(mat.quantity);
          let targetAssets: Asset[] = [];

          // SMART LOGIC: Auto-Detect Source
          if (mat.materialAssetId) {
            const specificAsset = assets.find((a) => a.id === mat.materialAssetId);
            if (specificAsset) {
              targetAssets = [specificAsset];
            } else {
              errors.push(
                `Stok spesifik ${mat.materialAssetId} (${mat.itemName}) tidak valid/ditemukan.`
              );
              continue;
            }
          } else {
            targetAssets = assets
              .filter((a) => {
                const isMatch = a.name === mat.itemName && a.brand === mat.brand;
                if (!isMatch) return false;

                const isTechnicianCustody =
                  a.currentUser === actorName &&
                  (a.status === AssetStatus.IN_CUSTODY || a.status === AssetStatus.IN_USE);

                const isInStorage = a.status === AssetStatus.IN_STORAGE;

                return isTechnicianCustody || isInStorage;
              })
              .sort((a, b) => {
                const aIsOwn = a.currentUser === actorName;
                const bIsOwn = b.currentUser === actorName;
                if (aIsOwn && !bIsOwn) return -1;
                if (!aIsOwn && bIsOwn) return 1;

                if (isMeasurement) {
                  const aPartial = (a.currentBalance ?? 0) < (a.initialBalance ?? 0);
                  const bPartial = (b.currentBalance ?? 0) < (b.initialBalance ?? 0);
                  if (aPartial && !bPartial) return -1;
                  if (!aPartial && bPartial) return 1;
                }

                return (
                  new Date(a.registrationDate).getTime() - new Date(b.registrationDate).getTime()
                );
              });
          }

          if (targetAssets.length === 0) {
            errors.push(
              `Stok ${mat.itemName} tidak tersedia untuk teknisi ${actorName} maupun di Gudang.`
            );
            continue;
          }

          if (isBulk) {
            let remainingNeed = qtyToDeduct;

            for (const asset of targetAssets) {
              if (remainingNeed <= 0) break;

              const currentEffectiveBalance =
                tempBalances[asset.id] !== undefined
                  ? tempBalances[asset.id]
                  : (asset.currentBalance ?? asset.initialBalance ?? 0);

              if (currentEffectiveBalance <= 0) continue;

              const isFromCustody =
                asset.status === AssetStatus.IN_CUSTODY ||
                (asset.status === AssetStatus.IN_USE && asset.currentUser === actorName);

              const movementType = isFromCustody ? "OUT_USAGE_CUSTODY" : "OUT_INSTALLATION";
              const locationContext = isFromCustody ? "CUSTODY" : "WAREHOUSE";

              let usedAmount = 0;
              const updates: Partial<Asset> = {};

              if (currentEffectiveBalance > remainingNeed) {
                const newBalance = toInt(currentEffectiveBalance - remainingNeed);
                updates.currentBalance = newBalance;
                tempBalances[asset.id] = newBalance;
                usedAmount = remainingNeed;
                remainingNeed = 0;
              } else {
                updates.currentBalance = 0;
                updates.status = AssetStatus.CONSUMED;
                tempBalances[asset.id] = 0;

                usedAmount = toInt(currentEffectiveBalance);
                remainingNeed = toInt(remainingNeed - currentEffectiveBalance);
              }

              plan.push({
                assetId: asset.id,
                updates,
                movementLog: {
                  assetName: mat.itemName,
                  brand: mat.brand,
                  date: new Date().toISOString(),
                  type: movementType,
                  quantity: usedAmount,
                  referenceId: context.docNumber || "Usage",
                  actor: actorName,
                  notes: `Digunakan: ${usedAmount} ${mat.unit} (${context.location})`,
                  locationContext: locationContext,
                  relatedAssetId: asset.id,
                },
              });
            }

            if (remainingNeed > 0) {
              errors.push(`Stok fisik ${mat.itemName} kurang ${remainingNeed} ${mat.unit}.`);
            }
          } else {
            const qtyToConsume = Math.min(qtyToDeduct, targetAssets.length);
            if (qtyToConsume < qtyToDeduct) {
              errors.push(
                `Stok fisik ${mat.itemName} kurang ${qtyToDeduct - qtyToConsume} ${mat.unit}.`
              );
            } else {
              const itemsToUpdate = targetAssets.slice(0, qtyToConsume);
              for (const item of itemsToUpdate) {
                if (plan.some((p) => p.assetId === item.id)) {
                  errors.push(
                    `Item ${item.id} (${item.name}) terpilih ganda dalam transaksi ini. Stok tidak cukup.`
                  );
                  break;
                }

                const isFromCustody =
                  item.status === AssetStatus.IN_CUSTODY ||
                  (item.status === AssetStatus.IN_USE && item.currentUser === actorName);
                const locationContext = isFromCustody ? "CUSTODY" : "WAREHOUSE";

                plan.push({
                  assetId: item.id,
                  updates: {
                    status: AssetStatus.IN_USE,
                    currentUser: context.customerId || null,
                    location: context.location || "Digunakan",
                  },
                  movementLog: {
                    assetName: mat.itemName,
                    brand: mat.brand,
                    date: new Date().toISOString(),
                    type: "OUT_INSTALLATION",
                    quantity: 1,
                    referenceId: context.docNumber || "Usage",
                    actor: actorName,
                    notes: `Unit ${item.id} digunakan di ${context.location}`,
                    locationContext: locationContext,
                    relatedAssetId: item.id,
                  },
                });
              }
            }
          }
        }

        if (errors.length > 0) {
          return { success: false, errors };
        }

        const currentAssets = get().assets;
        const updatedAssets = currentAssets.map((a) => {
          const assetPlans = plan.filter((p) => p.assetId === a.id);
          if (assetPlans.length === 0) return a;

          let mergedUpdates = {};
          assetPlans.forEach((p) => {
            mergedUpdates = { ...mergedUpdates, ...p.updates };
          });

          return { ...a, ...mergedUpdates };
        });

        try {
          const idsToUpdate = plan.map((p) => p.assetId);
          await Promise.all(
            idsToUpdate.map((id) => {
              const asset = updatedAssets.find((a) => a.id === id);
              if (asset) {
                const planForAsset = plan.filter((p) => p.assetId === id);
                let mergedUpdates = {};
                planForAsset.forEach((p) => (mergedUpdates = { ...mergedUpdates, ...p.updates }));
                return assetsApi.update(id, mergedUpdates);
              }
            })
          );
          set({ assets: updatedAssets });

          for (const p of plan) {
            await get().recordMovement(p.movementLog);
          }

          return { success: true, errors: [] };
        } catch (error) {
          console.error("[AssetStore] consumeMaterials failed:", error);
          return { success: false, errors: ["Gagal menyimpan perubahan"] };
        }
      },
    }),
    {
      name: "asset-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        categories: state.categories,
        thresholds: state.thresholds,
      }),
    }
  )
);
