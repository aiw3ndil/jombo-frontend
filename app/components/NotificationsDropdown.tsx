"use client";

import { Notification } from "@/app/lib/api/notifications";
import { useTranslation } from "@/app/hooks/useTranslation";

interface NotificationsDropdownProps {
  notifications: Notification[];
  onNotificationClick: (notification: Notification) => void;
}

export default function NotificationsDropdown({
  notifications,
  onNotificationClick,
}: NotificationsDropdownProps) {
  const { t } = useTranslation();
  return (
    <div className="absolute right-0 mt-3 w-96 bg-white rounded-2xl border-2 border-[#e2e8f0] shadow-xl z-50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b-2 border-[#e2e8f0] bg-[#f0f4f8]">
        <h3 className="text-base font-bold text-[var(--brand-dark)] flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--brand-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {t("notifications.title") || "Notificaciones"}
        </h3>
      </div>

      {/* Body */}
      <div className="py-1 max-h-[28rem] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-10 px-6 text-[var(--brand-neutral)]">
            <svg className="w-10 h-10 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm font-medium text-[var(--brand-blue)]">{t("notifications.empty") || "No hay notificaciones nuevas"}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              className={`p-5 cursor-pointer border-b border-green-50 transition-colors ${
                !notification.read
                  ? "bg-[#f0f4f8] border-l-4 border-l-green-500"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <p className={`text-base font-bold ${!notification.read ? "text-[var(--brand-dark)]" : "text-gray-800"}`}>
                  {notification.title}
                </p>
                {!notification.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0 mt-1"></span>
                )}
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mb-2">
                {notification.content}
              </p>
              <p className="text-xs text-gray-400 font-medium">
                {new Date(notification.created_at).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>

      {notifications.length > 0 && (
        <div className="p-3 bg-[#f0f4f8] border-t border-[#e2e8f0] text-center">
          <button className="text-sm font-semibold text-[var(--brand-neutral)] hover:text-[var(--brand-dark)] transition-colors">
            {t("notifications.viewAll") || "Ver todas"}
          </button>
        </div>
      )}
    </div>
  );
}

