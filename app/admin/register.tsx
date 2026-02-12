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
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={behavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 80}
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

            {/* Photo (selfie required) */}
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

            {/* Location button */}
            <View style={styles.locationSection}>
              <TouchableOpacity
                style={[styles.locationBtn, locLoading && styles.disabledBtn]}
                onPress={getCurrentLocation}
                disabled={locLoading || loading}
              >
                {locLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.locationText}>Capture GPS location</Text>
                )}
              </TouchableOpacity>
              <Text style={styles.locationInfo}>
                {latitude && longitude
                  ? `Lat: ${latitude.toFixed(5)}, Lon: ${longitude.toFixed(5)}`
                  : "No location set yet."}
              </Text>
            </View>

            {/* Register Button */}
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
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(37,99,235,0.25)",
  },
  bgBottom: {
    position: "absolute",
    bottom: -80,
    left: -70,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.25)",
  },
  flex: { flex: 1 },
  scrollContent: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: "rgba(15,23,42,0.98)",
    marginBottom: 18,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
  },
  title: {
    fontSize: 22,
    fontWeight: "900",
    color: "#f9fafb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
  },
  formCard: {
    backgroundColor: "rgba(15,23,42,0.97)",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#020617",
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#020617",
    borderRadius: 16,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingTop: 12,
    height: 80,
    borderWidth: 1,
    borderColor: "#1f2937",
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
    color: "#e5e7eb",
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
    backgroundColor: "rgba(239,68,68,0.9)",
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
  },
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
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  photoActionText: {
    color: "#f9fafb",
    fontSize: 12,
    fontWeight: "700",
  },
  photoActionTextSecondary: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: "600",
  },
  photoHint: {
    marginTop: 6,
    fontSize: 11,
    color: "#9ca3af",
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
    color: "#9ca3af",
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
