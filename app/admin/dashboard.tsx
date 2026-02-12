// app/admin/dashboard.tsx
import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  SafeAreaView,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore, useDisplayName } from "../../Store/authStore";

export default function AdminDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const displayName = useDisplayName();

  const cardScale = {
    register: useRef(new Animated.Value(1)).current,
    employees: useRef(new Animated.Value(1)).current,
    reports: useRef(new Animated.Value(1)).current,
    notifications: useRef(new Animated.Value(1)).current,
    salary: useRef(new Animated.Value(1)).current,
    salaryRates: useRef(new Animated.Value(1)).current,
    settings: useRef(new Animated.Value(1)).current,
    logout: useRef(new Animated.Value(1)).current,
  };

  const springConfig = {
    toValue: 1,
    friction: 6,
    tension: 120,
    useNativeDriver: true,
  } as const;

  const animatePressIn = (v: Animated.Value) => {
    Animated.spring(v, { ...springConfig, toValue: 0.96 }).start();
  };

  const animatePressOut = (v: Animated.Value) => {
    Animated.spring(v, springConfig).start();
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Logout failed");
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.backgroundDecor1} />
      <View style={styles.backgroundDecor2} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={styles.headerCard}>
            <View style={styles.headerBadge}>
              <Ionicons
                name="shield-checkmark-sharp"
                size={32}
                color="#22c55e"
              />
            </View>
            <Text style={styles.title}>Admin Control Center</Text>
            <Text style={styles.subtitle}>
              Welcome back, {displayName || "Admin"}
            </Text>
            <Text style={styles.subtitleSmall}>
              Manage your workforce, locations, and insights from one sleek
              dashboard.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionCaption}>
            Tap a card to jump into the most used admin tools.
          </Text>
        </View>

        <View style={styles.actionsContainer}>
          {/* Register Employee */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.register)}
            onPressOut={() => animatePressOut(cardScale.register)}
            onPress={() => router.push("/admin/register")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.registerCard,
                { transform: [{ scale: cardScale.register }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="person-add-sharp"
                  size={26}
                  color="#bbf7d0"
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Register employee</Text>
                <Text style={styles.cardSubtitle}>
                  Create a new user, assign a role and get them onboarded in
                  seconds.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#ecfeff" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Employees */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.employees)}
            onPressOut={() => animatePressOut(cardScale.employees)}
            onPress={() => router.push("/admin/employees")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.employeesCard,
                { transform: [{ scale: cardScale.employees }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="people-sharp" size={26} color="#bfdbfe" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Employees</Text>
                <Text style={styles.cardSubtitle}>
                  Browse all users, toggle active / inactive and manage home
                  locations.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#eff6ff" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Reports */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.reports)}
            onPressOut={() => animatePressOut(cardScale.reports)}
            onPress={() => router.push("/admin/reports")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.reportsCard,
                { transform: [{ scale: cardScale.reports }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="bar-chart-sharp"
                  size={26}
                  color="#e0e7ff"
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Reports</Text>
                <Text style={styles.cardSubtitle}>
                  Explore monthly attendance, overtime and salary-related
                  insights.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#eef2ff" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Notifications */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.notifications)}
            onPressOut={() => animatePressOut(cardScale.notifications)}
            onPress={() => router.push("/admin/notifications")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.notificationsCard,
                { transform: [{ scale: cardScale.notifications }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons
                  name="notifications-sharp"
                  size={26}
                  color="#fed7aa"
                />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Notifications</Text>
                <Text style={styles.cardSubtitle}>
                  Broadcast important updates or review home-attendance
                  requests.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#fff7ed" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Salary summary */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.salary)}
            onPressOut={() => animatePressOut(cardScale.salary)}
            onPress={() => router.push("/admin/salary")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.salaryCard,
                { transform: [{ scale: cardScale.salary }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="cash-sharp" size={26} color="#fef3c7" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Salary summary</Text>
                <Text style={styles.cardSubtitle}>
                  View salary calculated from attendance and overtime.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#fefce8" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Salary rates */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.salaryRates)}
            onPressOut={() => animatePressOut(cardScale.salaryRates)}
            onPress={() => router.push("/admin/salary-rates")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.salaryCard,
                { transform: [{ scale: cardScale.salaryRates }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="pricetag-sharp" size={26} color="#fef3c7" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Salary rates</Text>
                <Text style={styles.cardSubtitle}>
                  Set hourly and overtime rates for each employee.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#fefce8" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Settings */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.settings)}
            onPressOut={() => animatePressOut(cardScale.settings)}
            onPress={() => router.push("/admin/settings")}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.settingsCard,
                { transform: [{ scale: cardScale.settings }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="settings-sharp" size={26} color="#bae6fd" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Settings</Text>
                <Text style={styles.cardSubtitle}>
                  Configure geo-fence radius and other admin options.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons name="arrow-forward" size={18} color="#e0f2fe" />
              </View>
            </Animated.View>
          </TouchableOpacity>

          {/* Logout */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPressIn={() => animatePressIn(cardScale.logout)}
            onPressOut={() => animatePressOut(cardScale.logout)}
            onPress={handleLogout}
          >
            <Animated.View
              style={[
                styles.actionCard,
                styles.logoutCard,
                { transform: [{ scale: cardScale.logout }] },
              ]}
            >
              <View style={styles.iconCircle}>
                <Ionicons name="log-out-sharp" size={26} color="#fee2e2" />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>Logout</Text>
                <Text style={styles.cardSubtitle}>
                  Securely end your admin session and return to the login
                  screen.
                </Text>
              </View>
              <View style={styles.arrowPill}>
                <Ionicons
                  name="shield-checkmark-sharp"
                  size={18}
                  color="#fee2e2"
                />
              </View>
            </Animated.View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#020617",
  },
  scroll: {
    paddingBottom: 28,
  },
  backgroundDecor1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 260,
    height: 260,
    backgroundColor: "rgba(59,130,246,0.25)",
    borderRadius: 200,
    opacity: 0.9,
  },
  backgroundDecor2: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 260,
    height: 260,
    backgroundColor: "rgba(16,185,129,0.22)",
    borderRadius: 200,
    opacity: 0.9,
  },
  headerContainer: {
    paddingTop: Platform.select({ ios: 40, android: 32 }),
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerCard: {
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 8,
  },
  headerBadge: {
    alignSelf: "flex-start",
    padding: 10,
    borderRadius: 999,
    backgroundColor: "rgba(22,163,74,0.14)",
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#f9fafb",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#60a5fa",
    marginTop: 4,
  },
  subtitleSmall: {
    fontSize: 13,
    color: "#9ca3af",
    marginTop: 6,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  sectionCaption: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  actionCard: {
    borderRadius: 22,
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    marginBottom: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.5)",
  },
  registerCard: {
    backgroundColor: "rgba(16,185,129,0.95)",
  },
  employeesCard: {
    backgroundColor: "rgba(37,99,235,0.96)",
  },
  reportsCard: {
    backgroundColor: "rgba(79,70,229,0.97)",
  },
  notificationsCard: {
    backgroundColor: "rgba(249,115,22,0.97)",
  },
  salaryCard: {
    backgroundColor: "rgba(234,179,8,0.96)",
  },
  settingsCard: {
    backgroundColor: "rgba(14,165,233,0.96)",
  },
  logoutCard: {
    backgroundColor: "rgba(239,68,68,0.98)",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(15,23,42,0.25)",
    marginRight: 14,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "rgba(249,250,251,0.9)",
  },
  arrowPill: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.35)",
    marginLeft: 10,
  },
});
