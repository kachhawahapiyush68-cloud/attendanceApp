// app/admin/dashboard.tsx
import React, { useRef, useEffect, useState } from "react";
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
import api from "../../services/api";

export default function AdminDashboard() {
  const router = useRouter();
  const logout = useAuthStore((state) => state.logout);
  const displayName = useDisplayName();

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingUnread, setLoadingUnread] = useState<boolean>(false);

  const cardScale = {
    register: useRef(new Animated.Value(1)).current,
    employees: useRef(new Animated.Value(1)).current,
    offices: useRef(new Animated.Value(1)).current,
    reports: useRef(new Animated.Value(1)).current,
    notifications: useRef(new Animated.Value(1)).current,
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

  const loadUnreadCount = async () => {
    try {
      setLoadingUnread(true);
      const res = await api.get("/notifications/unread-count");
      if (res.data?.success && typeof res.data.unreadCount === "number") {
        setUnreadCount(res.data.unreadCount);
      } else {
        setUnreadCount(0);
      }
    } catch (e) {
      console.log("Unread count error:", e);
      setUnreadCount(0);
    } finally {
      setLoadingUnread(false);
    }
  };

  useEffect(() => {
    loadUnreadCount();
  }, []);

  const goToNotifications = () => {
    router.push("/admin/notifications");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

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
                  color="#16a34a"
                />
              </View>
              <Text style={styles.title}>Admin Control Center</Text>
              <Text style={styles.subtitle}>
                Welcome back, {displayName || "Admin"}
              </Text>
              <Text style={styles.subtitleSmall}>
                Manage your workforce, locations, and insights from one clean
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
                <View style={[styles.iconCircle, styles.iconCircleGreen]}>
                  <Ionicons
                    name="person-add-sharp"
                    size={26}
                    color="#166534"
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
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
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
                <View style={[styles.iconCircle, styles.iconCircleBlue]}>
                  <Ionicons name="people-sharp" size={26} color="#1d4ed8" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Employees</Text>
                  <Text style={styles.cardSubtitle}>
                    Browse all users, toggle active / inactive and manage home
                    locations.
                  </Text>
                </View>
                <View style={styles.arrowPill}>
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
                </View>
              </Animated.View>
            </TouchableOpacity>

            {/* Offices */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() => animatePressIn(cardScale.offices)}
              onPressOut={() => animatePressOut(cardScale.offices)}
              onPress={() => router.push("/admin/offices")}
            >
              <Animated.View
                style={[
                  styles.actionCard,
                  styles.officesCard,
                  { transform: [{ scale: cardScale.offices }] },
                ]}
              >
                <View style={[styles.iconCircle, styles.iconCirclePurple]}>
                  <Ionicons
                    name="business-sharp"
                    size={26}
                    color="#6b21a8"
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Offices</Text>
                  <Text style={styles.cardSubtitle}>
                    Define office locations and geofence radius used for
                    attendance.
                  </Text>
                </View>
                <View style={styles.arrowPill}>
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
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
                <View style={[styles.iconCircle, styles.iconCircleIndigo]}>
                  <Ionicons
                    name="bar-chart-sharp"
                    size={26}
                    color="#3730a3"
                  />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Reports</Text>
                  <Text style={styles.cardSubtitle}>
                    Explore monthly attendance, overtime and salary insights.
                  </Text>
                </View>
                <View style={styles.arrowPill}>
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
                </View>
              </Animated.View>
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={() => animatePressIn(cardScale.notifications)}
              onPressOut={() => animatePressOut(cardScale.notifications)}
              onPress={goToNotifications}
            >
              <Animated.View
                style={[
                  styles.actionCard,
                  styles.notificationsCard,
                  { transform: [{ scale: cardScale.notifications }] },
                ]}
              >
                <View style={[styles.iconCircle, styles.iconCircleOrange]}>
                  <Ionicons
                    name="notifications-sharp"
                    size={26}
                    color="#c2410c"
                  />
                  {!loadingUnread && unreadCount > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Notifications</Text>
                  <Text style={styles.cardSubtitle}>
                    Broadcast updates or review home-attendance requests.
                  </Text>
                </View>
                <View style={styles.arrowPill}>
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
                </View>
              </Animated.View>
            </TouchableOpacity>

            {/* Salary rates ONLY (no salary summary) */}
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
                <View style={[styles.iconCircle, styles.iconCircleYellow]}>
                  <Ionicons name="pricetag-sharp" size={26} color="#854d0e" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Salary rates</Text>
                  <Text style={styles.cardSubtitle}>
                    Set hourly and overtime rates for each employee.
                  </Text>
                </View>
                <View style={styles.arrowPill}>
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
                </View>
              </Animated.View>
            </TouchableOpacity>

            {/* Settings */}
            {/* <TouchableOpacity
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
                <View style={[styles.iconCircle, styles.iconCircleCyan]}>
                  <Ionicons name="settings-sharp" size={26} color="#155e75" />
                </View>
                <View style={styles.cardText}>
                  <Text style={styles.cardTitle}>Settings</Text>
                  <Text style={styles.cardSubtitle}>
                    Configure geo-fence radius and other admin options.
                  </Text>
                </View>
                <View style={styles.arrowPill}>
                  <Ionicons name="arrow-forward" size={18} color="#0f172a" />
                </View>
              </Animated.View>
            </TouchableOpacity> */}

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
                <View style={[styles.iconCircle, styles.iconCircleRed]}>
                  <Ionicons name="log-out-sharp" size={26} color="#b91c1c" />
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
                    color="#991b1b"
                  />
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
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
    top: -90,
    right: -70,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(16,185,129,0.16)",
    bottom: -110,
    left: -80,
  },
  scroll: {
    paddingBottom: 28,
  },
  headerContainer: {
    paddingTop: Platform.select({ ios: 36, android: 28 }),
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  headerBadge: {
    alignSelf: "flex-start",
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#dcfce7",
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
    marginTop: 4,
  },
  subtitleSmall: {
    fontSize: 13,
    color: "#64748b",
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
    color: "#0f172a",
  },
  sectionCaption: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  actionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 24,
  },
  actionCard: {
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 14,
    overflow: "hidden",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  registerCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#16a34a",
  },
  employeesCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
  },
  officesCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#7c3aed",
  },
  reportsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#4f46e5",
  },
  notificationsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
  },
  salaryCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#eab308",
  },
  settingsCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#0ea5e9",
  },
  logoutCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#ef4444",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  iconCircleGreen: {
    backgroundColor: "#dcfce7",
  },
  iconCircleBlue: {
    backgroundColor: "#dbeafe",
  },
  iconCircleIndigo: {
    backgroundColor: "#e0e7ff",
  },
  iconCircleOrange: {
    backgroundColor: "#ffedd5",
  },
  iconCircleYellow: {
    backgroundColor: "#fef9c3",
  },
  iconCircleCyan: {
    backgroundColor: "#cffafe",
  },
  iconCirclePurple: {
    backgroundColor: "#f3e8ff",
  },
  iconCircleRed: {
    backgroundColor: "#fee2e2",
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 3,
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  arrowPill: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 999,
    backgroundColor: "#e5f3ff",
    marginLeft: 8,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ef4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "700",
  },
});
