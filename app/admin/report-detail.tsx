// app/admin/report-detail.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
} from "react-native";
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
      <SafeAreaView style={styles.safe}>
        <View style={styles.centerRoot}>
          <Text style={styles.centerText}>Invalid record.</Text>
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
