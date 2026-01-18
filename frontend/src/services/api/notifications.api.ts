/**
 * Notifications API Service
 *
 * Handles all notification-related API calls.
 */

import { apiClient, USE_MOCK } from "./client";
import type { Notification } from "../../types";

const MOCK_LATENCY = 300;

const getFromStorage = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const saveToStorage = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const mockDelay = <T>(fn: () => T): Promise<T> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        resolve(fn());
      } catch (e) {
        reject(e);
      }
    }, MOCK_LATENCY);
  });

export const notificationsApi = {
  /**
   * Get all notifications
   */
  getAll: async (): Promise<Notification[]> => {
    if (USE_MOCK) {
      return mockDelay(
        () => getFromStorage<Notification[]>("app_notifications") || [],
      );
    }
    return apiClient.get<Notification[]>("/notifications");
  },

  /**
   * Get notifications for a specific user
   */
  getByUserId: async (userId: number): Promise<Notification[]> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const all = getFromStorage<Notification[]>("app_notifications") || [];
        return all.filter((n) => n.recipientId === userId);
      });
    }
    return apiClient.get<Notification[]>(`/notifications?userId=${userId}`);
  },

  /**
   * Create a new notification
   */
  create: async (notification: Notification): Promise<Notification> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const current =
          getFromStorage<Notification[]>("app_notifications") || [];
        saveToStorage("app_notifications", [notification, ...current]);
        return notification;
      });
    }
    return apiClient.post<Notification>("/notifications", notification);
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: number): Promise<Notification> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const current =
          getFromStorage<Notification[]>("app_notifications") || [];
        const updated = current.map((n) =>
          n.id === id ? { ...n, isRead: true } : n,
        );
        saveToStorage("app_notifications", updated);
        const notification = updated.find((n) => n.id === id);
        if (!notification) throw new Error(`Notification ${id} not found`);
        return notification;
      });
    }
    return apiClient.patch<Notification>(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications for a user as read
   */
  markAllAsRead: async (recipientId: number): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const current =
          getFromStorage<Notification[]>("app_notifications") || [];
        const updated = current.map((n) =>
          n.recipientId === recipientId && !n.isRead
            ? { ...n, isRead: true }
            : n,
        );
        saveToStorage("app_notifications", updated);
      });
    }
    await apiClient.patch(`/notifications/read-all?userId=${recipientId}`, {});
  },

  /**
   * Delete a notification
   */
  delete: async (id: number): Promise<void> => {
    if (USE_MOCK) {
      return mockDelay(() => {
        const current =
          getFromStorage<Notification[]>("app_notifications") || [];
        saveToStorage(
          "app_notifications",
          current.filter((n) => n.id !== id),
        );
      });
    }
    await apiClient.delete(`/notifications/${id}`);
  },
};
