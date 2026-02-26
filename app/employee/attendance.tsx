// app/employee/attendance.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  TextInput,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import NetInfo from "@react-native-community/netinfo";
import {
  markAttendanceRequest,
  fetchTodayStatus,
  LocationData,
  ModeType,
} from "../../services/attendanceService";

const { height } = Dimensions.get("window");

// Convert UTC string from backend to IST HH:mm format for display
function utcStringToISTTime(utcString: string): string {
  const d = new Date(utcString); // parsed as UTC
  const IST_OFFSET_MIN = 5.5 * 60;
  const utcMs = d.getTime();
  const istMs = utcMs + IST_OFFSET_MIN * 60 * 1000;
  const ist = new Date(istMs);
  const hh = ist.getHours().toString().padStart(2, "0");
  const mm = ist.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function Attendance() {
  const router = useRouter();

  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [submittedSelfie, setSubmittedSelfie] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [mode, setMode] = useState<ModeType>("in");
  const [task, setTask] = useState<string>("");

  const pulseAnimation = (value: Animated.Value) => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(value, {
          toValue: 1.1,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(value, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  useEffect(() => {
    const init = async () => {
      try {
        const state = await fetchTodayStatus();
        if (state === "in") {
          setMode("out");
        } else {
          setMode("in");
        }
      } catch {
        setMode("in");
      }
      pulseAnimation(scaleValue);
    };
    init();
  }, []);

  const takeSelfie = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission required",
          "Camera access is needed to mark attendance"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
        base64: true,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setSelfieUri(asset.uri);
        setSelfieBase64(asset.base64 || null);

        const { status: locStatus } =
          await Location.requestForegroundPermissionsAsync();
        if (locStatus !== "granted") {
          Alert.alert(
            "Permission required",
            "Location access is needed to mark attendance"
          );
          return;
        }

        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const coords: LocationData = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setLocation(coords);

        const places = await Location.reverseGeocodeAsync(coords);
        let address = `Lat: ${coords.latitude.toFixed(
          4
        )}, Lng: ${coords.longitude.toFixed(4)}`;
        if (places.length > 0) {
          const p = places[0];
          address = `${p.name || ""}, ${p.city || ""}, ${
            p.region || ""
          }`.trim();
        }
        setLocationName(address);
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to take selfie");
    }
  };

  const handleSubmit = async () => {
    if (!selfieBase64 || !location) {
      Alert.alert("Missing data", "Please take a selfie first");
      return;
    }

    if (mode === "out" && !task.trim()) {
      Alert.alert(
        "Task required",
        "Please enter what work you did before marking OUT."
      );
      return;
    }

    try {
      setLoading(true);

      const net = await NetInfo.fetch();
      const networkType = net.type || "unknown";
      const deviceId =
        Device.osInternalBuildId ?? Device.deviceName ?? "unknown";

      const officeId = 1; // TODO: replace with real officeId from user/selection

      const res = await markAttendanceRequest(
        officeId,
        "present",
        selfieUri,
        location,
        "office",
        mode,
        task.trim(),
        locationName || undefined,
        deviceId,
        networkType
      );

      if (res?.record?.location) {
        setLocationName(res.record.location);
      }
      if (res?.record?.selfie) {
        setSubmittedSelfie(res.record.selfie);
      }

      const approval =
        res?.approvalStatus === "PENDING_APPROVAL"
          ? "Pending approval"
          : "Approved (auto)";

      // Decide which time to show (IN or OUT), convert to IST
      let timeLabel = "";
      if (mode === "in" && res?.record?.in_time) {
        timeLabel = utcStringToISTTime(res.record.in_time);
      } else if (mode === "out" && res?.record?.out_time) {
        timeLabel = utcStringToISTTime(res.record.out_time);
      }

      Alert.alert(
        approval,
        `Attendance ${mode.toUpperCase()} recorded at ${
          timeLabel ? `${timeLabel} (IST)` : "your location"
        }\n${res?.record?.location || locationName || ""}`,
        [
          {
            text: "OK",
            onPress: () => {
              router.replace("/employee/dashboard");
            },
          },
        ]
      );
      
      setMode((prev) => (prev === "in" ? "out" : "in"));
      if (mode === "out") {
        setTask("");
      }
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to mark attendance");
    } finally {
      setLoading(false);
    }
  };

  const renderFloatingActionButton = () => (
    <Animated.View style={[styles.fab, { transform: [{ scale: scaleValue }] }]}>
      <TouchableOpacity
        style={styles.fabInner}
        onPress={takeSelfie}
        activeOpacity={0.7}
      >
        <Ionicons name="camera-outline" size={28} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
          <View style={[styles.circle, styles.circleBottomRight]} />
          <View style={[styles.circleSmall, styles.circleMiddle]} />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.title}>Mark attendance</Text>
              <Text style={styles.subtitle}>Selfie + GPS verification</Text>
              <Text style={styles.modeText}>
                Current action:{" "}
                {mode === "in" ? "Check-IN" : "Check-OUT (task required)"}
              </Text>
            </View>

            {selfieUri ? (
              <View style={styles.selfieCard}>
                <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
                <View style={styles.selfieOverlay}>
                  <Ionicons
                    name="checkmark-circle"
                    size={28}
                    color="#22c55e"
                  />
                  <Text style={styles.selfieStatus}>Ready to submit</Text>
                </View>
              </View>
            ) : (
              <View style={styles.selfiePlaceholder}>
                <Ionicons name="camera" size={56} color="#9ca3af" />
                <Text style={styles.placeholderText}>
                  Tap the red camera button to take a selfie
                </Text>
              </View>
            )}

            {locationName && (
              <View style={styles.locationCard}>
                <Ionicons name="location" size={18} color="#059669" />
                <Text style={styles.locationText} numberOfLines={1}>
                  {locationName}
                </Text>
              </View>
            )}

            {mode === "out" && (
              <View style={styles.taskContainer}>
                <Text style={styles.taskLabel}>Task (what work you did)</Text>
                <TextInput
                  style={styles.taskInput}
                  placeholder="Describe your work before OUT"
                  placeholderTextColor="#6b7280"
                  value={task}
                  onChangeText={setTask}
                  multiline
                />
              </View>
            )}

            <TouchableOpacity
              style={[
                styles.submitButton,
                (!selfieBase64 || !location || loading) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!selfieBase64 || !location || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark" size={18} color="#fff" />
                  <Text style={styles.submitButtonText}>
                    {mode === "in" ? "Submit IN" : "Submit OUT"}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {submittedSelfie && (
              <TouchableOpacity
                style={styles.historyCard}
                onPress={() => setModalVisible(true)}
              >
                <Image
                  source={{ uri: submittedSelfie }}
                  style={styles.historyImage}
                />
                <View style={styles.historyOverlay}>
                  <Text style={styles.historyTitle}>Latest entry</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="#f9fafb"
                  />
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {renderFloatingActionButton()}

        <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.backgroundCloseArea}
              onPress={() => setModalVisible(false)}
            />
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="close" size={26} color="#fff" />
              </TouchableOpacity>

              <ScrollView
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
              >
                {submittedSelfie ? (
                  <>
                    <View style={styles.modalImageContainer}>
                      <Image
                        source={{ uri: submittedSelfie }}
                        style={styles.modalImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={styles.modalInfo}>
                      <Text style={styles.modalLocation}>
                        📍 {locationName || "Location verified"}
                      </Text>
                      <Text style={styles.modalStatus}>
                        Attendance recorded ✅
                      </Text>
                    </View>
                  </>
                ) : (
                  <Text style={styles.noDataText}>
                    No attendance record found
                  </Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const { height: winHeight } = Dimensions.get("window");

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
  circleSmall: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: 90,
  },
  circleTop: {
    backgroundColor: "rgba(59,130,246,0.18)",
    top: -120,
    right: -80,
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
  circleMiddle: {
    backgroundColor: "rgba(56,189,248,0.16)",
    top: "40%",
    left: -70,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  modeText: {
    fontSize: 12,
    color: "#4b5563",
    marginTop: 6,
    fontWeight: "600",
  },
  selfieCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 14,
    alignItems: "center",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 6,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  selfieImage: {
    width: "100%",
    height: winHeight * 0.32,
    borderRadius: 14,
  },
  selfieOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.85)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  selfieStatus: {
    color: "#f9fafb",
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 8,
  },
  selfiePlaceholder: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 40,
    alignItems: "center",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  placeholderText: {
    color: "#4b5563",
    fontSize: 14,
    marginTop: 12,
    textAlign: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ecfdf5",
    padding: 10,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  locationText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 8,
    flex: 1,
  },
  taskContainer: {
    marginBottom: 16,
  },
  taskLabel: {
    color: "#0f172a",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  taskInput: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
    marginLeft: 6,
  },
  historyCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  historyImage: { width: "100%", height: 160 },
  historyOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(15,23,42,0.82)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  historyTitle: { color: "#f9fafb", fontSize: 14, fontWeight: "600" },
  fab: {
    position: "absolute",
    bottom: 26,
    right: 22,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    elevation: 10,
  },
  fabInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.85)" },
  backgroundCloseArea: { flex: 1 },
  modalContent: {
    position: "absolute",
    top: 50,
    bottom: 50,
    left: 24,
    right: 24,
    backgroundColor: "#111827",
    borderRadius: 24,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 18,
    right: 18,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    padding: 18,
    paddingTop: 56,
  },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalImage: { width: "100%", height: 360, borderRadius: 18 },
  modalInfo: { alignItems: "center", paddingTop: 8 },
  modalLocation: {
    fontSize: 15,
    color: "#e5e7eb",
    fontWeight: "600",
    marginBottom: 6,
    textAlign: "center",
  },
  modalStatus: {
    fontSize: 17,
    color: "#22c55e",
    fontWeight: "800",
  },
  noDataText: {
    color: "#9ca3af",
    fontSize: 15,
    textAlign: "center",
    padding: 32,
  },
});
