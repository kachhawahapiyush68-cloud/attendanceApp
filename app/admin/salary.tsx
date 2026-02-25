// app/admin/salary.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useAuthStore } from "../../Store/authStore";
import { fetchSalarySummary, SalaryItem } from "../../services/salaryService";

const current = new Date();

export default function AdminSalaryScreen() {
  const { role } = useAuthStore();

  const [month, setMonth] = useState(current.getMonth() + 1);
  const [year, setYear] = useState(current.getFullYear());

  const [items, setItems] = useState<SalaryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchSalarySummary(month, year);
      setItems(data || []);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load salary summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, month, year]);

  if (role !== "admin") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: "#0f172a" }}>Admin only.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const changeMonth = (delta: number) => {
    setMonth((prev) => {
      let m = prev + delta;
      let y = year;
      if (m < 1) {
        m = 12;
        y = y - 1;
      } else if (m > 12) {
        m = 1;
        y = y + 1;
      }
      setYear(y);
      return m;
    });
  };

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const code = (item.user_id || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [items, search]);

  const keyExtractor = (item: SalaryItem, index: number) =>
    (item.user_id && String(item.user_id)) || String(index);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <View style={styles.container}>
          {/* Header with month navigation + reload */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Text style={styles.navBtn}>{"<"}</Text>
            </TouchableOpacity>

            <Text style={styles.monthText}>
              {month.toString().padStart(2, "0")}/{year}
            </Text>

            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Text style={styles.navBtn}>{">"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reloadBtn} onPress={loadData}>
              <Text style={styles.reloadText}>Reload</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.titleRow}>
            <Text style={styles.title}>Salary report</Text>
          </View>

          <TextInput
            placeholder="Search by name or code"
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={keyExtractor}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.code}>{item.user_id}</Text>
                      {item.salaryType && (
                        <Text style={styles.typeText}>
                          {item.salaryType === "fixed" ? "Fixed salary" : "Hourly"}
                        </Text>
                      )}
                    </View>
                    <Text style={styles.total}>
                      ₹ {item.totalPay.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Hours</Text>
                    <Text style={styles.value}>
                      {item.totalHours.toFixed(2)} (OT{" "}
                      {item.totalOvertime.toFixed(2)})
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Rate</Text>
                    <Text style={styles.value}>
                      {item.hourlyRate.toFixed(2)} | OT{" "}
                      {item.overtimeHourlyRate.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.row}>
                    <Text style={styles.label}>Breakdown</Text>
                    <Text style={styles.value}>
                      Base {item.basePay.toFixed(2)} | OT{" "}
                      {item.overtimePay.toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
              ListEmptyComponent={
                <View style={styles.center}>
                  <Text style={styles.emptyText}>
                    {search
                      ? "No records match your search."
                      : "No records for this month."}
                  </Text>
                </View>
              }
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e5f3ff" },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
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
  container: { flex: 1, padding: 16 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  navBtn: {
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 8,
    color: "#0f172a",
  },
  monthText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  reloadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#2563eb",
    borderRadius: 999,
  },
  reloadText: { color: "white", fontWeight: "600", fontSize: 13 },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  searchInput: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    fontSize: 13,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  code: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  typeText: { fontSize: 11, color: "#4b5563", marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  label: { fontSize: 12, color: "#6b7280" },
  value: { fontSize: 12, color: "#0f172a" },
  total: {
    fontSize: 16,
    fontWeight: "800",
    color: "#16a34a",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
  },
});
