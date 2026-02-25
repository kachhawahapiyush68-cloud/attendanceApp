// app/admin/register.tsx
import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { registerEmployee } from "../../services/authService";
import { router } from "expo-router";

export default function RegisterEmployee() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [locLoading, setLocLoading] = useState(false);

  const nameRef = useRef<TextInput>(null);
  const userIdRef = useRef<TextInput>(null);
  const pinRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const addressRef = useRef<TextInput>(null);
  const mobileRef = useRef<TextInput>(null);

  const focusNextField = (currentIndex: number) => {
    const refs = [nameRef, userIdRef, pinRef, emailRef, addressRef, mobileRef];
    const next = refs[currentIndex + 1];
    if (next && next.current) {
      next.current.focus();
    }
  };

  const pickSelfieFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission", "Camera permission is required for selfie.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      setPhoto(result.assets[0].base64);
    }
  };

  const pickImageFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission", "Enable photo access for gallery.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      setPhoto(result.assets[0].base64);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Location permission is required.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      Alert.alert("Location set", "GPS location captured.");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to get current location.");
    } finally {
      setLocLoading(false);
    }
  };

  const validateFields = () => {
    if (name.trim().length < 2) return "Name min 2 chars";
    if (!/^[a-zA-Z0-9_-]+$/.test(userId.trim()))
      return "Valid User ID (letters, numbers, _ or -)";
    if (!/^\d{4,8}$/.test(pin.trim())) return "PIN 4-8 digits";
    if (!email.trim()) return "Email is required";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim()))
      return "Invalid email format";
    if (address.trim().length < 5) return "Address min 5 chars";
    if (!/^\d{10}$/.test(mobileNo.trim())) return "10 digit mobile";
    if (!photo) return "Selfie photo is required";
    if (latitude == null || longitude == null)
      return "Please capture location (GPS)";
    return null;
  };

  const handleRegister = async () => {
    const error = validateFields();
    if (error) {
      Alert.alert("Error", error);
      return;
    }

    Alert.alert("Confirm", "Register employee?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes",
        onPress: async () => {
          setLoading(true);
          try {
            await registerEmployee({
              user_id: userId.trim(),
              pin: pin.trim(),
              name: name.trim(),
              address: address.trim(),
              mobileNo: mobileNo.trim(),
              email: email.trim(),
              photo: photo || "",
              latitude: latitude ?? undefined,
              longitude: longitude ?? undefined,
            });

            Alert.alert("Success", "Employee registered!", [
              {
                text: "OK",
                onPress: () => {
                  router.replace("/admin/employees");
                },
              },
            ]);
          } catch (e: any) {
            Alert.alert("Error", e?.message || "Registration failed");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={behavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 60}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Register employee</Text>
              <Text style={styles.subtitle}>
                Create a new account with selfie and GPS home location.
              </Text>
            </View>

            <View style={styles.formCard}>
              {/* Name */}
              <View style={styles.inputContainer}>
                <View style={[styles.fieldIcon, styles.nameIcon]} />
                <TextInput
                  ref={nameRef}
                  style={styles.input}
                  placeholder="Full name *"
                  placeholderTextColor="#64748b"
                  value={name}
                  onChangeText={setName}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(0)}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              {/* User ID */}
              <View style={styles.inputContainer}>
                <View style={[styles.fieldIcon, styles.userIcon]} />
                <TextInput
                  ref={userIdRef}
                  style={styles.input}
                  placeholder="User ID (login) *"
                  placeholderTextColor="#64748b"
                  value={userId}
                  onChangeText={setUserId}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(1)}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              {/* PIN */}
              <View style={styles.inputContainer}>
                <View style={[styles.fieldIcon, styles.pinIcon]} />
                <TextInput
                  ref={pinRef}
                  style={styles.input}
                  placeholder="PIN (4–8 digits) *"
                  placeholderTextColor="#64748b"
                  value={pin}
                  onChangeText={setPin}
                  keyboardType="numeric"
                  secureTextEntry
                  maxLength={8}
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(2)}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              {/* Email */}
              <View style={styles.inputContainer}>
                <View style={[styles.fieldIcon, styles.emailIcon]} />
                <TextInput
                  ref={emailRef}
                  style={styles.input}
                  placeholder="Email *"
                  placeholderTextColor="#64748b"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(3)}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              {/* Address */}
              <View style={styles.addressContainer}>
                <View style={[styles.fieldIcon, styles.addressIcon]} />
                <TextInput
                  ref={addressRef}
                  style={[styles.input, styles.textArea]}
                  placeholder="Address *"
                  placeholderTextColor="#64748b"
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  returnKeyType="next"
                  onSubmitEditing={() => focusNextField(4)}
                  blurOnSubmit={false}
                  editable={!loading}
                />
              </View>

              {/* Mobile */}
              <View style={styles.inputContainer}>
                <View style={[styles.fieldIcon, styles.phoneIcon]} />
                <TextInput
                  ref={mobileRef}
                  style={styles.input}
                  placeholder="Mobile (10 digits) *"
                  placeholderTextColor="#64748b"
                  value={mobileNo}
                  onChangeText={setMobileNo}
                  keyboardType="phone-pad"
                  maxLength={10}
                  returnKeyType="done"
                  editable={!loading}
                />
              </View>

              {/* Photo (selfie) */}
              <View style={styles.photoSection}>
                {photo ? (
                  <View style={styles.photoPreviewContainer}>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${photo}` }}
                      style={styles.photoPreview}
                    />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => setPhoto(null)}
                      disabled={loading}
                    >
                      <Text style={styles.removeText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.photoButtonsRow}>
                    <TouchableOpacity
                      style={styles.photoActionBtn}
                      onPress={pickSelfieFromCamera}
                      disabled={loading}
                    >
                      <Text style={styles.photoActionText}>Take selfie *</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.photoActionBtnSecondary}
                      onPress={pickImageFromGallery}
                      disabled={loading}
                    >
                      <Text style={styles.photoActionTextSecondary}>
                        From gallery
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
                {!photo && (
                  <Text style={styles.photoHint}>
                    Selfie is required for registration.
                  </Text>
                )}
              </View>

              {/* Location */}
              <View style={styles.locationSection}>
                <TouchableOpacity
                  style={[
                    styles.locationBtn,
                    (locLoading || loading) && styles.disabledBtn,
                  ]}
                  onPress={getCurrentLocation}
                  disabled={locLoading || loading}
                >
                  {locLoading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.locationText}>
                      Capture GPS location
                    </Text>
                  )}
                </TouchableOpacity>
                <Text style={styles.locationInfo}>
                  {latitude && longitude
                    ? `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(
                        5
                      )}`
                    : "No location set yet."}
                </Text>
              </View>

              {/* Register */}
              <TouchableOpacity
                style={[styles.registerBtn, loading && styles.disabledBtn]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.registerText}>Register employee</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
    top: -90,
    right: -70,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(16,185,129,0.16)",
    bottom: -110,
    left: -80,
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: "#ffffff",
    marginBottom: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    height: 80,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  fieldIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 12,
    marginTop: 2,
  },
  nameIcon: { backgroundColor: "#10b981" },
  userIcon: { backgroundColor: "#3b82f6" },
  pinIcon: { backgroundColor: "#f59e0b" },
  emailIcon: { backgroundColor: "#0ea5e9" },
  addressIcon: { backgroundColor: "#8b5cf6" },
  phoneIcon: { backgroundColor: "#ef4444" },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#0f172a",
  },
  textArea: {
    paddingVertical: 4,
    textAlignVertical: "top",
  },
  photoSection: {
    alignItems: "center",
    marginTop: 4,
    marginBottom: 16,
  },
  photoPreviewContainer: {
    position: "relative",
  },
  photoPreview: {
    width: 110,
    height: 110,
    borderRadius: 999,
    borderWidth: 3,
    borderColor: "#10b981",
  },
  removeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(239,68,68,0.95)",
    borderRadius: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  removeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "700",
  },
  photoButtonsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
  } as any,
  photoActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#10b981",
  },
  photoActionBtnSecondary: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#e5e7eb",
  },
  photoActionText: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "700",
  },
  photoActionTextSecondary: {
    color: "#111827",
    fontSize: 12,
    fontWeight: "600",
  },
  photoHint: {
    marginTop: 6,
    fontSize: 11,
    color: "#6b7280",
  },
  locationSection: {
    marginBottom: 18,
  },
  locationBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  locationText: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "700",
  },
  locationInfo: {
    marginTop: 6,
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  registerBtn: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 4,
  },
  disabledBtn: {
    opacity: 0.7,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
});
