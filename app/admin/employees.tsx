// app/admin/employees.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Switch,
  Alert,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../../services/api";
import { useRouter } from "expo-router";

interface EmployeeRow {
  id: number;
  user_id: string;
  name: string | null;
  email: string | null;
  mobileno: string | null;
  role: string | null;
  status: number;
}

export default function EmployeesScreen() {
  const [employees, setEmployees] = useState<EmployeeRow[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/employees");

      const raw = Array.isArray(res.data?.employees)
        ? res.data.employees
        : Array.isArray(res.data)
        ? res.data
        : [];

      const list: EmployeeRow[] = raw.map((item: any) => ({
        id: item.id,
        user_id: item.user_id ?? item.userId ?? "",
        name: item.name ?? null,
        email: item.email ?? item.mail ?? null,
        mobileno: item.mobileno ?? item.mobileNo ?? item.mobile ?? null,
        role: item.role ?? item.user_role ?? null,
        status:
          typeof item.status === "number"
            ? item.status
            : item.status
            ? 1
            : 0,
      }));

      setEmployees(list);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load employees");
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleStatus = async (emp: EmployeeRow) => {
    try {
      const newStatus = emp.status ? 0 : 1;
      setEmployees((prev) =>
        prev.map((e) => (e.id === emp.id ? { ...e, status: newStatus } : e))
      );
      await api.patch(`/users/${emp.id}/status`, {
        status: newStatus,
      });
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update status");
      load();
    }
  };

  const filteredEmployees = employees.filter((e) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const uid = (e.user_id || "").toLowerCase();
    const name = (e.name || "").toLowerCase();
    const email = (e.email || "").toLowerCase();
    const mob = (e.mobileno || "").toLowerCase();
    return (
      uid.includes(q) || name.includes(q) || email.includes(q) || mob.includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <View style={styles.headerContainer}>
          <Text style={styles.header}>Employees</Text>
          <Text style={styles.subheader}>
            Total: {employees.length} · Manage access and locations
          </Text>

          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, ID, email, mobile..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={load} />
          }
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(item.name || item.user_id || "?")
                    .trim()
                    .charAt(0)
                    .toUpperCase()}
                </Text>
              </View>

              <View style={styles.cardMain}>
                <Text style={styles.name}>{item.name || "No name"}</Text>
                <Text style={styles.meta}>ID · {item.user_id}</Text>
                <Text style={styles.meta}>Email · {item.email || "-"}</Text>
                <Text style={styles.meta}>
                  Mobile · {item.mobileno || "-"}
                </Text>
                <Text style={styles.meta}>Role · {item.role || "-"}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.locationBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/employee-locations",
                        params: {
                          userId: String(item.id),
                          name: item.name || item.user_id,
                        },
                      })
                    }
                  >
                    <Ionicons
                      name="location-sharp"
                      size={14}
                      color="#0f172a"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.locationBtnText}>
                      Manage locations
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.editBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/admin/employee-edit",
                        params: {
                          id: String(item.id),
                          user_id: item.user_id,
                          name: item.name || "",
                        },
                      })
                    }
                  >
                    <Ionicons
                      name="create-outline"
                      size={14}
                      color="#0f172a"
                      style={{ marginRight: 4 }}
                    />
                    <Text style={styles.editBtnText}>Edit</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.statusBlock}>
                <Text
                  style={[
                    styles.statusText,
                    item.status ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  {item.status ? "Active" : "Inactive"}
                </Text>
                <Switch
                  value={!!item.status}
                  onValueChange={() => toggleStatus(item)}
                />
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No employees found.</Text>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e5f3ff",
  },
  root: {
    flex: 1,
    backgroundColor: "#e5f3ff",
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  circleTop: {
    backgroundColor: "rgba(59,130,246,0.18)",
    top: -70,
    right: -50,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(16,185,129,0.16)",
    bottom: -90,
    left: -60,
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  header: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 2,
  },
  subheader: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 8,
  },
  searchInput: {
    marginTop: 4,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    fontSize: 13,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#1d4ed8",
    fontWeight: "800",
    fontSize: 16,
  },
  cardMain: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 2,
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  statusBlock: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
    marginBottom: 6,
  },
  statusActive: {
    backgroundColor: "rgba(34,197,94,0.12)",
    color: "#15803d",
  },
  statusInactive: {
    backgroundColor: "rgba(239,68,68,0.12)",
    color: "#b91c1c",
  },
  locationBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#e0f2fe",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
  },
  locationBtnText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  editBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "#fee2e2",
    flexDirection: "row",
    alignItems: "center",
  },
  editBtnText: {
    fontSize: 12,
    color: "#b91c1c",
    fontWeight: "600",
  },
  emptyText: {
    textAlign: "center",
    marginTop: 24,
    color: "#6b7280",
    fontSize: 13,
  },
});
