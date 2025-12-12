"use client";

import { Notification } from "@/app/lib/api/notifications";
import { useTranslation } from "@/app/hooks/useTranslation";

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notificationId: number) => void;
}

export default function NotificationsDropdown({
  notifications,
  onNotificationClick,
}: NotificationsDropdownProps) {
  const { t } = useTranslation();
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-800">{t("notifications.title")}</h3>
      </div>
      <div className="py-1 max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{t("notifications.empty")}</p>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification.id)}
              className={`p-4 cursor-pointer hover:bg-gray-100 ${
                !notification.read_at ? "bg-blue-50" : ""
              }`}
            >
              <p className="text-sm font-semibold text-gray-800">{notification.title}</p>
              <p className="text-sm text-gray-700 mt-1">{notification.content}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
