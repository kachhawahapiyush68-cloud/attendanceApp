// app/admin/notifications.tsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
  SafeAreaView,
} from "react-native";
import { fetchEmployees, Employee } from "../../services/employeeService";
import {
  fetchAdminNotifications,
  NotificationItem,
  sendAdminBroadcast,
  fetchUnreadCount,
  markNotificationRead,
} from "../../services/notificationService";

type Audience = "all" | "single" | "multiple";

export default function AdminNotificationsScreen() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<Audience>("all");

  // single employee
  const [searchEmployee, setSearchEmployee] = useState("");
  const [targetUserCode, setTargetUserCode] = useState(""); // User.user_id (code)

  // multiple employees
  const [searchMultiEmployee, setSearchMultiEmployee] = useState("");
  const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

  // notifications search
  const [searchNotification, setSearchNotification] = useState("");

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // EMPLOYEES
  useEffect(() => {
    (async () => {
      try {
        const list = await fetchEmployees();
        setEmployees(list);
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load employees");
      }
    })();
  }, []);

  const filterEmployeesByQuery = useCallback(
    (q: string) => {
      if (!q.trim()) return employees;
      const query = q.toLowerCase();
      return employees.filter((e) => {
        const code = (e.user_id || "").toLowerCase(); // employee code
        const name = (e.name || "").toLowerCase();
        return code.includes(query) || name.includes(query);
      });
    },
    [employees]
  );

  const filteredEmployeesSingle = useMemo(
    () => filterEmployeesByQuery(searchEmployee),
    [filterEmployeesByQuery, searchEmployee]
  );

  const filteredEmployeesMulti = useMemo(
    () => filterEmployeesByQuery(searchMultiEmployee),
    [filterEmployeesByQuery, searchMultiEmployee]
  );

  const isEmployeeSelected = useCallback(
    (emp: Employee) => selectedEmployees.some((e) => e.id === emp.id),
    [selectedEmployees]
  );

  const toggleSelectEmployee = (emp: Employee) => {
    if (isEmployeeSelected(emp)) {
      setSelectedEmployees((prev) => prev.filter((e) => e.id !== emp.id));
    } else {
      setSelectedEmployees((prev) => [...prev, emp]);
    }
  };

  // NOTIFICATIONS
  const loadNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true);
      const [data, count] = await Promise.all([
        fetchAdminNotifications(),
        fetchUnreadCount(),
      ]);
      setNotifications(data);
      setUnreadCount(count);
    } catch (e: any) {
      console.log("loadNotifications error:", e?.message);
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const sortedNotifications = useMemo(() => {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [notifications]);

  const filteredNotifications = useMemo(() => {
    if (!searchNotification.trim()) return sortedNotifications;
    const q = searchNotification.toLowerCase();

    return sortedNotifications.filter((item) => {
      const created = new Date(item.createdAt);
      const typeLabel =
        item.type === "HOME_ATTENDANCE"
          ? "Home Attendance"
          : item.type === "ADMIN_BROADCAST"
          ? "Admin Broadcast"
          : "Employee Message";

      const nameLabel =
        item.userName && item.userCode
          ? `${item.userName} (${item.userCode})`
          : item.userName || item.userCode || `User #${item.userId}`;

      return (
        (item.message || "").toLowerCase().includes(q) ||
        nameLabel.toLowerCase().includes(q) ||
        typeLabel.toLowerCase().includes(q) ||
        created
          .toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
          .toLowerCase()
          .includes(q)
      );
    });
  }, [sortedNotifications, searchNotification]);

  // FORM
  const validate = () => {
    if (title.trim().length < 3) return "Title must be at least 3 characters";
    if (message.trim().length < 5)
      return "Message must be at least 5 characters";

    if (audience === "single") {
      if (!targetUserCode.trim()) {
        return "Employee code is required (User.user_id)";
      }
      const emp = employees.find(
        (e) => (e.user_id || "").toLowerCase() === targetUserCode.trim().toLowerCase()
      );
      if (!emp) return "Selected employee not found. Please pick from suggestions.";
    }

    if (audience === "multiple") {
      if (selectedEmployees.length === 0) {
        return "Please select at least one employee.";
      }
    }

    return null;
  };

  const handleSend = async () => {
    const err = validate();
    if (err) {
      Alert.alert("Error", err);
      return;
    }

    Alert.alert("Confirm", "Send this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Send",
        onPress: async () => {
          try {
            setLoading(true);

            if (audience === "all") {
              await sendAdminBroadcast({ title, message, audience: "all" });
            } else if (audience === "single") {
              await sendAdminBroadcast({
                title,
                message,
                audience: "single",
                userid: targetUserCode.trim(), // employee code
              });
            } else {
              const codes = selectedEmployees.map((e) => e.user_id); // employee codes
              await sendAdminBroadcast({
                title,
                message,
                audience: "multiple",
                userids: codes,
              });
            }

            Alert.alert("Success", "Notification sent");

            setTitle("");
            setMessage("");
            setAudience("all");
            setTargetUserCode("");
            setSearchEmployee("");
            setSearchMultiEmployee("");
            setSelectedEmployees([]);

            await loadNotifications();
          } catch (e: any) {
            const msg =
              e?.response?.data?.message ||
              e?.message ||
              "Failed to send notification";
            Alert.alert("Error", msg);
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  const onPressNotification = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      await markNotificationRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // ignore
    }
  };

  const renderNotificationRow = (item: NotificationItem) => {
    const created = new Date(item.createdAt);
    const dateLabel = created.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    const nameLabel =
      item.userName && item.userCode
        ? `${item.userName} (${item.userCode})`
        : item.userName || item.userCode || `User #${item.userId}`;

    const roleLabel = item.senderRole === "admin" ? "Admin" : "Employee";

    const typeLabel =
      item.type === "HOME_ATTENDANCE"
        ? "Home Attendance"
        : item.type === "ADMIN_BROADCAST"
        ? "Admin Broadcast"
        : "Employee Message";

    const unreadStyle = !item.isRead ? styles.msgCardUnread : null;

    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.msgCard, unreadStyle]}
        onPress={() => onPressNotification(item)}
        activeOpacity={0.8}
      >
        <View style={styles.msgHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.msgName}>{nameLabel}</Text>
            <View style={styles.roleRow}>
              <Text style={styles.roleBadge}>{roleLabel}</Text>
              <Text style={styles.msgType}>{typeLabel}</Text>
              {!item.isRead && <Text style={styles.unreadDot}>UNSEEN</Text>}
            </View>
          </View>
          <Text style={styles.msgMetaSmall}>{dateLabel}</Text>
        </View>

        <Text style={styles.msgText}>{item.message}</Text>
      </TouchableOpacity>
    );
  };

  const renderSelectedChips = () => {
    if (selectedEmployees.length === 0) return null;
    return (
      <View style={styles.chipsContainer}>
        {selectedEmployees.map((e) => (
          <View key={e.id} style={styles.chip}>
            <Text style={styles.chipText}>
              {e.user_id} · {e.name || "No name"}
            </Text>
            <TouchableOpacity
              onPress={() =>
                setSelectedEmployees((prev) => prev.filter((p) => p.id !== e.id))
              }
            >
              <Text style={styles.chipRemove}>×</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={behavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
        >
          <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.header}>Admin notifications</Text>
            <Text style={styles.subheader}>
              Unseen: {unreadCount}
            </Text>

            {/* SEND FORM */}
            <View style={styles.card}>
              <Text style={styles.label}>Title *</Text>
              <TextInput
                style={styles.input}
                placeholder="Short title"
                placeholderTextColor="#6b7280"
                value={title}
                onChangeText={setTitle}
                returnKeyType="next"
              />

              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Type your message..."
                placeholderTextColor="#6b7280"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Audience *</Text>
              <View style={styles.audienceRow}>
                <TouchableOpacity
                  style={[
                    styles.audienceChip,
                    audience === "all" && styles.audienceChipActive,
                  ]}
                  onPress={() => setAudience("all")}
                >
                  <Text
                    style={[
                      styles.audienceText,
                      audience === "all" && styles.audienceTextActive,
                    ]}
                  >
                    All employees
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.audienceChip,
                    audience === "single" && styles.audienceChipActive,
                  ]}
                  onPress={() => setAudience("single")}
                >
                  <Text
                    style={[
                      styles.audienceText,
                      audience === "single" && styles.audienceTextActive,
                    ]}
                  >
                    Single employee
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.audienceChip,
                    styles.lastChip,
                    audience === "multiple" && styles.audienceChipActive,
                  ]}
                  onPress={() => setAudience("multiple")}
                >
                  <Text
                    style={[
                      styles.audienceText,
                      audience === "multiple" && styles.audienceTextActive,
                    ]}
                  >
                    Multiple employees
                  </Text>
                </TouchableOpacity>
              </View>

              {audience === "single" && (
                <>
                  <Text style={styles.label}>Employee (search & tap) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Search by code or name..."
                    placeholderTextColor="#6b7280"
                    value={searchEmployee}
                    onChangeText={(text) => {
                      setSearchEmployee(text);
                      setTargetUserCode(text);
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                  />

                  {filteredEmployeesSingle.length > 0 && searchEmployee.trim() ? (
                    <View style={styles.suggestionsContainer}>
                      {filteredEmployeesSingle.slice(0, 5).map((e) => (
                        <TouchableOpacity
                          key={e.id}
                          style={styles.suggestionItem}
                          onPress={() => {
                            setTargetUserCode(e.user_id); // code
                            setSearchEmployee(`${e.user_id} - ${e.name || ""}`);
                          }}
                        >
                          <Text style={styles.suggestionText}>
                            {e.user_id} · {e.name || "No name"}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : null}
                </>
              )}

              {audience === "multiple" && (
                <>
                  <Text style={styles.label}>Employees (search & select) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Search by code or name..."
                    placeholderTextColor="#6b7280"
                    value={searchMultiEmployee}
                    onChangeText={setSearchMultiEmployee}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                  />

                  {filteredEmployeesMulti.length > 0 &&
                  searchMultiEmployee.trim().length > 0 ? (
                    <View style={styles.suggestionsContainer}>
                      {filteredEmployeesMulti.slice(0, 10).map((e) => {
                        const selected = isEmployeeSelected(e);
                        return (
                          <TouchableOpacity
                            key={e.id}
                            style={[
                              styles.suggestionItem,
                              selected && styles.suggestionItemSelected,
                            ]}
                            onPress={() => toggleSelectEmployee(e)}
                          >
                            <Text
                              style={[
                                styles.suggestionText,
                                selected && styles.suggestionTextSelected,
                              ]}
                            >
                              {e.user_id} · {e.name || "No name"}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}

                  {renderSelectedChips()}
                </>
              )}

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSend}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Send notification</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* NOTIFICATIONS LIST + SEARCH */}
            <Text style={styles.sectionHeader}>Inbox</Text>

            <TextInput
              style={[styles.input, { marginBottom: 8 }]}
              placeholder="Search notifications..."
              placeholderTextColor="#6b7280"
              value={searchNotification}
              onChangeText={setSearchNotification}
            />

            {loadingNotifications && notifications.length === 0 ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="small" color="#2563eb" />
                <Text style={styles.loadingText}>Loading notifications...</Text>
              </View>
            ) : filteredNotifications.length === 0 ? (
              <Text style={styles.emptyText}>No notifications found.</Text>
            ) : (
              filteredNotifications.map(renderNotificationRow)
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

// keep your styles; only add unread style
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e5f3ff" },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
  flex: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },

  header: { fontSize: 22, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  subheader: { fontSize: 13, color: "#64748b", marginBottom: 16 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },

  label: { fontSize: 13, color: "#0f172a", marginTop: 8, marginBottom: 4, fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 8 }),
    color: "#0f172a",
    fontSize: 14,
    backgroundColor: "#f8fafc",
  },
  textArea: { minHeight: 90 },

  audienceRow: { flexDirection: "row", marginTop: 4 },
  audienceChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    alignItems: "center",
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  lastChip: { marginRight: 0 },
  audienceChipActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  audienceText: { fontSize: 13, color: "#0f172a", fontWeight: "600" },
  audienceTextActive: { color: "#ffffff" },

  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonDisabled: { backgroundColor: "#93c5fd" },
  buttonText: { color: "#ffffff", fontSize: 15, fontWeight: "700" },

  sectionHeader: { marginTop: 20, marginBottom: 8, fontSize: 16, fontWeight: "700", color: "#0f172a" },

  centerBox: { marginTop: 16, alignItems: "center" },
  loadingText: { marginTop: 8, color: "#6b7280", fontSize: 13 },
  emptyText: { marginTop: 8, color: "#6b7280", fontSize: 13 },

  msgCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  msgCardUnread: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
  },

  msgHeaderRow: { flexDirection: "row", justifyContent: "space-between" },
  msgName: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  roleRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  roleBadge: {
    fontSize: 11,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(34,197,94,0.12)",
    color: "#15803d",
    marginRight: 6,
  },
  msgType: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(59,130,246,0.12)",
    color: "#1d4ed8",
    marginRight: 6,
  },
  unreadDot: {
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(239,68,68,0.12)",
    color: "#b91c1c",
    fontWeight: "700",
  },
  msgMetaSmall: { marginLeft: 8, fontSize: 11, color: "#6b7280" },
  msgText: { marginTop: 6, fontSize: 13, color: "#111827" },

  suggestionsContainer: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#ffffff",
  },
  suggestionItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  suggestionItemSelected: { backgroundColor: "#dbeafe" },
  suggestionText: { fontSize: 13, color: "#0f172a" },
  suggestionTextSelected: { color: "#1d4ed8", fontWeight: "600" },

  chipsContainer: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0f2fe",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginTop: 4,
  },
  chipText: { fontSize: 11, color: "#0f172a", marginRight: 6 },
  chipRemove: { fontSize: 14, color: "#ef4444", fontWeight: "700" },
});
