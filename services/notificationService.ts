// services/notificationService.ts
import api from "./api";

export type NotificationType =
  | "HOME_ATTENDANCE"
  | "EMPLOYEE_MESSAGE"
  | "ADMIN_BROADCAST";

export type NotificationTargetRole = "admin" | "employee" | "all";

export interface NotificationItem {
  id: number;
  userId: number | null;
  type: NotificationType;
  message: string;
  createdAt: string;            // raw DB value
  createdAtIST?: string | null; // "YYYY-MM-DD HH:mm" from backend
  isRead: boolean;
  targetRole: NotificationTargetRole;
  userName?: string | null;
  userCode?: string | null;
  senderRole: "admin" | "employee";
  edited?: boolean;
  image_url?: string | null;
  location_address?: string | null;
}

export type AdminBroadcastAudience = "all" | "single" | "multiple";

export async function sendEmployeeNotification(message: string): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is required");
  await api.post("/notifications", { message: trimmed });
}

export async function sendAdminReply(
  targetUserId: number,
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is required");
  await api.post("/notifications/admin-reply", { targetUserId, message: trimmed });
}

export async function sendAdminBroadcast(params: {
  title: string;
  message: string;
  audience: AdminBroadcastAudience;
  userid?: string;    // employee code (User.user_id)
  userids?: string[]; // employee codes
}): Promise<void> {
  const payload: any = {
    title: params.title.trim(),
    message: params.message.trim(),
    audience: params.audience,
  };

  if (params.audience === "single") {
    payload.userid = String(params.userid || "").trim();
  }
  if (params.audience === "multiple") {
    payload.userids = Array.isArray(params.userids)
      ? params.userids.map((u) => String(u).trim()).filter(Boolean)
      : [];
  }

  await api.post("/notifications/broadcast", payload);
}

function mapItem(n: any): NotificationItem {
  return {
    id: Number(n.id),
    userId: n.userId ?? null,
    type: n.type as NotificationType,
    message: String(n.message || ""),
    createdAt: String(n.createdAt),
    createdAtIST: n.createdAtIST ? String(n.createdAtIST) : undefined,
    isRead: !!n.isRead,
    targetRole: n.targetRole as NotificationTargetRole,
    userName: n.userName ?? null,
    userCode: n.userCode ?? null,
    senderRole: (n.senderRole ?? "employee") as "admin" | "employee",
    edited: !!n.edited,
    image_url: n.image_url ?? null,
    location_address: n.location_address ?? null,
  };
}

export async function fetchEmployeeNotifications(): Promise<NotificationItem[]> {
  const res = await api.get("/notifications/mine");
  const list = res.data?.notifications;
  if (!res.data?.success || !Array.isArray(list)) return [];
  return list.map(mapItem);
}

export async function fetchAdminNotifications(): Promise<NotificationItem[]> {
  const res = await api.get("/notifications/admin");
  const list = res.data?.notifications;
  if (!res.data?.success || !Array.isArray(list)) return [];
  return list.map(mapItem);
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await api.get("/notifications/unread-count");
  if (!res.data?.success) return 0;
  return Number(res.data?.unreadCount || 0);
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.patch(`/notifications/${id}/read`, {});
}

export async function editNotification(id: number, message: string): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is required");
  await api.patch(`/notifications/${id}`, { message: trimmed });
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
