// app/admin/employee-salary-detail.tsx
import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "../../services/api";

interface AttendanceRow {
  date: string;          // "YYYY-MM-DD"
  weekday: string;       // "Monday"
  inTime: string | null; // "HH:mm" IST
  outTime: string | null;
  hours: number;
  status: string;
  task: string;
  isSunday: boolean;
}

interface SalarySummary {
  user_id: string;
  name: string;
  salaryType: "hourly" | "fixed";
  presentDays: number;
  payableDays: number;
  basePay: number;
  overtimePay: number;
  totalPay: number;
  hourlyRate?: number;
  overtimeHourlyRate?: number;
  fixedMonthlySalary?: number;
  totalHours?: number;
  totalOvertime?: number;
}

interface EmployeeSalaryDetailResponse {
  success: boolean;
  summary: SalarySummary | null;
  attendance: AttendanceRow[];
}

const current = new Date();

// "2026-03-06" -> "06-03-2026"
const formatDate = (isoDate: string): string => {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  if (!y || !m || !d) return isoDate;
  return `${d}-${m}-${y}`;
};

export default function EmployeeSalaryDetailScreen() {
  const params = useLocalSearchParams();
  const userIdParam = typeof params.user_id === "string" ? params.user_id : "";
  const nameParam = typeof params.name === "string" ? params.name : "";

  const [month, setMonth] = useState(current.getMonth() + 1);
  const [year, setYear] = useState(current.getFullYear());
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<SalarySummary | null>(null);
  const [rows, setRows] = useState<AttendanceRow[]>([]);

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

  const loadData = async () => {
    if (!userIdParam) return;
    try {
      setLoading(true);
      const res = await api.get<EmployeeSalaryDetailResponse>(
        `/salary/${encodeURIComponent(userIdParam)}`,
        { params: { month, year } }
      );

      if (!res.data?.success) {
        throw new Error("Failed to load salary detail");
      }

      setSummary(res.data.summary);
      setRows(res.data.attendance || []);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load salary detail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdParam, month, year]);

  const totals = useMemo(() => {
    const totalDays = rows.length;
    const presents = rows.filter((r) => r.status !== "absent").length;
    const absents = rows.filter((r) => r.status === "absent").length;
    const sundays = rows.filter((r) => r.isSunday).length;
    return { totalDays, presents, absents, sundays };
  }, [rows]);

  const keyExtractor = (item: AttendanceRow, index: number) =>
    `${item.date}-${index}`;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <View style={styles.container}>
          {/* Header month / reload */}
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

          {/* Title */}
          <Text style={styles.title}>
            {nameParam} ({userIdParam})
          </Text>

          {/* Summary card */}
          {summary && (
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLine}>
                Type: {summary.salaryType === "fixed" ? "Fixed" : "Hourly"}
              </Text>
              <Text style={styles.summaryLine}>
                Presents: {summary.presentDays} / {summary.payableDays}
              </Text>
              <Text style={styles.summaryLine}>
                Base: ₹ {summary.basePay.toFixed(2)} | OT: ₹{" "}
                {summary.overtimePay.toFixed(2)}
              </Text>
              <Text style={styles.summaryTotal}>
                Total: ₹ {summary.totalPay.toFixed(2)}
              </Text>
            </View>
          )}

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#16a34a" />
            </View>
          ) : (
            <>
              {/* Table header */}
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.cellDate]}>Date</Text>
                <Text style={[styles.headerCell, styles.cellTime]}>In</Text>
                <Text style={[styles.headerCell, styles.cellTime]}>Out</Text>
                <Text style={[styles.headerCell, styles.cellHours]}>Hours</Text>
                <Text style={[styles.headerCell, styles.cellAtt]}>Type</Text>
                <Text style={[styles.headerCell, styles.cellRemarks]}>
                  Remarks
                </Text>
              </View>

              {/* Attendance rows */}
              <FlatList
                data={rows}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => {
                  const attType = item.status === "absent" ? "AA" : "PP";
                  const formattedDate = formatDate(item.date);
                  return (
                    <View style={styles.tableRow}>
                      <View style={styles.dateCellWrap}>
                        <Text style={styles.dateWeekday}>{item.weekday}</Text>
                        <Text style={styles.dateValue}>{formattedDate}</Text>
                      </View>
                      <Text style={[styles.cell, styles.cellTime]}>
                        {item.inTime || "-"}
                      </Text>
                      <Text style={[styles.cell, styles.cellTime]}>
                        {item.outTime || "-"}
                      </Text>
                      <Text style={[styles.cell, styles.cellHours]}>
                        {item.hours.toFixed(2)}
                      </Text>
                      <Text style={[styles.cell, styles.cellAtt]}>
                        {attType}
                      </Text>
                      <Text style={[styles.cell, styles.cellRemarks]}>
                        {item.task || ""}
                      </Text>
                    </View>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.center}>
                    <Text style={styles.emptyText}>
                      No attendance records for this month.
                    </Text>
                  </View>
                }
              />

              {/* Footer totals */}
              <View style={styles.footerCard}>
                <Text style={styles.footerLine}>
                  Days: {totals.totalDays} | Present: {totals.presents} |
                  Absent: {totals.absents} | Sunday: {totals.sundays}
                </Text>
              </View>
            </>
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
  container: { flex: 1, padding: 16 },
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
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  summaryLine: {
    fontSize: 12,
    color: "#4b5563",
  },
  summaryTotal: {
    marginTop: 4,
    fontSize: 14,
    color: "#16a34a",
    fontWeight: "700",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#cbd5e1",
    paddingVertical: 6,
    backgroundColor: "rgba(148,163,184,0.18)",
    borderRadius: 8,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  headerCell: {
    fontSize: 11,
    color: "#0f172a",
    fontWeight: "700",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 0.4,
    borderColor: "#e5e7eb",
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 4,
  },
  cell: {
    fontSize: 11,
    color: "#0f172a",
  },
  cellDate: { flex: 2.6 },
  cellTime: { flex: 1, textAlign: "center" },
  cellHours: { flex: 1, textAlign: "center" },
  cellAtt: { flex: 0.8, textAlign: "center" },
  cellRemarks: { flex: 2 },
  dateCellWrap: {
    flex: 2.6,
  },
  dateWeekday: {
    fontSize: 11,
    color: "#0f172a",
    fontWeight: "600",
  },
  dateValue: {
    fontSize: 10,
    color: "#6b7280",
  },
  listContent: { paddingBottom: 16 },
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
  },
  footerCard: {
    marginTop: 6,
    padding: 8,
    borderRadius: 12,
    backgroundColor: "#e0f2fe",
  },
  footerLine: {
    fontSize: 11,
    color: "#0f172a",
  },
});
