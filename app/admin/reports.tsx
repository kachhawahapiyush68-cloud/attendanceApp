// app/admin/reports.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { fetchReport, ReportItem } from "../../services/reportService";
import { fetchEmployees, Employee } from "../../services/employeeService";

export default function ReportsScreen() {
  const router = useRouter();
  const now = new Date();

  // we still use month/year for backend API
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

  // from/to for calendar filter (you can extend backend later to use both)
  const [fromDate, setFromDate] = useState<Date>(now);
  const [toDate, setToDate] = useState<Date>(now);
  const [pickerMode, setPickerMode] = useState<"from" | "to">("from");
  const [showPicker, setShowPicker] = useState(false);

  const [employeeId, setEmployeeId] = useState("");
  const [report, setReport] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);

  const loadEmployees = async () => {
    try {
      const data = await fetchEmployees();
      setEmployees(data);
    } catch {
      // ignore
    }
  };

  const loadReport = async () => {
    const m = Number(month);
    const y = Number(year);

    if (!m || m < 1 || m > 12) {
      Alert.alert("Validation", "Month must be between 1 and 12");
      return;
    }
    if (!y || y < 2000) {
      Alert.alert("Validation", "Enter a valid year");
      return;
    }

    try {
      setLoading(true);
      const data = await fetchReport(m, y, employeeId || undefined);
      setReport(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  const openPicker = (mode: "from" | "to") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (event.type === "dismissed" || !date) return;

    if (pickerMode === "from") {
      setFromDate(date);
    } else {
      setToDate(date);
    }

    // also update month/year from "from" date (main filter for backend)
    const base = pickerMode === "from" ? date : fromDate;
    const m = base.getMonth() + 1;
    const y = base.getFullYear();
    setMonth(String(m));
    setYear(String(y));
  };

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={behavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 80}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <Text style={styles.title}>Monthly attendance</Text>
            <Text style={styles.subtitle}>
              Filter by date range and (optionally) a single employee.
            </Text>
          </View>

          <View style={styles.filterCard}>
            <Text style={styles.filterLabel}>Filters</Text>

            {/* From / To date selectors */}
            <View style={styles.dateRow}>
              <View style={styles.dateColumn}>
                <Text style={styles.labelSmall}>From</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => openPicker("from")}
                >
                  <Text style={styles.dateButtonText}>
                    {fromDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateColumn}>
                <Text style={styles.labelSmall}>To</Text>
                <TouchableOpacity
                  style={styles.dateButton}
                  onPress={() => openPicker("to")}
                >
                  <Text style={styles.dateButtonText}>
                    {toDate.toLocaleDateString()}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Employee ID input (no dropdown) */}
            <Text style={[styles.labelSmall, { marginTop: 10 }]}>
              Employee ID
            </Text>
            <View style={styles.employeeRow}>
              <TextInput
                style={[styles.input, { flex: 1, marginRight: 0 }]}
                placeholder="Type employee ID..."
                placeholderTextColor="#64748b"
                value={employeeId}
                onChangeText={setEmployeeId}
              />
            </View>

            {employees.length > 0 && (
              <Text style={styles.hint}>
                Example IDs:{" "}
                {employees
                  .slice(0, 3)
                  .map((e) => e.user_id)
                  .join(", ")}
                {employees.length > 3 ? "..." : ""} (
                {employees
                  .slice(0, 3)
                  .map((e) => e.name || "No name")
                  .join(", ")}
                )
              </Text>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={loadReport}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : "Apply filters"}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.listWrapper}>
            <Text style={styles.sectionTitle}>Results</Text>

            <FlatList
              data={report}
              keyExtractor={(item, idx) =>
                String(
                  (item as any).id ?? `${item.user_id}-${item.date}-${idx}`
                )
              }
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>No records found.</Text>
              }
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    router.push({
                      pathname: "/admin/report-detail",
                      params: { item: JSON.stringify(item) },
                    })
                  }
                >
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text
                      style={[
                        styles.status,
                        item.status === "Present"
                          ? styles.statusPresent
                          : styles.statusOther,
                      ]}
                    >
                      {item.status}
                    </Text>
                  </View>
                  <Text style={styles.meta}>ID · {item.user_id}</Text>
                  <Text style={styles.meta}>Date · {item.date}</Text>
                  <Text style={styles.meta}>
                    In · {item.in || "-"} • Out · {item.out || "-"}
                  </Text>
                  <Text style={styles.meta}>
                    Location · {item.location || "Not tracked"}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>

        {showPicker && (
          <DateTimePicker
            value={pickerMode === "from" ? fromDate : toDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={onChangeDate}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  flex: { flex: 1 },
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.55)",
    marginBottom: 12,
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
  },
  filterCard: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
    marginBottom: 14,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 6,
  },
  labelSmall: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dateColumn: {
    flex: 1,
    marginRight: 8,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#020617",
  },
  dateButtonText: {
    color: "#e5e7eb",
    fontSize: 13,
  },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 7 }),
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontSize: 13,
    marginRight: 8,
  },
  hint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 6,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },
  listWrapper: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 6,
  },
  listContent: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  emptyText: {
    textAlign: "center",
    marginTop: 14,
    color: "#9ca3af",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#020617",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(31,41,55,0.9)",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  name: {
    fontSize: 14,
    fontWeight: "700",
    color: "#f9fafb",
  },
  status: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  statusPresent: {
    backgroundColor: "rgba(22,163,74,0.2)",
    color: "#4ade80",
  },
  statusOther: {
    backgroundColor: "rgba(234,179,8,0.2)",
    color: "#facc15",
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 1,
  },
});

