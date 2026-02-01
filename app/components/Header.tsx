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
    <header className="p-4 bg-brand-dark text-white shadow-xl flex justify-between items-center transition-all duration-300 relative z-[100] border-b border-white/5">
      <div className="absolute inset-0 bg-hacker-dots opacity-30 pointer-events-none"></div>
      <Link href={`/${lang}`} className="relative flex items-center gap-2 hover:opacity-90 transition-opacity">
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
            <div className="relative notifications-dropdown">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative"
              >
                <svg
                  className="w-6 h-6 text-white"
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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
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
            <div className="relative user-dropdown">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="relative bg-white/5 text-white border border-white/10 px-4 py-2 rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 backdrop-blur-md"
              >
                {(user.picture_url || user.picture) ? (
                  <img
                    src={user.picture_url || user.picture}
                    alt={user.name || user.email}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden sm:inline">{user.name || user.email}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-4 w-56 bg-brand-dark rounded-2xl shadow-2xl py-3 z-50 border border-white/10 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="absolute inset-0 bg-hacker-dots opacity-10 pointer-events-none"></div>
                  <div className="relative">
                    <Link
                      href={`/${lang}/profile`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {t("menu.profile")}
                    </Link>
                    <Link
                      href={`/${lang}/messages`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {t("menu.messages")}
                    </Link>
                    <Link
                      href={`/${lang}/my-bookings`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {t("menu.myBookings")}
                    </Link>
                    <Link
                      href={`/${lang}/my-trips`}
                      onClick={() => setIsDropdownOpen(false)}
                      className="block w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      {t("menu.myTrips")}
                    </Link>
                    <div className="h-px bg-white/5 my-2"></div>
                    <button
                      onClick={() => {
                        logout();
                        setIsDropdownOpen(false);
                      }}
                      className="block w-full text-left px-4 py-3 text-sm text-brand-pink font-bold hover:bg-brand-pink/5 transition-colors"
                    >
                      {t("menu.logout")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            href={`/${lang}/login`}
            className="relative bg-brand-gradient text-white px-8 py-2.5 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-brand-cyan/20 active:scale-95 font-black uppercase tracking-widest text-xs"
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
}
