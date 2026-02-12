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
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { fetchReport, ReportItem } from "../../services/reportService";

export default function EmployeeHistoryScreen() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());
  const [report, setReport] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  const loadReport = async (m: number, y: number) => {
    setLoading(true);
    try {
      const data = await fetchReport(m, y); // current user by token
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport(month, year);
  }, [month, year]);

  const onChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== "ios") {
      setShowPicker(false);
    }
    if (event.type === "dismissed" || !date) return;

    setSelectedDate(date);
    const m = date.getMonth() + 1;
    const y = date.getFullYear();
    setMonth(m);
    setYear(y);
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  const monthYearLabel = () => {
    return selectedDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });
  };

  const renderStatus = (status: string) => {
    const s = status.toLowerCase();
    let bg = "rgba(16,185,129,0.1)";
    let color = "#16a34a";

    if (s.includes("absent")) {
      bg = "rgba(239,68,68,0.1)";
      color = "#ef4444";
    } else if (s.includes("late")) {
      bg = "rgba(245,158,11,0.1)";
      color = "#f59e0b";
    }

    return (
      <View style={[styles.statusPill, { backgroundColor: bg }]}>
        <Text style={[styles.statusText, { color }]}>{status}</Text>
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
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>My attendance</Text>

          {/* Centered button that opens native calendar */}
          <View style={styles.monthRow}>
            <TouchableOpacity
              style={styles.monthButton}
              onPress={openPicker}
              activeOpacity={0.8}
            >
              <Text style={styles.monthButtonText}>
                {monthYearLabel()} (tap to change)
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={report}
            keyExtractor={(_, idx) => String(idx)}
            scrollEnabled={false}
            contentContainerStyle={{ paddingTop: 12, paddingBottom: 24 }}
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
      </KeyboardAvoidingView>

      {/* Native date picker */}
      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "calendar"}
          onChange={onChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
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
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    color: "#f9fafb",
  },
  monthRow: {
    alignItems: "center",
    marginBottom: 8,
    marginTop :8
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#e5e7eb",
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  date: { fontSize: 14, fontWeight: "600", color: "#e5e7eb" },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },
  meta: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  emptyText: {
    textAlign: "center",
    marginTop: 20,
    color: "#9ca3af",
    fontSize: 13,
  },
});
