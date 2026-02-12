// app/admin/report-detail.tsx
import React from "react";
import { View, Text, StyleSheet, Image, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { ReportItem } from "../../services/reportService";

export default function ReportDetailScreen() {
  const params = useLocalSearchParams();
  const item: ReportItem | null =
    typeof params.item === "string"
      ? (JSON.parse(params.item) as ReportItem)
      : null;

  if (!item) {
    return (
      <View style={styles.centerRoot}>
        <Text style={styles.centerText}>Invalid record.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.title}>{item.name}</Text>
          <Text style={styles.metaHighlight}>{item.user_id}</Text>
          <Text style={styles.metaMuted}>{item.date}</Text>
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
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
    padding: 16,
    paddingBottom: 32,
  },
  centerRoot: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#020617",
  },
  centerText: {
    color: "#e5e7eb",
    fontSize: 14,
  },
  headerCard: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.55)",
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
  },
  metaHighlight: {
    fontSize: 13,
    color: "#60a5fa",
    fontWeight: "600",
  },
  metaMuted: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  label: {
    fontSize: 13,
    color: "#9ca3af",
  },
  value: {
    fontSize: 13,
    color: "#e5e7eb",
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
    backgroundColor: "rgba(22,163,74,0.2)",
    color: "#4ade80",
  },
  valueOther: {
    backgroundColor: "rgba(234,179,8,0.2)",
    color: "#facc15",
  },
  selfieCard: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  selfieImage: {
    width: "100%",
    height: 260,
    borderRadius: 12,
    marginTop: 8,
  },
  noSelfieText: {
    marginTop: 8,
    color: "#9ca3af",
    fontSize: 13,
  },
});
