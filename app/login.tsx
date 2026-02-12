// app/login.tsx (simplified, mobile-focused)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { login } from "../services/authService";
import { useAuthStore } from "../Store/authStore";

export default function LoginScreen() {
  const [userId, setUserId] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const roleInStore = useAuthStore((s) => s.role);

  const handleSubmit = async () => {
    if (!userId.trim() || !pin.trim()) {
      Alert.alert("Error", "Please enter User ID and PIN");
      return;
    }

    try {
      setLoading(true);
      const data = await login(userId.trim(), pin.trim());
      const role = data?.role || roleInStore;

      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else {
        router.replace("/employee/dashboard");
      }
    } catch (err: any) {
      Alert.alert("Error", err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      {/* scroll to handle very small phones + keyboard */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
      >
        {/* SIMPLE background shapes, not tied to exact width/height */}
        <View style={styles.backgroundLayer}>
          <View style={[styles.balloon, styles.balloonTop]} />
          <View style={[styles.balloon, styles.balloonBottomLeft]} />
          <View style={[styles.balloon, styles.balloonMiddleRight]} />
        </View>

        <View style={styles.container}>
          <View style={styles.header}>
            <Image
              source={require("../assets/images/logooffice.jpeg")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appName}>Attendance App</Text>
            <Text style={styles.appTagline}>Secure time & location tracking</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Login</Text>
            <Text style={styles.subtitle}>
              Use your User ID and PIN to sign in
            </Text>

            <TextInput
              placeholder="User ID"
              value={userId}
              onChangeText={setUserId}
              style={styles.input}
              autoCapitalize="none"
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              placeholder="PIN"
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              keyboardType="numeric"
              style={styles.input}
              placeholderTextColor="#9ca3af"
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Please wait..." : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    flexGrow: 1,
  },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  balloon: {
    position: "absolute",
    backgroundColor: "rgba(59,130,246,0.25)",
    width: 300,      // fixed but off-screen, only for decoration
    height: 300,
    borderRadius: 150,
  },
  balloonTop: {
    top: -120,
    right: -120,
  },
  balloonBottomLeft: {
    backgroundColor: "rgba(16,185,129,0.22)",
    bottom: -140,
    left: -120,
  },
  balloonMiddleRight: {
    backgroundColor: "rgba(168,85,247,0.18)",
    top: "40%",      // percentage for relative positioning
    right: -100,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: "center",
    paddingVertical: 32,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 8,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#e5e7eb",
  },
  appTagline: {
    marginTop: 4,
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
  },
  card: {
    width: "100%",          // responsive width
    maxWidth: 420,          // looks good on larger phones / tablets
    alignSelf: "center",
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    color: "#f9fafb",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    color: "#9ca3af",
  },
  input: {
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ ios: 12, android: 8 }),
    marginBottom: 10,
    color: "#f9fafb",
    backgroundColor: "#020617",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: "#60a5fa",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
