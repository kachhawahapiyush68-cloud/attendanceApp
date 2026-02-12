// app/admin/salary-rates.tsx
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useAuthStore } from "../../Store/authStore";
import {
  fetchSalaryRates,
  updateSalaryRate,
  SalaryRateItem,
} from "../../services/salaryRateService";

export default function AdminSalaryRatesScreen() {
  const { role } = useAuthStore();

  const [items, setItems] = useState<SalaryRateItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingUser, setSavingUser] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchSalaryRates();
      setItems(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load salary rates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      loadData();
    }
  }, [role]);

  if (role !== "admin") {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#e5e7eb" }}>Admin only.</Text>
      </View>
    );
  }

  const handleChange = (
    user_id: string,
    field: "hourlyRate" | "overtimeHourlyRate",
    value: string
  ) => {
    setItems((prev) =>
      prev.map((item) =>
        item.user_id === user_id
          ? {
              ...item,
              [field]: Number.isNaN(Number(value)) ? 0 : Number(value),
            }
          : item
      )
    );
  };

  const handleSave = async (item: SalaryRateItem) => {
    if (!item.user_id) return;
    if (item.hourlyRate <= 0) {
      Alert.alert("Validation", "Hourly rate must be greater than 0");
      return;
    }

    try {
      setSavingUser(item.user_id);
      await updateSalaryRate(item.user_id, {
        hourlyRate: item.hourlyRate,
        overtimeHourlyRate: item.overtimeHourlyRate,
      });
      Alert.alert("Success", "Rates updated");
    } catch (e: any) {
      Alert.alert(
        "Error",
        e?.message || "Failed to update salary rates for employee"
      );
    } finally {
      setSavingUser(null);
    }
  };

  const filteredItems = useMemo(() => {
    const text = searchText.trim().toLowerCase();
    if (!text) return items;

    return items.filter((item) => {
      const inName = item.name?.toLowerCase().includes(text);
      const inId = item.user_id?.toLowerCase().includes(text);
      return inName || inId;
    });
  }, [items, searchText]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <View style={styles.container}>
        <Text style={styles.title}>Salary rates</Text>
        <Text style={styles.subtitle}>
          Set hourly and overtime rates per employee. Monthly salary is then
          calculated from attendance and these rates.
        </Text>

        {/* Search filter */}
        <View style={styles.filterRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or ID"
            placeholderTextColor="#6b7280"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.user_id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No employees found.</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.name}>
                {item.name} <Text style={styles.code}>({item.user_id})</Text>
              </Text>

              <View style={styles.row}>
                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>Hourly rate</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={
                      Number.isNaN(item.hourlyRate)
                        ? ""
                        : String(item.hourlyRate)
                    }
                    onChangeText={(text) =>
                      handleChange(item.user_id, "hourlyRate", text)
                    }
                    placeholder="0"
                    placeholderTextColor="#64748b"
                  />
                </View>

                <View style={styles.fieldBlock}>
                  <Text style={styles.label}>OT rate</Text>
                  <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={
                      Number.isNaN(item.overtimeHourlyRate)
                        ? ""
                        : String(item.overtimeHourlyRate)
                    }
                    onChangeText={(text) =>
                      handleChange(item.user_id, "overtimeHourlyRate", text)
                    }
                    placeholder="0"
                    placeholderTextColor="#64748b"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.button,
                  savingUser === item.user_id && styles.buttonDisabled,
                ]}
                onPress={() => handleSave(item)}
                disabled={savingUser === item.user_id}
              >
                {savingUser === item.user_id ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Save rates</Text>
                )}
              </TouchableOpacity>
            </View>
          )}
        />
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
    backgroundColor: "#020617",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    color: "#9ca3af",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  name: { fontSize: 15, fontWeight: "700", color: "#f9fafb" },
  code: { fontSize: 12, color: "#9ca3af" },
  row: {
    flexDirection: "row",
    marginTop: 8,
  },
  fieldBlock: {
    flex: 1,
    marginRight: 8,
  },
  label: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    color: "#e5e7eb",
    backgroundColor: "#020617",
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#10b981",
    paddingVertical: 8,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    color: "#e5e7eb",
    backgroundColor: "#020617",
    fontSize: 13,
  },
});
