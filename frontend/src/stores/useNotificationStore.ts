import { create } from "zustand";
import {
  Notification,
  NotificationSystemType,
  NotificationType,
  NotificationAction,
} from "../types";
import {
  unifiedApi,
  notificationsApi,
  USE_MOCK,
  mockStorage,
} from "../services/api";

// FIX: Re-exporting types from the central `types/index.ts` file for compatibility.
export type { NotificationType, NotificationAction };

interface NotificationState {
  notifications: Notification[];
  isLoading: boolean;
  fetchNotifications: () => Promise<void>;
  // For simple toast notifications
  addToast: (
    message: string,
    type?: NotificationType,
    options?: Partial<Notification>,
  ) => void;
  // For persistent system notifications
  addSystemNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "isRead">,
  ) => void;
  removeNotification: (id: number) => void;
  markAsRead: (id: number) => void;
  markAllAsRead: (recipientId: number) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async () => {
    // FIX: The 'get' function was missing from the store creator's signature, causing a reference error.
    if (get().notifications.length > 0) return; // Avoid re-fetching
    set({ isLoading: true });
    try {
      const notifications = await unifiedApi.refreshNotifications();
      set({ notifications, isLoading: false });
    } catch (error) {
      console.error("[NotificationStore] Failed to fetch notifications", error);
      set({ isLoading: false });
    }
  },

  // FIX: Explicitly type the `options` parameter to `Partial<Notification>` to resolve type inference error.
  addToast: (
    message: string,
    type: NotificationType = "info",
    options: Partial<Notification> = {},
  ) => {
    const id = Date.now();
    // FIX: This object now correctly conforms to the unified 'Notification' type from types/index.ts
    const toastNotification: Notification = {
      id,
      message,
      type,
      duration: options.duration || 5000,
      actions: options.actions,
      // Default values for system notification fields
      recipientId: 0,
      actorName: "System",
      referenceId: "",
      isRead: true, // Toasts are considered "read" once shown
      timestamp: new Date().toISOString(),
      ...options,
    };

    set((state) => ({
      notifications: [toastNotification, ...state.notifications],
    }));
  },

  addSystemNotification: async (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now(),
      isRead: false,
      timestamp: new Date().toISOString(),
    };

    try {
      if (USE_MOCK) {
        const current =
          mockStorage.get<Notification[]>("app_notifications") || [];
        mockStorage.save("app_notifications", [newNotification, ...current]);
      } else {
        // Fire and forget for backend notification creation
        notificationsApi
          .create(newNotification)
          .catch((err) =>
            console.warn(
              "[NotificationStore] Failed to persist notification:",
              err,
            ),
          );
      }
    } catch (err) {
      console.warn("[NotificationStore] Error saving notification:", err);
    }

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
    }));
  },

  removeNotification: async (id) => {
    try {
      if (USE_MOCK) {
        const current =
          mockStorage.get<Notification[]>("app_notifications") || [];
        mockStorage.save(
          "app_notifications",
          current.filter((n) => n.id !== id),
        );
      } else {
        notificationsApi
          .delete(id)
          .catch((err) =>
            console.warn(
              "[NotificationStore] Failed to delete notification:",
              err,
            ),
          );
      }
    } catch (err) {
      console.warn("[NotificationStore] Error deleting notification:", err);
    }

    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  markAsRead: async (id: number) => {
    try {
      if (USE_MOCK) {
        const current =
          mockStorage.get<Notification[]>("app_notifications") || [];
        mockStorage.save(
          "app_notifications",
          current.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      } else {
        notificationsApi
          .markAsRead(id)
          .catch((err) =>
            console.warn(
              "[NotificationStore] Failed to mark notification as read:",
              err,
            ),
          );
      }
    } catch (err) {
      console.warn(
        "[NotificationStore] Error marking notification as read:",
        err,
      );
    }

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
    }));
  },

  markAllAsRead: async (recipientId: number) => {
    try {
      if (USE_MOCK) {
        const current =
          mockStorage.get<Notification[]>("app_notifications") || [];
        mockStorage.save(
          "app_notifications",
          current.map((n) =>
            n.recipientId === recipientId && !n.isRead
              ? { ...n, isRead: true }
              : n,
          ),
        );
      } else {
        notificationsApi
          .markAllAsRead(recipientId)
          .catch((err) =>
            console.warn(
              "[NotificationStore] Failed to mark all notifications as read:",
              err,
            ),
          );
      }
    } catch (err) {
      console.warn(
        "[NotificationStore] Error marking all notifications as read:",
        err,
      );
    }

    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.recipientId === recipientId && !n.isRead ? { ...n, isRead: true } : n,
      ),
    }));
  },
}));

// This hook is now for TOASTS only. System notifications are handled by the NotificationBell.
export const useNotification = () => {
  return useNotificationStore((state) => state.addToast);
};
