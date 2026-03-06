// app/employee/notifications.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  Alert,
  TouchableWithoutFeedback,
  SafeAreaView,
  Keyboard,
} from "react-native";
import {
  sendEmployeeNotification,
  fetchEmployeeNotifications,
  editNotification,
  deleteNotification,
  NotificationItem,
  fetchUnreadCount,
  markNotificationRead,
} from "../../services/notificationService";

export default function EmployeeNotificationsScreen() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      const [data, count] = await Promise.all([
        fetchEmployeeNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (e) {
      console.log("Fetch employee notifications error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

  // mark incoming admin messages as read once loaded
  const markAllVisibleAsRead = useCallback(async () => {
    try {
      const unreadIncoming = notifications.filter(
        (n) => !n.isRead && n.senderRole === "admin"
      );
      if (unreadIncoming.length === 0) return;

      await Promise.all(unreadIncoming.map((n) => markNotificationRead(n.id)));

      setNotifications((prev) =>
        prev.map((n) =>
          n.senderRole === "admin" ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - unreadIncoming.length));
    } catch (e) {
      // ignore
    }
  }, [notifications]);

  useEffect(() => {
    if (notifications.length > 0) markAllVisibleAsRead();
  }, [notifications, markAllVisibleAsRead]);

  const handleSendOrEdit = async () => {
    const trimmed = message.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      if (editingId) {
        await editNotification(editingId, trimmed);
        setEditingId(null);
      } else {
        await sendEmployeeNotification(trimmed);
      }
      setMessage("");
      await loadConversation();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ??
        "Failed to update message. Maybe edit time is over.";
      Alert.alert("Error", msg);
    } finally {
      setSending(false);
    }
  };

  const startEdit = (item: NotificationItem) => {
    setEditingId(item.id);
    setMessage(item.message);
  };

  const confirmDelete = (id: number) => {
    Alert.alert("Delete message", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteNotification(id);
            await loadConversation();
          } catch (e) {
            console.log("Delete notification error:", e);
          }
        },
      },
    ]);
  };

  const onBubbleLongPress = (item: NotificationItem) => {
    if (item.senderRole !== "employee") return;
    Alert.alert("Message options", "Choose an action", [
      { text: "Cancel", style: "cancel" },
      { text: "Edit", onPress: () => startEdit(item) },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => confirmDelete(item.id),
      },
    ]);
  };

  const headerLabel = useMemo(
    () => (unreadCount > 0 ? `Unseen: ${unreadCount}` : "All seen"),
    [unreadCount]
  );

  const renderItem = ({ item }: { item: NotificationItem }) => {
    // Prefer IST time from backend
    let timeLabel: string;
    if (item.createdAtIST) {
      const parts = item.createdAtIST.split(" ");
      timeLabel = parts[1] || item.createdAtIST; // "HH:mm"
    } else {
      const created = new Date(item.createdAt);
      timeLabel = created.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    const isEmployee = item.senderRole === "employee";
    const isAdmin = item.senderRole === "admin";
    const unreadIncoming = isAdmin && !item.isRead;

    return (
      <View
        style={[
          styles.messageRow,
          isEmployee ? styles.rowRight : styles.rowLeft,
        ]}
      >
        <View
          style={[
            styles.bubbleWrapper,
            isEmployee ? styles.alignRight : styles.alignLeft,
          ]}
        >
          <TouchableWithoutFeedback onLongPress={() => onBubbleLongPress(item)}>
            <View
              style={[
                styles.bubble,
                isEmployee ? styles.meBubble : styles.adminBubble,
                unreadIncoming && styles.unreadBubble,
              ]}
            >
              {isAdmin && <Text style={styles.adminLabel}>Admin</Text>}
              <Text style={styles.bubbleText}>{item.message}</Text>
              <Text style={styles.timeInside}>{timeLabel}</Text>
              {item.edited && <Text style={styles.editedText}>edited</Text>}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          <View style={styles.headerBar}>
            <Text style={styles.headerBarText}>{headerLabel}</Text>
          </View>

          <KeyboardAvoidingView
            style={styles.flex}
            behavior={behavior}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
          >
            <View style={styles.flex}>
              <FlatList
                data={notifications}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    {loading
                      ? "Loading..."
                      : "No messages yet. Start a chat with admin."}
                  </Text>
                }
                renderItem={renderItem}
              />

              <View style={styles.composerWrapper}>
                <View style={styles.composerContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      editingId ? "Edit your message..." : "Type a message..."
                    }
                    placeholderTextColor="#94a3b8"
                    value={message}
                    onChangeText={setMessage}
                    multiline
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendButton,
                      (sending || !message.trim()) && { opacity: 0.5 },
                    ]}
                    onPress={handleSendOrEdit}
                    disabled={sending || !message.trim()}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.sendText}>
                      {editingId ? "Update" : "Send"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e5f3ff" },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
  flex: { flex: 1 },

  headerBar: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  headerBarText: {
    color: "#0f172a",
    fontWeight: "700",
    fontSize: 13,
  },

  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#6b7280",
    fontSize: 13,
  },

  messageRow: { flexDirection: "row", marginBottom: 8 },
  rowRight: { justifyContent: "flex-end" },
  rowLeft: { justifyContent: "flex-start" },

  bubbleWrapper: { maxWidth: "80%" },
  alignRight: { alignItems: "flex-end" },
  alignLeft: { alignItems: "flex-start" },

  bubble: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  meBubble: {
    backgroundColor: "#2563eb",
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },

  unreadBubble: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  adminLabel: {
    fontSize: 10,
    color: "#f97316",
    marginBottom: 2,
    fontWeight: "600",
  },
  bubbleText: { color: "#0f172a", fontSize: 15 },
  timeInside: {
    fontSize: 10,
    color: "#6b7280",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  editedText: {
    fontSize: 10,
    color: "#6b7280",
    alignSelf: "flex-end",
  },

  composerWrapper: { marginBottom: 20 },
  composerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
    backgroundColor: "#e5f3ff",
  },
  input: {
    flex: 1,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#0f172a",
    fontSize: 13,
    backgroundColor: "#f8fafc",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: { color: "#f9fafb", fontSize: 13, fontWeight: "700" },
});
