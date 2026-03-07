// app/admin/report-detail.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ReportItem } from "../../services/reportService";
import api from "../../services/api";

// API status type (we will always use "present")
type ApiStatus = "present" | "absent" | "late" | "half_day";

type EditMode = "none" | "add" | "edit";

export default function ReportDetailScreen() {
  const params = useLocalSearchParams();

  const itemParam: ReportItem | null =
    typeof params.item === "string"
      ? (JSON.parse(params.item) as ReportItem)
      : null;

  if (!itemParam) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerRoot}>
          <Text style={styles.centerText}>Invalid record.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const [item, setItem] = useState<ReportItem>(itemParam);

  // Which operation are we doing: add or edit?
  const [mode, setMode] = useState<EditMode>("none");

  // Always keep officeId = "1" internally, do not show
  const [officeId] = useState("1");

  // Editable fields
  const [date, setDate] = useState(item.date); // admin can change date
  const [inTime, setInTime] = useState(item.in || "");
  const [outTime, setOutTime] = useState(item.out || "");

  // We keep status in state but never show; always "present"
  const [status] = useState<ApiStatus>("present");

  const [task, setTask] = useState("");
  const [saving, setSaving] = useState(false);

  const validateCommon = () => {
    if (!item.user_id || !date || !officeId) {
      Alert.alert("Validation", "User, date and office are required");
      return false;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert("Validation", "Date must be in YYYY-MM-DD format");
      return false;
    }

    if (inTime && !/^\d{2}:\d{2}$/.test(inTime)) {
      Alert.alert("Validation", "In time format should be HH:mm (24h)");
      return false;
    }
    if (outTime && !/^\d{2}:\d{2}$/.test(outTime)) {
      Alert.alert("Validation", "Out time format should be HH:mm (24h)");
      return false;
    }
    return true;
  };

  const applyResponseToItem = (att: any) => {
    setItem((prev) => ({
      ...prev,
      date: att.date,
      in: att.inTime,
      out: att.outTime,
      status:
        att.status === "present"
          ? "Present"
          : att.status === "absent"
          ? "Absent"
          : att.status === "late"
          ? "Late"
          : "Half day",
    }));
  };

  // EDIT existing (partial allowed)
  const handleEditSave = async () => {
    if (!validateCommon()) return;

    try {
      setSaving(true);

      const body: any = {
        user_id: item.user_id,
        officeId: Number(officeId),
        date,
        status: "present", // always present
        task: task || "Edited from report detail",
      };
      if (inTime) body.inTime = inTime;
      if (outTime) body.outTime = outTime;

      const res = await api.put("/attendance/admin/edit", body);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to save attendance");
      }

      if (res.data.attendance) {
        applyResponseToItem(res.data.attendance);
      }

      setMode("none");
      Alert.alert("Success", "Attendance updated");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  // ADD attendance (admin enters date + full times)
  const handleAddSave = async () => {
    if (!validateCommon()) return;

    if (!inTime || !outTime) {
      Alert.alert(
        "Validation",
        "For adding new attendance please enter both IN and OUT time"
      );
      return;
    }

    try {
      setSaving(true);

      const body: any = {
        user_id: item.user_id,
        officeId: Number(officeId),
        date, // e.g. "2026-03-03"
        inTime,
        outTime,
        status: "present", // always present
        task: task || "Manually marked present",
      };

      const res = await api.put("/attendance/admin/edit", body);

      if (!res.data?.success) {
        throw new Error(res.data?.message || "Failed to add attendance");
      }

      if (res.data.attendance) {
        applyResponseToItem(res.data.attendance);
      }

      setMode("none");
      Alert.alert("Success", "Attendance added");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to add attendance");
    } finally {
      setSaving(false);
    }
  };

  const isEditing = mode !== "none";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerCard}>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.metaHighlight}>{item.user_id}</Text>
            <Text style={styles.metaMuted}>{item.date}</Text>

            <View style={styles.headerButtonsRow}>
              <TouchableOpacity
                style={[styles.headerButton, styles.addButton]}
                onPress={() => {
                  // prepare form for ADD
                  setMode("add");
                  setDate(item.date); // admin can change this
                  setInTime("");
                  setOutTime("");
                  setTask("Manually marked present");
                }}
              >
                <Text style={styles.headerButtonText}>Add attendance</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.headerButton, styles.editButton]}
                onPress={() => {
                  if (mode === "edit") {
                    setMode("none");
                    return;
                  }
                  // prepare form for EDIT
                  setMode("edit");
                  setDate(item.date);
                  setInTime(item.in || "");
                  setOutTime(item.out || "");
                  setTask("");
                }}
              >
                <Text style={styles.headerButtonText}>
                  {mode === "edit" ? "Cancel" : "Edit attendance"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.sectionTitle}>Attendance details</Text>

            <View style={styles.row}>
              <Text style={styles.label}>Status</Text>
              <Text
                style={[
                  styles.valueBadge,
                  item.status === "Present"
                    ? styles.valuePresent
                    : styles.valueOther,
                ]}
              >
                {item.status}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>In</Text>
              <Text style={styles.value}>{item.in || "-"}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Out</Text>
              <Text style={styles.value}>{item.out || "-"}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Location</Text>
              <Text style={styles.value}>
                {item.location || "Not tracked"}
              </Text>
            </View>
          </View>

          {isEditing && (
            <View style={styles.editCard}>
              <Text style={styles.sectionTitle}>
                {mode === "add" ? "Add attendance" : "Edit attendance"}
              </Text>

              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                placeholder="2026-03-03"
                value={date}
                onChangeText={setDate}
              />

              <Text style={styles.label}>In Time (HH:mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="13:00"
                value={inTime}
                onChangeText={setInTime}
              />

              <Text style={styles.label}>Out Time (HH:mm)</Text>
              <TextInput
                style={styles.input}
                placeholder="19:30"
                value={outTime}
                onChangeText={setOutTime}
              />

              {/* Status is always present, so we don't show any control */}

              <Text style={styles.label}>Task / Remarks</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={task}
                onChangeText={setTask}
                multiline
                numberOfLines={3}
              />

              {/* Single button depending on mode */}
              {mode === "add" ? (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    styles.saveAddButton,
                    saving && styles.saveButtonDisabled,
                  ]}
                  onPress={handleAddSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? "Saving..." : "Save as ADD"}
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    styles.saveEditButton,
                    saving && styles.saveButtonDisabled,
                  ]}
                  onPress={handleEditSave}
                  disabled={saving}
                >
                  <Text style={styles.saveButtonText}>
                    {saving ? "Saving..." : "Save EDIT"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.selfieCard}>
            <Text style={styles.sectionTitle}>Selfie</Text>
            {item.selfie ? (
              <Image
                source={{ uri: item.selfie }}
                style={styles.selfieImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.noSelfieText}>No selfie available.</Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e5f3ff",
  },
  root: {
    flex: 1,
    backgroundColor: "#e5f3ff",
  },
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
  container: {
    padding: 16,
    paddingBottom: 32,
  },
  centerRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    color: "#0f172a",
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  metaHighlight: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },
  metaMuted: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  headerButtonsRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  headerButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 999,
    alignItems: "center",
  },
  addButton: {
    backgroundColor: "#10b981",
  },
  editButton: {
    backgroundColor: "#2563eb",
  },
  headerButtonText: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "700",
  },
  infoCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 14,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
  },
  value: {
    fontSize: 13,
    color: "#0f172a",
    maxWidth: "60%",
    textAlign: "right",
  },
  valueBadge: {
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    overflow: "hidden",
    textAlign: "center",
    minWidth: 70,
  },
  valuePresent: {
    backgroundColor: "rgba(22,163,74,0.12)",
    color: "#15803d",
  },
  valueOther: {
    backgroundColor: "rgba(234,179,8,0.12)",
    color: "#92400e",
  },
  editCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    fontSize: 13,
    color: "#0f172a",
    marginBottom: 8,
  },
  inputMultiline: { height: 80, textAlignVertical: "top" },
  saveButton: {
    marginTop: 10,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  saveAddButton: {
    backgroundColor: "#0ea5e9",
  },
  saveEditButton: {
    backgroundColor: "#16a34a",
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },
  selfieCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginTop: 4,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  selfieImage: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    marginTop: 8,
  },
  noSelfieText: {
    marginTop: 8,
    color: "#6b7280",
    fontSize: 13,
  },
});
