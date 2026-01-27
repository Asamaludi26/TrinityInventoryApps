import { create } from "zustand";
import {
  Request,
  LoanRequest,
  AssetReturn,
  ItemStatus,
  LoanRequestStatus,
  AssetReturnStatus,
  AssetStatus,
  AssetCondition,
} from "../types";
import { requestsApi, loansApi, returnsApi, unifiedApi } from "../services/api";
import { useNotificationStore } from "./useNotificationStore";
import { useUIStore } from "./useUIStore";
import { useMasterDataStore } from "./useMasterDataStore";
import { useAssetStore } from "./useAssetStore";
import { generateDocumentNumber } from "../utils/documentNumberGenerator";
import { useAuthStore } from "./useAuthStore";

interface RequestState {
  requests: Request[];
  loanRequests: LoanRequest[];
  returns: AssetReturn[];
  isLoading: boolean;

  fetchRequests: () => Promise<void>;
  addRequest: (
    request: Omit<
      Request,
      | "id"
      | "status"
      | "docNumber"
      | "logisticApprover"
      | "logisticApprovalDate"
      | "finalApprover"
      | "finalApprovalDate"
      | "rejectionReason"
      | "rejectedBy"
      | "rejectionDate"
      | "rejectedByDivision"
    >
  ) => Promise<void>;
  updateRequest: (id: string, data: Partial<Request>) => Promise<void>;
  deleteRequest: (id: string) => Promise<void>;
  updateRequestRegistration: (requestId: string, itemId: number, count: number) => Promise<boolean>;

  addLoanRequest: (request: LoanRequest) => Promise<void>;
  updateLoanRequest: (id: string, data: Partial<LoanRequest>) => Promise<void>;
  deleteLoanRequest: (id: string) => Promise<void>;
  approveLoanRequest: (
    id: string,
    payload: {
      approver: string;
      approvalDate: string;
      // FIX: Ganti any dengan Record<number, string[]>
      assignedAssetIds: Record<number, string[]>;
      // FIX: Ganti any dengan struktur status item yang valid
      itemStatuses: Record<
        number,
        {
          status: "approved" | "rejected" | "partial";
          reason?: string;
          approvedQuantity?: number;
        }
      >;
    }
  ) => Promise<void>;

  addReturn: (returnData: AssetReturn) => Promise<void>;
  updateReturn: (id: string, data: Partial<AssetReturn>) => Promise<void>;

  processReturnBatch: (
    returnDocId: string,
    acceptedAssetIds: string[],
    approverName: string
  ) => Promise<void>;
  submitReturnRequest: (
    loanRequestId: string,
    returnItems: {
      assetId: string;
      condition: AssetCondition;
      notes: string;
    }[]
  ) => Promise<void>;
}

const sendSystemNotif = (
  recipientRoleOrName: string,
  type: string,
  refId: string,
  message: string,
  isRole = false
) => {
  const users = useMasterDataStore.getState().users;
  const currentUser = useAuthStore.getState().currentUser;
  const addNotif = useNotificationStore.getState().addSystemNotification;

  if (!currentUser) return;

  let recipients: typeof users = [];

  if (isRole) {
    recipients = users.filter(
      (u) =>
        u.role === recipientRoleOrName ||
        (recipientRoleOrName === "Admin" &&
          ["Admin Logistik", "Admin Purchase", "Super Admin"].includes(u.role))
    );
  } else {
    const user = users.find((u) => u.name === recipientRoleOrName);
    if (user) recipients = [user];
  }

  recipients.forEach((target) => {
    if (target.id !== currentUser.id) {
      addNotif({
        recipientId: target.id,
        actorName: currentUser.name,
        type: type,
        referenceId: refId,
        message: message,
      });
    }
  });
};

export const useRequestStore = create<RequestState>((set, get) => ({
  requests: [],
  loanRequests: [],
  returns: [],
  isLoading: false,

  fetchRequests: async () => {
    set({ isLoading: true });
    try {
      const [requests, loanRequests, returnsData] = await Promise.all([
        unifiedApi.refreshRequests(),
        unifiedApi.refreshLoanRequests(),
        returnsApi.getAll().catch(() => [] as AssetReturn[]),
      ]);

      set({
        requests,
        loanRequests,
        returns: returnsData,
        isLoading: false,
      });
    } catch (error) {
      console.error("[RequestStore] fetchRequests failed:", error);
      set({ isLoading: false });
    }
  },

  addRequest: async (requestData) => {
    // Backend handles: doc number generation, stock checking, status calculation
    // Frontend only sends the raw input data
    try {
      const createdRequest = await requestsApi.create(requestData);
      set((state) => ({ requests: [createdRequest, ...state.requests] }));

      // Send notifications based on the status returned by backend
      const status = createdRequest.status;

      if (status === ItemStatus.AWAITING_HANDOVER) {
        sendSystemNotif(
          "Admin Logistik",
          "REQUEST_CREATED",
          createdRequest.id,
          "membuat request (Stok Tersedia, Siap Handover)",
          true
        );
        useNotificationStore
          .getState()
          .addToast(
            "Request dibuat. Stok tersedia, silakan hubungi Logistik untuk pengambilan.",
            "success"
          );
      } else if (status === ItemStatus.COMPLETED) {
        useNotificationStore
          .getState()
          .addToast("Request selesai otomatis (Stok Restock Tersedia).", "success");
      } else {
        sendSystemNotif(
          "Admin Logistik",
          "REQUEST_CREATED",
          createdRequest.id,
          "membuat permintaan aset baru (Butuh Pengadaan/Review)",
          true
        );
        useNotificationStore
          .getState()
          .addToast("Request berhasil dibuat dan menunggu persetujuan.", "success");
      }
      sendSystemNotif(
        "Super Admin",
        "REQUEST_CREATED",
        createdRequest.id,
        "membuat permintaan aset baru",
        true
      );
    } catch (error) {
      console.error("[RequestStore] addRequest failed:", error);
      throw error;
    }
  },

  updateRequest: async (id, data) => {
    try {
      const updatedRequest = await requestsApi.update(id, data);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? updatedRequest : r)),
      }));

      const oldRequest = get().requests.find((r) => r.id === id);
      if (oldRequest && data.status && oldRequest.status !== data.status) {
        const requester = oldRequest.requester;
        if (data.status === ItemStatus.LOGISTIC_APPROVED) {
          sendSystemNotif(
            "Admin Purchase",
            "REQUEST_LOGISTIC_APPROVED",
            id,
            "menyetujui tahap logistik, mohon proses pembelian",
            true
          );
          sendSystemNotif(requester, "STATUS_CHANGE", id, "telah disetujui oleh Logistik", false);
        } else if (data.status === ItemStatus.AWAITING_CEO_APPROVAL) {
          sendSystemNotif(
            "Super Admin",
            "REQUEST_AWAITING_FINAL_APPROVAL",
            id,
            "membutuhkan persetujuan final",
            true
          );
        } else if (data.status === ItemStatus.APPROVED) {
          sendSystemNotif(
            "Admin Purchase",
            "REQUEST_FULLY_APPROVED",
            id,
            "telah disetujui final. Silakan proses PO",
            true
          );
          sendSystemNotif(requester, "REQUEST_APPROVED", id, "telah disetujui sepenuhnya", false);
        } else if (data.status === ItemStatus.REJECTED) {
          sendSystemNotif(
            requester,
            "REQUEST_REJECTED",
            id,
            `telah ditolak. Alasan: ${data.rejectionReason || "-"}`,
            false
          );
        } else if (data.status === ItemStatus.ARRIVED) {
          sendSystemNotif(
            "Admin Logistik",
            "STATUS_CHANGE",
            id,
            "Barang telah tiba. Mohon catat aset.",
            true
          );
          sendSystemNotif(
            requester,
            "STATUS_CHANGE",
            id,
            "Barang pesanan telah tiba di gudang",
            false
          );
        }
      }
    } catch (error) {
      console.error("[RequestStore] updateRequest failed:", error);
      throw error;
    }
  },

  deleteRequest: async (id) => {
    try {
      await requestsApi.delete(id);
      set((state) => ({
        requests: state.requests.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error("[RequestStore] deleteRequest failed:", error);
      throw error;
    }
  },

  updateRequestRegistration: async (requestId, itemId, count) => {
    const currentRequests = get().requests;
    const requestIndex = currentRequests.findIndex((r) => r.id === requestId);
    if (requestIndex === -1) return false;

    // Security Check: Pastikan count tidak negatif
    const validCount = Math.max(0, count);

    const request = currentRequests[requestIndex];
    const currentRegistered = request.partiallyRegisteredItems || {};
    const newCount = (currentRegistered[itemId] || 0) + validCount;
    const updatedRegistered = { ...currentRegistered, [itemId]: newCount };

    let isFullyComplete = true;
    request.items.forEach((item) => {
      const status = request.itemStatuses?.[item.id];
      if (status?.status === "rejected" || status?.status === "stock_allocated") return;
      const approvedQty = status?.approvedQuantity ?? item.quantity;
      const regQty = updatedRegistered[item.id] || 0;
      if (regQty < approvedQty) isFullyComplete = false;
    });

    // --- LOGIC PERUBAHAN STATUS BERDASARKAN ALLOCATION TARGET ---
    const allocationTarget = request.order.allocationTarget || "Usage";
    let nextStatus = request.status;
    let isRegisteredFlag = false;

    if (isFullyComplete) {
      isRegisteredFlag = true;
      // Jika target adalah INVENTORY (Restock), kita langsung selesai (COMPLETED)
      if (allocationTarget === "Inventory") {
        nextStatus = ItemStatus.COMPLETED;
      } else {
        // Jika Usage, butuh handover
        nextStatus = ItemStatus.AWAITING_HANDOVER;
      }
    }

    const updatedRequest = {
      ...request,
      partiallyRegisteredItems: updatedRegistered,
      status: nextStatus,
      isRegistered: isRegisteredFlag,
      // Jika completed langsung, isi completion data
      completionDate:
        nextStatus === ItemStatus.COMPLETED ? new Date().toISOString() : request.completionDate,
      completedBy:
        nextStatus === ItemStatus.COMPLETED
          ? useAuthStore.getState().currentUser?.name
          : request.completedBy,
    };

    if (nextStatus !== request.status) {
      const activityLog = updatedRequest.activityLog || [];
      const logMessage =
        nextStatus === ItemStatus.COMPLETED
          ? "Pencatatan aset selesai (Restock). Request ditutup."
          : "Seluruh item telah dicatat. Status diubah menjadi Siap Serah Terima.";

      activityLog.unshift({
        id: Date.now(),
        author: "System",
        timestamp: new Date().toISOString(),
        type: "status_change",
        payload: { text: logMessage },
      });
      updatedRequest.activityLog = activityLog;

      if (nextStatus === ItemStatus.AWAITING_HANDOVER) {
        sendSystemNotif(
          updatedRequest.requester,
          "REQUEST_COMPLETED",
          requestId,
          "Aset telah diregistrasi dan siap diserahterimakan",
          false
        );
      }
    }

    const updatedRequests = [...currentRequests];
    updatedRequests[requestIndex] = updatedRequest;

    try {
      await requestsApi.update(requestId, updatedRequest);
      set({ requests: updatedRequests });
      return true;
    } catch (error) {
      console.error("[RequestStore] updateRequestRegistration failed:", error);
      throw error;
    }
  },

  // ... Loan Request and Return Logic remains same ...
  addLoanRequest: async (request) => {
    try {
      const createdLoan = await loansApi.create(request);
      set((state) => ({
        loanRequests: [createdLoan, ...state.loanRequests],
      }));
      sendSystemNotif(
        "Admin Logistik",
        "REQUEST_CREATED",
        createdLoan.id,
        "membuat request pinjam aset",
        true
      );
    } catch (error) {
      console.error("[RequestStore] addLoanRequest failed:", error);
      throw error;
    }
  },

  updateLoanRequest: async (id, data) => {
    try {
      const oldReq = get().loanRequests.find((r) => r.id === id);
      const updatedLoan = await loansApi.update(id, data);
      set((state) => ({
        loanRequests: state.loanRequests.map((r) => (r.id === id ? updatedLoan : r)),
      }));

      if (oldReq && data.status && oldReq.status !== data.status) {
        if (data.status === LoanRequestStatus.REJECTED) {
          sendSystemNotif(
            oldReq.requester,
            "REQUEST_REJECTED",
            id,
            "Request pinjaman ditolak",
            false
          );
        } else if (data.status === LoanRequestStatus.RETURNED) {
          sendSystemNotif(
            oldReq.requester,
            "STATUS_CHANGE",
            id,
            "Pengembalian aset telah dikonfirmasi selesai",
            false
          );
        }
      }
    } catch (error) {
      console.error("[RequestStore] updateLoanRequest failed:", error);
      throw error;
    }
  },

  approveLoanRequest: async (id, payload) => {
    try {
      const updatedRequest = await loansApi.approve(id, payload);
      set((state) => ({
        loanRequests: state.loanRequests.map((r) => (r.id === id ? updatedRequest : r)),
      }));
      await useAssetStore.getState().fetchAssets();

      const loan = get().loanRequests.find((r) => r.id === id);
      if (loan) {
        sendSystemNotif(
          loan.requester,
          "REQUEST_APPROVED",
          id,
          "Request pinjaman disetujui. Aset siap diambil",
          false
        );
      }
    } catch (error) {
      console.error("[RequestStore] approveLoanRequest failed:", error);
      throw error;
    }
  },

  deleteLoanRequest: async (id) => {
    try {
      await loansApi.delete(id);
      set((state) => ({
        loanRequests: state.loanRequests.filter((r) => r.id !== id),
      }));
    } catch (error) {
      console.error("[RequestStore] deleteLoanRequest failed:", error);
      throw error;
    }
  },

  addReturn: async (returnData) => {
    try {
      const createdReturn = await returnsApi.create(returnData);
      set((state) => ({ returns: [createdReturn, ...state.returns] }));
      sendSystemNotif(
        "Admin Logistik",
        "STATUS_CHANGE",
        createdReturn.docNumber,
        `mengajukan pengembalian aset (Ref: ${createdReturn.loanRequestId})`,
        true
      );
    } catch (error) {
      console.error("[RequestStore] addReturn failed:", error);
      throw error;
    }
  },

  updateReturn: async (id, data) => {
    try {
      const updatedReturn = await returnsApi.update(id, data);
      set((state) => ({
        returns: state.returns.map((r) => (r.id === id ? updatedReturn : r)),
      }));
    } catch (error) {
      console.error("[RequestStore] updateReturn failed:", error);
      throw error;
    }
  },

  submitReturnRequest: async (loanRequestId, returnItems) => {
    const { currentUser } = useAuthStore.getState();
    const { assets, updateAssetBatch } = useAssetStore.getState();
    const { addReturn, updateLoanRequest, returns, loanRequests } = get();

    const loanRequest = loanRequests.find((lr) => lr.id === loanRequestId);
    if (!loanRequest || !currentUser) throw new Error("Request atau pengguna tidak ditemukan.");

    const today = new Date();
    const returnDocNumber = generateDocumentNumber("RR", returns, today);
    const assetIds = returnItems.map((item) => item.assetId);

    const newReturnDoc: AssetReturn = {
      id: returnDocNumber,
      docNumber: returnDocNumber,
      returnDate: today.toISOString(),
      loanRequestId: loanRequest.id,
      returnedBy: currentUser.name,
      status: AssetReturnStatus.PENDING_APPROVAL,
      items: returnItems.map((item) => {
        const asset = assets.find((a) => a.id === item.assetId);
        return {
          assetId: item.assetId,
          assetName: asset?.name || "Unknown Asset",
          returnedCondition: item.condition,
          notes: item.notes,
          status: "PENDING",
        };
      }),
    };

    await addReturn(newReturnDoc);
    await updateAssetBatch(assetIds, { status: AssetStatus.AWAITING_RETURN });

    if (loanRequest.status !== LoanRequestStatus.AWAITING_RETURN) {
      await updateLoanRequest(loanRequest.id, {
        status: LoanRequestStatus.AWAITING_RETURN,
      });
    }

    useUIStore.getState().setActivePage("request-pinjam", { initialTab: "returns" });
    useUIStore.getState().setHighlightOnReturn(newReturnDoc.id);
  },

  processReturnBatch: async (returnDocId, acceptedAssetIds, approverName) => {
    set({ isLoading: true });
    try {
      const now = new Date();
      const currentReturns = get().returns;
      const currentLoanRequests = get().loanRequests;
      const { updateAsset, updateAssetBatch } = useAssetStore.getState();

      const returnDocIndex = currentReturns.findIndex((r) => r.id === returnDocId);
      if (returnDocIndex === -1) throw new Error("Dokumen pengembalian tidak ditemukan.");

      const returnDoc = currentReturns[returnDocIndex];
      const loanRequest = currentLoanRequests.find((r) => r.id === returnDoc.loanRequestId);
      if (!loanRequest) throw new Error("Request pinjaman terkait tidak ditemukan.");

      const updatedItems = returnDoc.items.map((item) => {
        if (acceptedAssetIds.includes(item.assetId)) {
          return {
            ...item,
            status: "ACCEPTED" as const,
            verificationNotes: "Diverifikasi OK",
          };
        } else {
          return {
            ...item,
            status: "REJECTED" as const,
            verificationNotes: "Fisik tidak diterima/ditolak saat verifikasi.",
          };
        }
      });

      const allAccepted = updatedItems.every((i) => i.status === "ACCEPTED");
      const allRejected = updatedItems.every((i) => i.status === "REJECTED");
      const finalDocStatus = allAccepted
        ? AssetReturnStatus.COMPLETED
        : allRejected
          ? AssetReturnStatus.REJECTED
          : AssetReturnStatus.APPROVED;

      const updatedReturnDoc: AssetReturn = {
        ...returnDoc,
        items: updatedItems,
        status: finalDocStatus,
        verifiedBy: approverName,
        verificationDate: now.toISOString(),
      };

      const acceptedItems = updatedItems.filter((i) => i.status === "ACCEPTED");
      const rejectedItems = updatedItems.filter((i) => i.status === "REJECTED");

      for (const item of acceptedItems) {
        const isGood = [AssetCondition.GOOD, AssetCondition.USED_OKAY].includes(
          item.returnedCondition
        );
        const targetStatus = isGood ? AssetStatus.IN_STORAGE : AssetStatus.DAMAGED;

        await updateAsset(item.assetId, {
          status: targetStatus,
          condition: item.returnedCondition,
          currentUser: null,
          location: "Gudang Inventori",
        });
      }

      if (rejectedItems.length > 0) {
        await updateAssetBatch(
          rejectedItems.map((i) => i.assetId),
          { status: AssetStatus.IN_USE }
        );
      }

      const previouslyReturnedIds = loanRequest.returnedAssetIds || [];
      const newReturnedIds = acceptedItems.map((i) => i.assetId);
      const finalReturnedIds = Array.from(new Set([...previouslyReturnedIds, ...newReturnedIds]));
      const allAssignedIds = Object.values(loanRequest.assignedAssetIds || {}).flat();
      const isFullyReturned =
        allAssignedIds.length > 0 && allAssignedIds.every((id) => finalReturnedIds.includes(id));

      const updatedLoanRequest: Partial<LoanRequest> = {
        returnedAssetIds: finalReturnedIds,
        status: isFullyReturned ? LoanRequestStatus.RETURNED : LoanRequestStatus.ON_LOAN,
        actualReturnDate: isFullyReturned ? now.toISOString() : loanRequest.actualReturnDate,
      };

      const newReturnsList = [...get().returns];
      newReturnsList[returnDocIndex] = updatedReturnDoc;

      try {
        await returnsApi.update(returnDocId, updatedReturnDoc);
      } catch (err) {
        console.warn(
          "[RequestStore] processReturnBatch: returnsApi.update failed, using local state",
          err
        );
      }

      await get().updateLoanRequest(loanRequest.id, updatedLoanRequest);
      set({ returns: newReturnsList, isLoading: false });

      sendSystemNotif(
        returnDoc.returnedBy,
        "STATUS_CHANGE",
        returnDocId,
        `Pengembalian telah diverifikasi (${finalDocStatus})`,
        false
      );
      useNotificationStore
        .getState()
        .addToast(`Verifikasi selesai. Dokumen: ${finalDocStatus}.`, "success");
    } catch (error: unknown) {
      console.error("[RequestStore] processReturnBatch failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Gagal memproses pengembalian.";
      useNotificationStore.getState().addToast(errorMessage, "error");
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
}));
