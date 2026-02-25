// app/employee/history.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { fetchReport, ReportItem } from "../../services/reportService";

export default function EmployeeHistoryScreen() {
  const today = new Date();

  // month/year used by backend to choose month bucket
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));

  const [fromDate, setFromDate] = useState<Date>(today);
  const [toDate, setToDate] = useState<Date>(today);
  const [pickerMode, setPickerMode] = useState<"from" | "to">("from");
  const [showPicker, setShowPicker] = useState(false);

  const [report, setReport] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  const fmt = (d: Date) => {
    const yy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, "0");
    const dd = d.getDate().toString().padStart(2, "0");
    return `${yy}-${mm}-${dd}`;
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

    const fromStr = fmt(fromDate);
    const toStr = fmt(toDate);

    setLoading(true);
    try {
      // employee ID is taken from token on backend
      const data = await fetchReport(m, y, undefined, fromStr, toStr);
      setReport(data);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  // initial range = whole current month, then load once
  useEffect(() => {
    const now = new Date();
    const firstOfMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );
    const lastOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    );
    setFromDate(firstOfMonth);
    setToDate(lastOfMonth);
    setMonth(String(now.getMonth() + 1));
    setYear(String(now.getFullYear()));
  }, []);

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openPicker = (mode: "from" | "to") => {
    setPickerMode(mode);
    setShowPicker(true);
  };

  const onChangeDate = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }
    if (event.type === "dismissed" || !date) return;

    if (pickerMode === "from") {
      setFromDate(date);
      const m = date.getMonth() + 1;
      const y = date.getFullYear();
      setMonth(String(m));
      setYear(String(y));
    } else {
      setToDate(date);
    }
  };

  const monthYearLabel = () => {
    // label based on fromDate (start of range)
    return fromDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  };

  const renderStatus = (status: string) => {
    const s = status.toLowerCase();
    let bg = "rgba(16,185,129,0.12)";
    let color = "#15803d";

    if (s.includes("absent")) {
      bg = "rgba(248,113,113,0.16)";
      color = "#b91c1c";
    } else if (s.includes("late")) {
      bg = "rgba(245,158,11,0.16)";
      color = "#b45309";
    }

    return (
      <View style={[styles.statusPill, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>{status}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
          <View style={[styles.circle, styles.circleBottomRight]} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={behavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>My attendance</Text>

            {/* Month label based on fromDate */}
            <View style={styles.monthRow}>
              <Text style={styles.monthLabel}>
                {monthYearLabel()} – select date range
              </Text>
            </View>

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

            {/* Apply filters button (like admin screen, but no employee ID) */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={loadReport}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Loading..." : "Apply filters"}
              </Text>
            </TouchableOpacity>

            <FlatList
              data={report}
              keyExtractor={(_, idx) => String(idx)}
              scrollEnabled={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {loading ? "Loading..." : "No records found."}
                </Text>
              }
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.date}>{item.date}</Text>
                    {renderStatus(item.status)}
                  </View>
                  <Text style={styles.meta}>
                    In: {item.in || "-"} • Out: {item.out || "-"}
                  </Text>
                  <Text style={styles.meta}>
                    Location: {item.location || "Not tracked"}
                  </Text>
                </View>
              )}
            />
          </ScrollView>

          {showPicker && (
            <DateTimePicker
              value={pickerMode === "from" ? fromDate : toDate}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              onChange={onChangeDate}
            />
          )}
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e5f3ff",
  },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
  flex: { flex: 1 },
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
    backgroundColor: "rgba(59,130,246,0.16)",
    top: -80,
    right: -60,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(22,163,74,0.14)",
    bottom: -90,
    left: -70,
  },
  circleBottomRight: {
    backgroundColor: "rgba(249,115,22,0.12)",
    bottom: -30,
    right: -40,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 10,
    color: "#0f172a",
  },
  monthRow: {
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  monthLabel: {
    fontSize: 13,
    color: "#4b5563",
    fontWeight: "600",
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  dateColumn: {
    flex: 1,
    marginRight: 8,
  },
  labelSmall: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#f8fafc",
  },
  dateButtonText: {
    color: "#0f172a",
    fontSize: 13,
  },
  button: {
    marginTop: 4,
    marginBottom: 10,
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 10,
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
  listContent: { paddingTop: 8, paddingBottom: 24 },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  date: { fontSize: 14, fontWeight: "600", color: "#0f172a" },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  meta: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#6b7280",
    fontSize: 13,
  },
});
