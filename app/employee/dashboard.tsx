// app/employee/dashboard.tsx
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useAuthStore, useDisplayName } from "../../Store/authStore";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EmployeeDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const displayName = useDisplayName();
  const { error } = useLocalSearchParams();

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>Hi, {displayName}</Text>
          <Text style={styles.title}>Employee dashboard</Text>
          <Text style={styles.subtitle}>
            Mark your attendance and review your history.
          </Text>
        </View>

        {error && (
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        )}

        <View style={styles.cardsContainer}>
          {/* Mark Attendance */}
          <TouchableOpacity
            style={[styles.card, styles.attendanceCard]}
            onPress={() => router.push("/employee/attendance")}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>✓</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Mark attendance</Text>
              <Text style={styles.cardSubtitle}>
                Use selfie and GPS to check in.
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* My History */}
          <TouchableOpacity
            style={[styles.card, styles.historyCard]}
            onPress={() => router.push("/employee/history")}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>📊</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>My history</Text>
              <Text style={styles.cardSubtitle}>
                See your monthly attendance.
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            style={[styles.card, styles.notificationsCard]}
            onPress={() => router.push("/employee/notifications")}
            activeOpacity={0.85}
          >
            <View style={styles.iconCircle}>
              <Text style={styles.iconText}>🔔</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Notifications</Text>
              <Text style={styles.cardSubtitle}>
                Send a message directly to admin.
              </Text>
            </View>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  bgTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(59,130,246,0.25)",
  },
  bgBottom: {
    position: "absolute",
    bottom: -90,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.25)",
  },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingTop: 24 },
  header: {
    backgroundColor: "rgba(15,23,42,0.98)",
    minHeight: Math.min(140, SCREEN_HEIGHT * 0.18),
    maxHeight: Math.min(200, SCREEN_HEIGHT * 0.25),
    justifyContent: "center",
    alignItems: "flex-start",
    borderBottomLeftRadius: Math.min(32, SCREEN_WIDTH * 0.1),
    borderBottomRightRadius: Math.min(32, SCREEN_WIDTH * 0.1),
    marginBottom: 20,
    marginHorizontal: 20,
    paddingHorizontal: Math.min(24, SCREEN_WIDTH * 0.06),
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.45)",
  },
  greeting: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: "#9ca3af",
    marginBottom: 4,
  },
  title: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: "#9ca3af",
    fontWeight: "500",
  },
  errorCard: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    color: "#fecaca",
    fontWeight: "600",
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: Math.min(24, SCREEN_WIDTH * 0.07),
    padding: Math.min(20, SCREEN_WIDTH * 0.05),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    minHeight: Math.min(72, SCREEN_HEIGHT * 0.1),
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
    marginBottom: 16,
  },
  attendanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10b981",
  },
  historyCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
  },
  notificationsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  iconCircle: {
    width: Math.min(56, SCREEN_WIDTH * 0.14),
    height: Math.min(56, SCREEN_WIDTH * 0.14),
    borderRadius: Math.min(28, SCREEN_WIDTH * 0.07),
    backgroundColor: "rgba(15,23,42,0.9)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  iconText: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    color: "#e5e7eb",
    fontWeight: "bold",
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: Math.min(18, SCREEN_WIDTH * 0.045),
    fontWeight: "700",
    color: "#f9fafb",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: "#9ca3af",
    fontWeight: "500",
  },
  arrow: {
    fontSize: Math.min(20, SCREEN_WIDTH * 0.05),
    color: "#64748b",
    fontWeight: "300",
    marginLeft: 8,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 24,
    right: 24,
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingVertical: Math.min(18, SCREEN_HEIGHT * 0.025),
    paddingHorizontal: Math.min(40, SCREEN_WIDTH * 0.1),
    borderRadius: Math.min(24, SCREEN_WIDTH * 0.07),
    alignItems: "center",
  },
  logoutText: {
    color: "white",
    fontSize: Math.min(17, SCREEN_WIDTH * 0.045),
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
