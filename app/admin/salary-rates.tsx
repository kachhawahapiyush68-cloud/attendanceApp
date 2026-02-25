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
  SafeAreaView,
} from "react-native";
import { useAuthStore } from "../../Store/authStore";
import {
  fetchSalaryRates,
  updateSalaryRate,
  SalaryRateItem,
  SalaryType,
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: "#0f172a" }}>Admin only.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleChange = (
    user_id: string,
    field: "hourlyRate" | "overtimeHourlyRate" | "fixedMonthlySalary",
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

  const handleSalaryTypeChange = (user_id: string, salaryType: SalaryType) => {
    setItems((prev) =>
      prev.map((item) =>
        item.user_id === user_id ? { ...item, salaryType } : item
      )
    );
  };

  const handleSave = async (item: SalaryRateItem) => {
    if (!item.user_id) return;

    if (item.salaryType === "hourly" && item.hourlyRate <= 0) {
      Alert.alert("Validation", "Hourly rate must be greater than 0");
      return;
    }

    if (item.salaryType === "fixed" && item.fixedMonthlySalary <= 0) {
      Alert.alert("Validation", "Fixed monthly salary must be greater than 0");
      return;
    }

    try {
      setSavingUser(item.user_id);
      await updateSalaryRate(item.user_id, {
        salary_type: item.salaryType,
        hourlyRate: item.salaryType === "hourly" ? item.hourlyRate : undefined,
        overtimeHourlyRate: item.overtimeHourlyRate,
        fixed_monthly_salary:
          item.salaryType === "fixed" ? item.fixedMonthlySalary : undefined,
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <View style={styles.container}>
          <Text style={styles.title}>Salary rates</Text>
          <Text style={styles.subtitle}>
            Set hourly or fixed salary and overtime rates per employee.
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
                  {item.name}{" "}
                  <Text style={styles.code}>({item.user_id})</Text>
                </Text>

                {/* Salary type chips */}
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      item.salaryType === "hourly" && styles.typeChipActive,
                    ]}
                    onPress={() => handleSalaryTypeChange(item.user_id, "hourly")}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        item.salaryType === "hourly" &&
                          styles.typeChipTextActive,
                      ]}
                    >
                      Hourly
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeChip,
                      item.salaryType === "fixed" && styles.typeChipActive,
                    ]}
                    onPress={() => handleSalaryTypeChange(item.user_id, "fixed")}
                  >
                    <Text
                      style={[
                        styles.typeChipText,
                        item.salaryType === "fixed" &&
                          styles.typeChipTextActive,
                      ]}
                    >
                      Fixed
                    </Text>
                  </TouchableOpacity>
                </View>

                {item.salaryType === "hourly" ? (
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
                        placeholderTextColor="#9ca3af"
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
                          handleChange(
                            item.user_id,
                            "overtimeHourlyRate",
                            text
                          )
                        }
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.row}>
                    <View style={styles.fieldBlock}>
                      <Text style={styles.label}>Fixed monthly salary</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={
                          Number.isNaN(item.fixedMonthlySalary)
                            ? ""
                            : String(item.fixedMonthlySalary)
                        }
                        onChangeText={(text) =>
                          handleChange(
                            item.user_id,
                            "fixedMonthlySalary",
                            text
                          )
                        }
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    <View style={styles.fieldBlock}>
                      <Text style={styles.label}>OT rate (optional)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        value={
                          Number.isNaN(item.overtimeHourlyRate)
                            ? ""
                            : String(item.overtimeHourlyRate)
                        }
                        onChangeText={(text) =>
                          handleChange(
                            item.user_id,
                            "overtimeHourlyRate",
                            text
                          )
                        }
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  </View>
                )}

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
    backgroundColor: "#e5f3ff",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 12,
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 16,
    textAlign: "center",
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
  name: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  code: { fontSize: 12, color: "#6b7280" },
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
    color: "#6b7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#16a34a",
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
    borderColor: "#cbd5e1",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 8, android: 6 }),
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    fontSize: 13,
  },
  typeRow: {
    flexDirection: "row",
    marginTop: 8,
    marginBottom: 4,
  },
  typeChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginRight: 8,
  },
  typeChipActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  typeChipText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "500",
  },
  typeChipTextActive: {
    color: "#f9fafb",
  },
});
