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
  SafeAreaView,
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

  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [year, setYear] = useState(String(now.getFullYear()));

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

    const fmt = (d: Date) => {
      const yy = d.getFullYear();
      const mm = (d.getMonth() + 1).toString().padStart(2, "0");
      const dd = d.getDate().toString().padStart(2, "0");
      return `${yy}-${mm}-${dd}`;
    };

    const fromStr = fmt(fromDate);
    const toStr = fmt(toDate);

    try {
      setLoading(true);
      const data = await fetchReport(
        m,
        y,
        employeeId || undefined,
        fromStr,
        toStr
      );
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

    const base = pickerMode === "from" ? date : fromDate;
    const m = base.getMonth() + 1;
    const y = base.getFullYear();
    setMonth(String(m));
    setYear(String(y));
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={behavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 80}
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
                  `${item.user_id}-${item.date}-${idx}`
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e5f3ff" },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
  flex: { flex: 1 },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  circle: { position: "absolute", width: 220, height: 220, borderRadius: 110 },
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
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: { fontSize: 13, color: "#64748b" },
  filterCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  labelSmall: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  dateRow: { flexDirection: "row", justifyContent: "space-between" },
  dateColumn: { flex: 1, marginRight: 8 },
  dateButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
  },
  dateButtonText: { color: "#0f172a", fontSize: 13 },
  employeeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 7 }),
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 13,
    marginRight: 8,
  },
  hint: { fontSize: 11, color: "#6b7280", marginTop: 6 },
  button: {
    marginTop: 10,
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#f9fafb", fontWeight: "700", fontSize: 14 },
  listWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 6,
  },
  listContent: { paddingTop: 4, paddingBottom: 8 },
  emptyText: {
    textAlign: "center",
    marginTop: 14,
    color: "#6b7280",
    fontSize: 13,
  },
  card: {
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  name: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  status: {
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    overflow: "hidden",
  },
  statusPresent: {
    backgroundColor: "rgba(22,163,74,0.12)",
    color: "#15803d",
  },
  statusOther: {
    backgroundColor: "rgba(234,179,8,0.12)",
    color: "#92400e",
  },
  meta: { fontSize: 12, color: "#6b7280", marginTop: 1 },
});
