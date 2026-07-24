"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/lib/auth";
import {
  getNotifications,
  markAllRead as markAllReadData,
  markRead as markReadData,
} from "@/lib/notifications-data";
import type {
  Notification,
  NotificationAudience,
} from "@/lib/mock-data";

type NotificationContextValue = {
  notifications: Notification[];
  unreadCount: number;
  markAllRead: () => void;
  markRead: (id: string) => void;
  refresh: () => void;
};

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { session, ready } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const audience: NotificationAudience | null = session
    ? session.role === "admin"
      ? "admin"
      : "client"
    : null;
  const scopeId = session?.role === "client" ? session.clientId ?? "" : "";

  const refresh = useCallback(() => {
    if (!audience) {
      setNotifications([]);
      return;
    }
    setNotifications(getNotifications(audience, scopeId));
  }, [audience, scopeId]);

  useEffect(() => {
    if (!ready) return;
    refresh();
  }, [ready, refresh]);

  useEffect(() => {
    if (!audience) return;
    function onFocus() {
      refresh();
    }
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [audience, refresh]);

  const markAllRead = useCallback(() => {
    if (!audience) return;
    setNotifications(markAllReadData(audience, scopeId));
  }, [audience, scopeId]);

  const markRead = useCallback(
    (id: string) => {
      if (!audience) return;
      setNotifications(markReadData(audience, scopeId, id));
    },
    [audience, scopeId]
  );

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead, markRead, refresh }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx)
    throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
