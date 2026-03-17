"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useAuth } from "@/app/contexts/AuthContext";
import { useNotifications } from "@/app/contexts/NotificationsContext";
import NotificationsDropdown from "./NotificationsDropdown";
import { Notification } from "@/app/lib/api/notifications";

export default function Header({ lang }: { lang: string }) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  useEffect(() => {
    if (!isNotificationsOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notifications-dropdown')) {
        setIsNotificationsOpen(false);
      }
    };

    setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isNotificationsOpen]);

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    setIsNotificationsOpen(false);
    if (notification.url) {
      router.push(notification.url);
    }
  };

  return (
    <header className="px-6 py-4 bg-white flex justify-between items-center transition-all duration-300 relative z-[100] border-b-2 border-green-200 shadow-sm">
      <Link href={`/${lang}`} className="flex items-center gap-2 hover:opacity-85 transition-opacity">
        <img
          src="/images/jombo-logo.svg"
          alt="Jombo"
          className="h-10 w-auto"
        />
      </Link>
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        {user ? (
          <>
            {/* Campana de notificaciones */}
            <div className="relative notifications-dropdown">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 rounded-lg hover:bg-green-50 transition-colors"
                aria-label="Notificaciones"
              >
                <svg
                  className="w-7 h-7 text-green-700"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationsOpen && (
                <NotificationsDropdown
                  notifications={notifications}
                  onNotificationClick={handleNotificationClick}
                />
              )}
            </div>

            {/* Menú de usuario */}
            <div className="relative user-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="flex items-center gap-2 bg-green-50 border-2 border-green-200 text-green-800 px-4 py-2 rounded-xl hover:bg-green-100 transition-all font-semibold"
              >
                {(user.picture_url || user.picture) ? (
                  <img
                    src={user.picture_url || user.picture}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full object-cover border-2 border-green-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold text-sm">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline text-green-900">{user.name || user.email}</span>
                <svg
                  className={`w-4 h-4 text-green-600 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl py-2 z-50 border-2 border-green-100">
                  <Link
                    href={`/${lang}/profile`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-green-800 hover:bg-green-50 transition-colors font-medium text-base"
                  >
                    {t("menu.profile")}
                  </Link>
                  <Link
                    href={`/${lang}/messages`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-green-800 hover:bg-green-50 transition-colors font-medium text-base"
                  >
                    {t("menu.messages")}
                  </Link>
                  <Link
                    href={`/${lang}/my-bookings`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-green-800 hover:bg-green-50 transition-colors font-medium text-base"
                  >
                    {t("menu.myBookings")}
                  </Link>
                  <Link
                    href={`/${lang}/my-trips`}
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-3 px-5 py-3 text-green-800 hover:bg-green-50 transition-colors font-medium text-base"
                  >
                    {t("menu.myTrips")}
                  </Link>
                  <div className="h-px bg-green-100 my-1 mx-3"></div>
                  <button
                    onClick={() => {
                      logout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-5 py-3 text-red-600 font-semibold hover:bg-red-50 transition-colors text-base"
                  >
                    {t("menu.logout")}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href={`/${lang}/login`}
            className="bg-green-600 text-white px-7 py-3 rounded-xl hover:bg-green-700 transition-colors font-bold text-base shadow-sm active:scale-95"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
