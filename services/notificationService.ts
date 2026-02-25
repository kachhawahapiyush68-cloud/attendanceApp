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
  title?: string;
  message: string;
  createdAt: string;
  read: boolean;
  targetRole: NotificationTargetRole;
  userName?: string | null;
  userCode?: string;
  senderRole: "admin" | "employee";
  edited?: boolean;
}

export type AdminBroadcastAudience = "all" | "single" | "multiple";

export async function sendEmployeeNotification(message: string): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }
  await api.post("/notifications", { message: trimmed });
}

export async function sendAdminReply(
  targetUserId: number,
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }
  await api.post("/notifications/admin-reply", {
    targetUserId,
    message: trimmed,
  });
}

export async function sendAdminBroadcast(params: {
  title: string;
  message: string;
  audience: AdminBroadcastAudience;
  userid?: string;
  userids?: string[];
}): Promise<void> {
  const payload: any = {
    title: params.title.trim(),
    message: params.message.trim(),
    audience: params.audience,
  };

  if (params.audience === "single" && params.userid) {
    payload.userid = String(params.userid).trim();
  }

  if (params.audience === "multiple" && Array.isArray(params.userids)) {
    payload.userids = params.userids
      .map((u) => String(u).trim())
      .filter((u) => u.length > 0);
  }

  await api.post("/notifications/broadcast", payload);
}

export async function fetchEmployeeNotifications(): Promise<NotificationItem[]> {
  const res = await api.get("/notifications/mine");
  const list = res.data?.notifications;
  if (!res.data?.success || !Array.isArray(list)) {
    return [];
  }
  return list.map((n: any): NotificationItem => ({
    id: n.id,
    userId: n.userId ?? null,
    type: n.type as NotificationType,
    title: n.title ?? undefined,
    message: n.message,
    createdAt: String(n.createdAt),
    read: !!(n.read ?? n.isRead),
    targetRole: n.targetRole as NotificationTargetRole,
    userName: n.userName ?? null,
    userCode: n.userCode ?? "",
    senderRole: (n.senderRole ?? "employee") as "admin" | "employee",
    edited: !!n.edited,
  }));
}

export async function fetchAdminNotifications(): Promise<NotificationItem[]> {
  const res = await api.get("/notifications/admin");
  const list = res.data?.notifications;
  if (!res.data?.success || !Array.isArray(list)) {
    return [];
  }
  return list.map((n: any): NotificationItem => ({
    id: n.id,
    userId: n.userId ?? null,
    type: n.type as NotificationType,
    title: n.title ?? undefined,
    message: n.message,
    createdAt: String(n.createdAt),
    read: !!(n.read ?? n.isRead),
    targetRole: n.targetRole as NotificationTargetRole,
    userName: n.userName ?? null,
    userCode: n.userCode ?? "",
    senderRole: (n.senderRole ?? "employee") as "admin" | "employee",
    edited: !!n.edited,
  }));
}

export async function editNotification(
  id: number,
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error("Message is required");
  }
  await api.patch(`/notifications/${id}`, { message: trimmed });
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
