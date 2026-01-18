import { create } from "zustand";
import {
  Handover,
  Dismantle,
  Maintenance,
  Installation,
  ItemStatus,
  AssetStatus,
  AssetCondition,
  CustomerStatus,
} from "../types";
import {
  handoversApi,
  installationsApi,
  maintenancesApi,
  dismantlesApi,
  unifiedApi,
} from "../services/api";
import { useNotificationStore } from "./useNotificationStore";
import { useMasterDataStore } from "./useMasterDataStore";
import { useAssetStore } from "./useAssetStore";
import { useAuthStore } from "./useAuthStore";

interface TransactionState {
  handovers: Handover[];
  dismantles: Dismantle[];
  maintenances: Maintenance[];
  installations: Installation[];
  isLoading: boolean;

  fetchTransactions: () => Promise<void>;
  refreshAll: () => Promise<void>;

  addHandover: (handover: Handover) => Promise<void>;
  deleteHandover: (id: string) => Promise<void>;

  addDismantle: (dismantle: Dismantle) => Promise<void>;
  updateDismantle: (id: string, data: Partial<Dismantle>) => Promise<void>;
  deleteDismantle: (id: string) => Promise<void>;

  addMaintenance: (maintenance: Maintenance) => Promise<void>;
  updateMaintenance: (id: string, data: Partial<Maintenance>) => Promise<void>;
  deleteMaintenance: (id: string) => Promise<void>;

  addInstallation: (installation: Installation) => Promise<void>;
  deleteInstallation: (id: string) => Promise<void>;
}

const notifyRecipient = (
  userName: string,
  type: string,
  refId: string,
  message: string,
) => {
  const users = useMasterDataStore.getState().users;
  const currentUser = useAuthStore.getState().currentUser;
  const recipient = users.find((u) => u.name === userName);

  if (recipient && currentUser) {
    useNotificationStore.getState().addSystemNotification({
      recipientId: recipient.id,
      actorName: currentUser.name,
      type: type,
      referenceId: refId,
      message: message,
    });
  }
};

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

export const useTransactionStore = create<TransactionState>((set, get) => ({
  handovers: [],
  dismantles: [],
  maintenances: [],
  installations: [],
  isLoading: false,

  refreshAll: async () => {
    await get().fetchTransactions();
  },

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const data = await unifiedApi.refreshTransactions();
      set({
        handovers: data.handovers,
        dismantles: data.dismantles,
        maintenances: data.maintenances,
        installations: data.installations,
        isLoading: false,
      });
    } catch (error) {
      console.error("[TransactionStore] fetchTransactions failed:", error);
      set({ isLoading: false });
    }
  },

  addHandover: async (handover) => {
    try {
      const createdHandover = await handoversApi.create(handover);
      set((state) => ({ handovers: [createdHandover, ...state.handovers] }));
      notifyRecipient(
        createdHandover.penerima,
        "ASSET_HANDED_OVER",
        createdHandover.id,
        `menyerahkan ${createdHandover.items.length} item aset kepada Anda.`,
      );
    } catch (error) {
      console.error("[TransactionStore] addHandover failed:", error);
      throw error;
    }
  },

  deleteHandover: async (id) => {
    try {
      await handoversApi.delete(id);
      set((state) => ({
        handovers: state.handovers.filter((h) => h.id !== id),
      }));
    } catch (error) {
      console.error("[TransactionStore] deleteHandover failed:", error);
      throw error;
    }
  },

  addDismantle: async (dismantle) => {
    try {
      const createdDismantle = await dismantlesApi.create(dismantle);
      set((state) => ({ dismantles: [createdDismantle, ...state.dismantles] }));
      notifyAdmins(
        "STATUS_CHANGE",
        createdDismantle.id,
        `melakukan dismantle aset dari pelanggan ${createdDismantle.customerName}`,
      );
    } catch (error) {
      console.error("[TransactionStore] addDismantle failed:", error);
      throw error;
    }
  },

  // INTELLIGENT DISMANTLE UPDATE
  updateDismantle: async (id, data) => {
    const oldDismantle = get().dismantles.find((d) => d.id === id);

    try {
      const updatedDismantle = await dismantlesApi.update(id, data);
      set((state) => ({
        dismantles: state.dismantles.map((d) =>
          d.id === id ? updatedDismantle : d,
        ),
      }));

      // Jika Status COMPLETED, jalankan logika pengembalian stok cerdas
      if (data.status === ItemStatus.COMPLETED && oldDismantle) {
        const { updateAsset, assets } = useAssetStore.getState();
        const { updateCustomer } = useMasterDataStore.getState();

        // 1. Tentukan Status Target berdasarkan Kondisi
        const isGood = [
          AssetCondition.GOOD,
          AssetCondition.USED_OKAY,
          AssetCondition.BRAND_NEW,
        ].includes(oldDismantle.retrievedCondition);
        const targetStatus = isGood
          ? AssetStatus.IN_STORAGE
          : AssetStatus.DAMAGED;

        await updateAsset(oldDismantle.assetId, {
          status: targetStatus,
          condition: oldDismantle.retrievedCondition,
          currentUser: null,
          location: isGood ? "Gudang Inventori" : "Gudang (Rusak)",
          isDismantled: true,
          dismantleInfo: {
            customerId: oldDismantle.customerId,
            customerName: oldDismantle.customerName,
            dismantleDate: oldDismantle.dismantleDate,
            dismantleId: oldDismantle.id,
          },
        });

        // 2. Cek status pelanggan (apakah masih ada aset lain?)
        const remainingAssets = assets.filter(
          (a) =>
            a.currentUser === oldDismantle.customerId &&
            a.status === AssetStatus.IN_USE &&
            a.id !== oldDismantle.assetId,
        );

        if (remainingAssets.length === 0) {
          await updateCustomer(oldDismantle.customerId, {
            status: CustomerStatus.INACTIVE,
          });
          useNotificationStore
            .getState()
            .addToast(
              "Status pelanggan otomatis diubah menjadi Non-Aktif karena tidak ada aset tersisa.",
              "info",
            );
        }
      }
    } catch (error) {
      console.error("[TransactionStore] updateDismantle failed:", error);
      throw error;
    }
  },

  deleteDismantle: async (id) => {
    try {
      await dismantlesApi.delete(id);
      set((state) => ({
        dismantles: state.dismantles.filter((d) => d.id !== id),
      }));
    } catch (error) {
      console.error("[TransactionStore] deleteDismantle failed:", error);
      throw error;
    }
  },

  addMaintenance: async (maintenance) => {
    try {
      const createdMaintenance = await maintenancesApi.create(maintenance);
      set((state) => ({
        maintenances: [createdMaintenance, ...state.maintenances],
      }));

      if (createdMaintenance.priority === "Tinggi") {
        notifyAdmins(
          "REPAIR_STARTED",
          createdMaintenance.id,
          `membuat tiket maintenance PRIORITAS TINGGI`,
        );
      }
    } catch (error) {
      console.error("[TransactionStore] addMaintenance failed:", error);
      throw error;
    }
  },

  updateMaintenance: async (id, data) => {
    try {
      const updatedMaintenance = await maintenancesApi.update(id, data);
      set((state) => ({
        maintenances: state.maintenances.map((m) =>
          m.id === id ? updatedMaintenance : m,
        ),
      }));

      if (data.status === ItemStatus.COMPLETED) {
        notifyAdmins(
          "REPAIR_COMPLETED",
          id,
          "telah menyelesaikan tiket maintenance",
        );
      }
    } catch (error) {
      console.error("[TransactionStore] updateMaintenance failed:", error);
      throw error;
    }
  },

  deleteMaintenance: async (id) => {
    try {
      await maintenancesApi.delete(id);
      set((state) => ({
        maintenances: state.maintenances.filter((m) => m.id !== id),
      }));
    } catch (error) {
      console.error("[TransactionStore] deleteMaintenance failed:", error);
      throw error;
    }
  },

  addInstallation: async (installation) => {
    try {
      const createdInstallation = await installationsApi.create(installation);
      set((state) => ({
        installations: [createdInstallation, ...state.installations],
      }));
      notifyAdmins(
        "STATUS_CHANGE",
        createdInstallation.id,
        `telah menyelesaikan instalasi di ${createdInstallation.customerName}`,
      );
    } catch (error) {
      console.error("[TransactionStore] addInstallation failed:", error);
      throw error;
    }
  },

  deleteInstallation: async (id) => {
    try {
      await installationsApi.delete(id);
      set((state) => ({
        installations: state.installations.filter((i) => i.id !== id),
      }));
    } catch (error) {
      console.error("[TransactionStore] deleteInstallation failed:", error);
      throw error;
    }
  },
}));
