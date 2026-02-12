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
} from "react-native";
import { useAuthStore } from "../../Store/authStore";
import { fetchSalarySummary, SalaryItem } from "../../services/salaryService";

const current = new Date();

export default function AdminSalaryScreen() {
  const { role } = useAuthStore();

  // keep month/year for API + UI
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
      // optional: clear search when reloading
      // setSearch("");
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
      <View style={styles.center}>
        <Text style={{ color: "#e5e7eb" }}>Admin only.</Text>
      </View>
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

  // memoized filtered list (search by name or user_id)
  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const code = (item.user_id || "").toLowerCase();
      return name.includes(q) || code.includes(q);
    });
  }, [items, search]);

  // safe key extractor
  const keyExtractor = (item: SalaryItem, index: number) =>
    (item.user_id && String(item.user_id)) || String(index);

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

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

        {/* Title (optional) */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>Salary Report</Text>
        </View>

        {/* Search bar */}
        <TextInput
          placeholder="Search by name or code"
          placeholderTextColor="#6b7280"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#10b981" />
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  bgTop: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: "rgba(59,130,246,0.25)",
  },
  bgBottom: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.25)",
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
    color: "#e5e7eb",
  },
  monthText: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#f9fafb",
  },
  reloadBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#10b981",
    borderRadius: 999,
  },
  reloadText: { color: "white", fontWeight: "600", fontSize: 13 },
  titleRow: {
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#f9fafb",
  },
  searchInput: {
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.9)",
    color: "#e5e7eb",
    borderWidth: 1,
    borderColor: "rgba(55,65,81,0.9)",
    fontSize: 13,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  name: { fontSize: 15, fontWeight: "700", color: "#f9fafb" },
  code: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  label: { fontSize: 12, color: "#9ca3af" },
  value: { fontSize: 12, color: "#e5e7eb" },
  total: {
    fontSize: 16,
    fontWeight: "800",
    color: "#22c55e",
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
  },
});
