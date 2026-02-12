// services/notificationService.ts
import api from "./api";

export type NotificationType =
  | "HOME_ATTENDANCE"
  | "EMPLOYEE_MESSAGE"
  | "ADMIN_BROADCAST";

export type NotificationTargetRole = "admin" | "employee" | "all";

export interface NotificationItem {
  id: number;
  userId: number;
  type: NotificationType;
  title?: string; // optional title for broadcasts / messages
  message: string;
  createdAt: string;
  read: boolean;
  targetRole: NotificationTargetRole;
  userName?: string | null;
  userCode?: string;
  senderRole: "admin" | "employee";
  edited?: boolean;
}

// ========== EMPLOYEE SIDE ==========

// employee -> admin (chat)
export async function sendEmployeeNotification(
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is required");
  await api.post("/notifications", { message: trimmed });
}

// ========== ADMIN REPLY (1:1 CHAT) ==========

// admin -> employee (chat reply)
export async function sendAdminReply(
  targetUserId: number,
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is required");
  await api.post("/notifications/admin-reply", {
    targetUserId,
    message: trimmed,
  });
}

// ========== ADMIN BROADCAST ==========

// admin broadcast (admin screen)
export async function sendAdminBroadcast(params: {
  title: string;
  message: string;
  audience: "all" | "single";
  user_id?: string | number; // allow both, normalize below
}): Promise<void> {
  const payload: any = {
    title: params.title.trim(),
    message: params.message.trim(),
    audience: params.audience,
  };

  if (params.audience === "single" && params.user_id != null) {
    // normalize to string; backend can parse to number if needed
    payload.user_id = String(params.user_id).trim();
  }

  await api.post("/notifications/broadcast", payload);
}

// ========== FETCH LISTS ==========

// employee conversation (admin + employee messages + broadcasts)
export async function fetchEmployeeNotifications(): Promise<NotificationItem[]> {
  const res = await api.get<{ success: boolean; notifications: any[] }>(
    "/notifications/mine"
  );

  const list = res.data?.notifications;
  if (!res.data?.success || !Array.isArray(list)) {
    return [];
  }

  return list.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationType,
    title: n.title ?? undefined,
    message: n.message,
    createdAt: n.createdAt,
    read: !!(n.read ?? n.isRead),
    targetRole: n.targetRole as NotificationTargetRole,
    userName: n.userName ?? null,
    userCode: n.userCode ?? "",
    senderRole: (n.senderRole ?? "employee") as "admin" | "employee",
    edited: !!n.edited,
  }));
}

// admin list (all employee chats + broadcasts)
export async function fetchAdminNotifications(): Promise<NotificationItem[]> {
  const res = await api.get<{ success: boolean; notifications: any[] }>(
    "/notifications/admin"
  );

  const list = res.data?.notifications;
  if (!res.data?.success || !Array.isArray(list)) {
    return [];
  }

  return list.map((n) => ({
    id: n.id,
    userId: n.userId,
    type: n.type as NotificationType,
    title: n.title ?? undefined,
    message: n.message,
    createdAt: n.createdAt,
    read: !!(n.read ?? n.isRead),
    targetRole: n.targetRole as NotificationTargetRole,
    userName: n.userName ?? null,
    userCode: n.userCode ?? "",
    senderRole: (n.senderRole ?? "employee") as "admin" | "employee",
    edited: !!n.edited,
  }));
}

// ========== EDIT / DELETE ==========

export async function editNotification(
  id: number,
  message: string
): Promise<void> {
  const trimmed = message.trim();
  if (!trimmed) throw new Error("Message is required");
  await api.patch(`/notifications/${id}`, { message: trimmed });
}

export async function deleteNotification(id: number): Promise<void> {
  await api.delete(`/notifications/${id}`);
}
