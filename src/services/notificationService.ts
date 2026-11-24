import { api } from "@/api/client";
import type { NotificationItem } from "@/types/account";

/** In-app notifications (bell). PROVISIONAL endpoints (mock only until the backend docs arrive). */
export const notificationService = {
  list: () => api.get<NotificationItem[]>("/me/notifications"),
  /** no ids = mark everything read; returns the updated list */
  markRead: (ids?: string[]) => api.post<NotificationItem[]>("/me/notifications/read", ids ? { ids } : {}),
};
