import React, { useEffect, useState, useCallback } from "react";
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
} from "react-native";
import {
  sendEmployeeNotification,
  fetchEmployeeNotifications,
  editNotification,
  deleteNotification,
  NotificationItem,
} from "../../services/notificationService";

export default function EmployeeNotificationsScreen() {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  const loadConversation = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEmployeeNotifications();
      setNotifications(data);
    } catch (e) {
      console.log("Fetch employee notifications error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversation();
  }, [loadConversation]);

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
      console.log("Send/edit notification error:", e);
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

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const created = new Date(item.createdAt);
    const timeLabel = created.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const isEmployee = item.senderRole === "employee";
    const isAdmin = item.senderRole === "admin";

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
          <TouchableWithoutFeedback
            onLongPress={() => onBubbleLongPress(item)}
          >
            <View
              style={[
                styles.bubble,
                isEmployee ? styles.meBubble : styles.adminBubble,
              ]}
            >
              {isAdmin && <Text style={styles.adminLabel}>Admin</Text>}
              <Text style={styles.bubbleText}>{item.message}</Text>
              <Text style={styles.timeInside}>{timeLabel}</Text>
              {item.edited && (
                <Text style={styles.editedText}>edited</Text>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={behavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 60}
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

          <View style={styles.composerContainer}>
            <TextInput
              style={styles.input}
              placeholder={
                editingId ? "Edit your message..." : "Type a message..."
              }
              placeholderTextColor="#64748b"
              value={message}
              onChangeText={setMessage}
              multiline
            />
            <TouchableOpacity
              style={[styles.sendButton, sending && { opacity: 0.6 }]}
              onPress={handleSendOrEdit}
              disabled={sending || !message.trim()}
              activeOpacity={0.8}
            >
              <Text style={styles.sendText}>
                {editingId ? "Update" : "Send"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  flex: { flex: 1 },
  bgTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(59,130,246,0.25)",
  },
  bgBottom: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.25)",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    color: "#9ca3af",
    fontSize: 13,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  rowRight: {
    justifyContent: "flex-end",
  },
  rowLeft: {
    justifyContent: "flex-start",
  },
  bubbleWrapper: {
    maxWidth: "80%",
  },
  alignRight: {
    alignItems: "flex-end",
  },
  alignLeft: {
    alignItems: "flex-start",
  },
  bubble: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  meBubble: {
    backgroundColor: "#3b82f6",
    borderBottomRightRadius: 4,
  },
  adminBubble: {
    backgroundColor: "#111827",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  adminLabel: {
    fontSize: 10,
    color: "#f97316",
    marginBottom: 2,
    fontWeight: "600",
  },
  bubbleText: {
    color: "#f9fafb",
    fontSize: 13,
  },
  timeInside: {
    fontSize: 10,
    color: "#9ca3af",
    alignSelf: "flex-end",
    marginTop: 2,
  },
  editedText: {
    fontSize: 10,
    color: "#9ca3af",
    alignSelf: "flex-end",
  },
  composerContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#1f2937",
    backgroundColor: "#020617",
  },
  input: {
    flex: 1,
    maxHeight: 90,
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#e5e7eb",
    fontSize: 13,
    backgroundColor: "#020617",
  },
  sendButton: {
    marginLeft: 8,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "700",
  },
});
