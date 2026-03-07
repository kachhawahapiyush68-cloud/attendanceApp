// app/employee/dashboard.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore, useDisplayName } from "../../Store/authStore";
import { fetchUnreadCount } from "../../services/notificationService";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function EmployeeDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);
  const displayName = useDisplayName();
  const { error } = useLocalSearchParams();

  const [unreadCount, setUnreadCount] = useState(0);

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  const loadUnread = useCallback(async () => {
    try {
      const count = await fetchUnreadCount();
      setUnreadCount(count);
    } catch (e) {
      console.log("fetchUnreadCount error:", e);
    }
  }, []);

  useEffect(() => {
    loadUnread();
  }, [loadUnread]);

  const hasUnread = unreadCount > 0;
  const badgeLabel = unreadCount > 99 ? "99+" : String(unreadCount);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        {/* background shapes */}
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
          <View style={[styles.circle, styles.circleBottomRight]} />
        </View>

        {/* content */}
        <ScrollView
          style={styles.scrollContainer}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: (insets.bottom || 16) + 100 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
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

          {/* Cards */}
          <View style={styles.cardsContainer}>
            <TouchableOpacity
              style={[styles.card, styles.attendanceCard]}
              onPress={() => router.push("/employee/attendance")}
              activeOpacity={0.9}
            >
              <View style={[styles.iconCircle, styles.iconCircleGreen]}>
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

            <TouchableOpacity
              style={[styles.card, styles.historyCard]}
              onPress={() => router.push("/employee/history")}
              activeOpacity={0.9}
            >
              <View style={[styles.iconCircle, styles.iconCircleBlue]}>
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

            <TouchableOpacity
              style={[styles.card, styles.notificationsCard]}
              onPress={() => router.push("/employee/notifications")}
              activeOpacity={0.9}
            >
              <View style={styles.iconWithBadgeWrapper}>
                <View style={[styles.iconCircle, styles.iconCircleOrange]}>
                  <Text style={styles.iconText}>🔔</Text>
                </View>
                {hasUnread && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{badgeLabel}</Text>
                  </View>
                )}
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

        {/* floating logout pill */}
        <View
          style={[
            styles.logoutContainer,
            { paddingBottom: Math.max(insets.bottom, 12) },
          ]}
        >
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.9}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
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
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  circleTop: {
    backgroundColor: "rgba(59,130,246,0.18)",
    top: -110,
    right: -70,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(22,163,74,0.14)",
    bottom: -120,
    left: -80,
  },
  circleBottomRight: {
    backgroundColor: "rgba(249,115,22,0.12)",
    bottom: -40,
    right: -40,
  },
  scrollContainer: { flex: 1 },
  scrollContent: { paddingTop: 24 },
  header: {
    backgroundColor: "#ffffff",
    minHeight: Math.min(140, SCREEN_HEIGHT * 0.18),
    maxHeight: Math.min(200, SCREEN_HEIGHT * 0.25),
    justifyContent: "center",
    alignItems: "flex-start",
    borderBottomLeftRadius: Math.min(28, SCREEN_WIDTH * 0.09),
    borderBottomRightRadius: Math.min(28, SCREEN_WIDTH * 0.09),
    marginBottom: 20,
    marginHorizontal: 18,
    paddingHorizontal: Math.min(24, SCREEN_WIDTH * 0.06),
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.55)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  greeting: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: "#6b7280",
    marginBottom: 4,
  },
  title: {
    fontSize: Math.min(24, SCREEN_WIDTH * 0.06),
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
    color: "#64748b",
    fontWeight: "500",
  },
  errorCard: {
    backgroundColor: "rgba(248,113,113,0.1)",
    borderRadius: 16,
    marginHorizontal: 20,
    padding: 14,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  errorText: {
    color: "#b91c1c",
    fontWeight: "600",
    fontSize: Math.min(14, SCREEN_WIDTH * 0.035),
  },
  cardsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: Math.min(22, SCREEN_WIDTH * 0.07),
    padding: Math.min(18, SCREEN_WIDTH * 0.05),
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    minHeight: Math.min(72, SCREEN_HEIGHT * 0.1),
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
    marginBottom: 16,
  },
  attendanceCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  historyCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  notificationsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  iconCircle: {
    width: Math.min(52, SCREEN_WIDTH * 0.13),
    height: Math.min(52, SCREEN_WIDTH * 0.13),
    borderRadius: Math.min(26, SCREEN_WIDTH * 0.065),
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconCircleGreen: {
    backgroundColor: "#dcfce7",
  },
  iconCircleBlue: {
    backgroundColor: "#dbeafe",
  },
  iconCircleOrange: {
    backgroundColor: "#ffedd5",
  },
  iconText: {
    fontSize: Math.min(22, SCREEN_WIDTH * 0.055),
    color: "#0f172a",
    fontWeight: "bold",
  },
  iconWithBadgeWrapper: {
    marginRight: 14,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
  cardContent: { flex: 1 },
  cardTitle: {
    fontSize: Math.min(17, SCREEN_WIDTH * 0.043),
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Math.min(13, SCREEN_WIDTH * 0.034),
    color: "#6b7280",
    fontWeight: "500",
  },
  arrow: {
    fontSize: Math.min(20, SCREEN_WIDTH * 0.05),
    color: "#94a3b8",
    fontWeight: "300",
    marginLeft: 8,
  },
  logoutContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 10,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  logoutButton: {
    width: "90%",
    backgroundColor: "#ef4444",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    shadowColor: "#b91c1c",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  logoutText: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
