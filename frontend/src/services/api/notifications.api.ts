/**
 * Notifications API Service
 *
 * Pure API implementation - no mock logic
 * Handles all notification-related API calls.
 */

import { apiClient } from "./client";
import type { Notification } from "../../types";

export const notificationsApi = {
  /**
   * Get notifications for current user
   * Backend uses current user from JWT token
   */
  getAll: async (options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<Notification[]> => {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.unreadOnly) params.append("unreadOnly", "true");

    const queryString = params.toString();
    const url = `/notifications${queryString ? `?${queryString}` : ""}`;
    return apiClient.get<Notification[]>(url);
  },

  /**
   * Get notifications for a specific user (alias for getAll with userId param)
   * Note: Backend uses JWT token to determine user, userId param is for client-side filtering if needed
   */
  getByUserId: async (userId: number): Promise<Notification[]> => {
    // Backend determines user from JWT, but we can still request
    const data = await apiClient.get<Notification[]>("/notifications");
    // Filter client-side if backend returns all (backward compatibility)
    return data.filter((n) => n.recipientId === userId);
  },

  /**
   * Get unread notification count
   */
  getUnreadCount: async (): Promise<number> => {
    const result = await apiClient.get<{ count: number }>(
      "/notifications/unread-count",
    );
    return result.count;
  },

  /**
   * Create a new notification
   * Note: Typically created by backend automatically for system events
   */
  create: async (
    notification: Omit<Notification, "id">,
  ): Promise<Notification> => {
    return apiClient.post<Notification>("/notifications", notification);
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (id: number): Promise<void> => {
    await apiClient.patch(`/notifications/${id}/read`, {});
  },

  /**
   * Mark all notifications as read
   * Backend uses current user from JWT token
   */
  markAllAsRead: async (_recipientId?: number): Promise<void> => {
    // recipientId is kept for backward compatibility but backend uses JWT
    await apiClient.post("/notifications/mark-all-read", {});
  },

  /**
   * Delete a notification
   */
  delete: async (id: number): Promise<void> => {
    // Validate ID before making API call
    if (!id || typeof id !== "number" || isNaN(id)) {
      console.warn("[notificationsApi] Invalid notification ID:", id);
      return;
    }
    await apiClient.delete(`/notifications/${id}`);
  },
};
