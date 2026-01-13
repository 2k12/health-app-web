import api from "./api";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "SYSTEM" | "CLIENT_UPDATE" | "PLAN_UPDATE";
  read: boolean;
  createdAt: string;
}

export const notificationService = {
  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await api.get("/notifications");
    return response.data;
  },

  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch("/notifications/read-all");
  },
};
