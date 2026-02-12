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
  Platform,
  TextInput,
} from "react-native";
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

export default function Attendance() {
  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [selfieBase64, setSelfieBase64] = useState<string | null>(null);
  const [submittedSelfie, setSubmittedSelfie] = useState<string | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [locationName, setLocationName] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));
  const [mode, setMode] = useState<ModeType>("in"); // "in" or "out"
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
        // if already IN → show OUT, else start with IN
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
        const coords = {
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

      // TODO: replace 1 with real officeId if needed
      const officeId = 1;

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

      Alert.alert(
        approval,
        `Attendance ${mode.toUpperCase()} recorded at ${
          res?.record?.location || locationName || "your location"
        }`
      );

      // Next mode toggles after success
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
    <View style={styles.gradientContainer}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Mark attendance</Text>
          <Text style={styles.subtitle}>Selfie + GPS verification</Text>
          <Text style={styles.modeText}>
            Current action: {mode === "in" ? "Check-IN" : "Check-OUT (task required)"}
          </Text>
        </View>

        {selfieUri ? (
          <View style={styles.selfieCard}>
            <Image source={{ uri: selfieUri }} style={styles.selfieImage} />
            <View style={styles.selfieOverlay}>
              <Ionicons name="checkmark-circle" size={32} color="#4ade80" />
              <Text style={styles.selfieStatus}>Ready to submit</Text>
            </View>
          </View>
        ) : (
          <View style={styles.selfiePlaceholder}>
            <Ionicons name="camera" size={64} color="#9ca3af" />
            <Text style={styles.placeholderText}>
              Tap the red camera button to take a selfie
            </Text>
          </View>
        )}

        {locationName && (
          <View style={styles.locationCard}>
            <Ionicons name="location" size={20} color="#10b981" />
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
              placeholderTextColor="#64748b"
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
              <Ionicons name="checkmark" size={20} color="#fff" />
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
            <Image source={{ uri: submittedSelfie }} style={styles.historyImage} />
            <View style={styles.historyOverlay}>
              <Text style={styles.historyTitle}>Latest entry</Text>
              <Ionicons name="chevron-forward" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
        )}

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
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                scrollEnabled={false}
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
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: { flex: 1, backgroundColor: "#020617" },
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 24 },
  header: { alignItems: "center", marginBottom: 24 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#f9fafb",
    textAlign: "center",
  },
  subtitle: { fontSize: 13, color: "#9ca3af", marginTop: 4, fontWeight: "500" },
  modeText: {
    fontSize: 12,
    color: "#a5b4fc",
    marginTop: 6,
    fontWeight: "600",
  },
  selfieCard: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: 24,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  selfieImage: {
    width: "100%",
    height: height * 0.35,
    borderRadius: 20,
  },
  selfieOverlay: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  selfieStatus: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    marginLeft: 8,
  },
  selfiePlaceholder: {
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  placeholderText: {
    color: "#e5e7eb",
    fontSize: 14,
    marginTop: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(15,23,42,0.96)",
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(22,163,74,0.6)",
  },
  locationText: {
    color: "#bbf7d0",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    flex: 1,
  },
  taskContainer: {
    marginBottom: 16,
  },
  taskLabel: {
    color: "#e5e7eb",
    marginBottom: 4,
    fontSize: 13,
    fontWeight: "600",
  },
  taskInput: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontSize: 13,
    minHeight: 60,
    textAlignVertical: "top",
  },
  submitButton: {
    flexDirection: "row",
    backgroundColor: "#10b981",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#059669",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 18,
    elevation: 10,
  },
  submitButtonDisabled: {
    backgroundColor: "#6b7280",
    shadowColor: "#9ca3af",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "800",
    marginLeft: 8,
  },
  historyCard: {
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
  historyImage: { width: "100%", height: 180 },
  historyOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  historyTitle: { color: "#fff", fontSize: 15, fontWeight: "700" },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#dc2626",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 14,
    zIndex: 1000,
  },
  fabInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)" },
  backgroundCloseArea: { flex: 1 },
  modalContent: {
    position: "absolute",
    top: 40,
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "#111827",
    borderRadius: 24,
    overflow: "hidden",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { flexGrow: 1, padding: 20 },
  modalImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  modalImage: { width: "100%", height: 400, borderRadius: 16 },
  modalInfo: { alignItems: "center", paddingTop: 10 },
  modalLocation: {
    fontSize: 15,
    color: "#e5e7eb",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  modalStatus: {
    fontSize: 18,
    color: "#10b981",
    fontWeight: "800",
  },
  noDataText: {
    color: "#9ca3af",
    fontSize: 16,
    textAlign: "center",
    padding: 32,
  },
});
