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
    <div className="absolute right-0 mt-4 w-96 bg-brand-dark/95 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 shadow-3xl z-50 overflow-hidden">
      <div className="absolute inset-0 bg-hacker-dots opacity-10 pointer-events-none"></div>
      <div className="p-6 border-b border-white/10 relative">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-brand-cyan animate-pulse"></div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] italic">
            {t("notifications.title") || "CENTRO DE ALERTAS"}
          </h3>
        </div>
      </div>
      <div className="py-2 max-h-[32rem] overflow-y-auto relative scrollbar-hide">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center py-12 px-6 grayscale opacity-30 italic">
            <svg className="w-10 h-10 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-xs font-black uppercase tracking-widest">{t("notifications.empty") || "Sin transmisiones nuevas"}</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => onNotificationClick(notification)}
              className={`p-6 cursor-pointer border-b border-white/5 transition-all relative group overflow-hidden ${!notification.read_at
                ? "bg-brand-cyan/5 border-l-4 border-l-brand-cyan"
                : "hover:bg-white/5"
                }`}
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <p className={`text-sm font-black uppercase italic tracking-tight ${!notification.read_at ? "text-brand-cyan" : "text-white"}`}>
                  {notification.title}
                </p>
                {!notification.read_at && (
                  <span className="w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_10px_rgba(11,177,211,0.5)]"></span>
                )}
              </div>
              <p className="text-sm text-white/70 font-medium leading-relaxed mb-3 relative z-10 italic">
                {notification.content}
              </p>
              <p className="text-[10px] font-black text-brand-gray/50 uppercase tracking-widest font-mono relative z-10 group-hover:text-brand-gray/80 transition-colors">
                {new Date(notification.created_at).toLocaleString()}
              </p>

              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-24 h-24 bg-brand-cyan/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ))
        )}
      </div>
      {notifications.length > 0 && (
        <div className="p-4 bg-white/5 border-t border-white/10 text-center relative">
          <button className="text-[10px] font-black text-brand-gray uppercase tracking-[0.2em] hover:text-white transition-colors">
            {t("notifications.viewAll") || "Sincronizar todo"}
          </button>
        </div>
      )}
    </div>
  );
}
