"use client";

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from "react";
import * as notificationsApi from "@/app/lib/api/notifications";
import { Notification } from "@/app/lib/api/notifications";
import { useAuth } from "./AuthContext";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshNotifications = useCallback(async () => {
    if (!user) return;
    console.log('🟢 NotificationsContext: Refreshing notifications');
    try {
      const notificationsData = await notificationsApi.getNotifications();
      console.log('🟢 NotificationsContext: Raw notifications data:', notificationsData);
      console.log('🟢 NotificationsContext: Notifications loaded:', notificationsData);
      setNotifications(notificationsData.notifications);
      setUnreadCount(notificationsData.unread_count);
    } catch (err) {
      console.log('🟢 NotificationsContext: No notification session', err);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [user]);

  useEffect(() => {
    const loadNotifications = async () => {
      console.log('🟢 NotificationsContext: Loading notifications on mount');
      await refreshNotifications();
    };
    loadNotifications();
  }, [refreshNotifications, user]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!user) return;
    try {
      await notificationsApi.markAsRead(notificationId);
      await refreshNotifications();
    } catch (err: any) {
      console.error(err?.message || "Error marking notification as read");
      throw err;
    }
  }, [user, refreshNotifications]);

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, markAsRead, refreshNotifications }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within an NotificationsProvider");
  }
  return context;
}
