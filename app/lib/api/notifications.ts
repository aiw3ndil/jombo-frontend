const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export interface Notification {
  id: number;
  title: string;
  content: string;
  read_at: string | null;
  created_at: string;
  user_id: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export async function getNotifications(): Promise<NotificationsResponse> {
  const url = `${API_BASE}/api/v1/notifications`;
  
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al obtener notificaciones");
  }

  const data = await res.json();
  return data;
}

export async function markAsRead(notificationId: number): Promise<void> {
  const url = `${API_BASE}/api/v1/notifications/${notificationId}/mark_as_read`;
  
  const res = await fetch(url, {
    method: "PATCH",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Error al marcar la notificación como leída");
  }
}
