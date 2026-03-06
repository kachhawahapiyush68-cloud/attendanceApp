// app/login.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Image,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
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
    <SafeAreaView style={styles.safe}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.root}>
          {/* decorative background */}
          <View style={styles.backgroundLayer}>
            {/* big soft circles */}
            <View style={[styles.circle, styles.circleTop]} />
            <View style={[styles.circle, styles.circleBottomLeft]} />
            <View style={[styles.circle, styles.circleBottomRight]} />
            <View style={[styles.circle, styles.circleMiddleLeft]} />
            {/* little star dots */}
            {/* <View style={[styles.star, { top: 50, left: 40 }]} />
            <View style={[styles.star, { top: 90, right: 60 }]} />
            <View style={[styles.star, { top: 180, left: 120 }]} />
            <View style={[styles.star, { top: 240, right: 40 }]} />
            <View style={[styles.star, { bottom: 140, left: 60 }]} />
            <View style={[styles.star, { bottom: 90, right: 100 }]} /> */}
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.container}>
              <View style={styles.header}>
                <Image
                  source={require("../assets/logos/logo1.png")}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <Text style={styles.appName}>Attendance App</Text>
                <Text style={styles.appTagline}>
                  Secure time & location tracking
                </Text>
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
                  returnKeyType="next"
                />

                <TextInput
                  placeholder="PIN"
                  value={pin}
                  onChangeText={setPin}
                  secureTextEntry
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor="#9ca3af"
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
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
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#e5f3ff", // light, clean background
  },
  root: {
    flex: 1,
    backgroundColor: "#e5f3ff",
  },
  scrollContent: {
    flexGrow: 1,
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
  circleMiddleLeft: {
    backgroundColor: "rgba(56,189,248,0.16)",
    top: "45%",
    left: -110,
  },
  star: {
    position: "absolute",
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "rgba(148,163,184,0.8)",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 100,
    paddingBottom: 20,
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 6,
  },
  appName: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  appTagline: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
    textAlign: "center",
  },
  card: {
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    color: "#6b7280",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: Platform.select({ android: 8 }),
    marginBottom: 10,
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 12,
  },
  buttonDisabled: {
    backgroundColor: "#93c5fd",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15,
  },
});
