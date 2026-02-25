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
        {/* soft background shapes */}
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

            {/* month selector */}
            <View style={styles.monthRow}>
              <TouchableOpacity
                style={styles.monthButton}
                onPress={openPicker}
                activeOpacity={0.85}
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
    marginBottom: 12,
    marginTop: 4,
  },
  monthButton: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
  },
  monthButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
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
