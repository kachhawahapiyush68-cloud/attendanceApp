// app/admin/settings.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useAuthStore } from "../../Store/authStore";
import { fetchGeoRadius, updateGeoRadius } from "../../services/settingsService";

export default function AdminSettingsScreen() {
  const { role } = useAuthStore();
  const [radius, setRadius] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const val = await fetchGeoRadius();
        setRadius(String(val));
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    if (role === "admin") {
      load();
    } else {
      setLoading(false);
    }
  }, [role]);

  const handleSave = async () => {
    const num = Number(radius);
    if (!radius.trim() || Number.isNaN(num) || num <= 0) {
      Alert.alert("Error", "Enter a valid radius in meters");
      return;
    }

    try {
      setSaving(true);
      await updateGeoRadius(num);
      Alert.alert("Success", "Radius updated");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update radius");
    } finally {
      setSaving(false);
    }
  };

  if (role !== "admin") {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={{ color: "#0f172a" }}>Admin only.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#16a34a" />
        </View>
      </SafeAreaView>
    );
  }

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
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.card}>
              <Text style={styles.title}>Geo-fence settings</Text>
              <Text style={styles.subtitle}>
                Control how far from the registered home or office location
                employees are allowed to mark attendance.
              </Text>

              <Text style={styles.label}>Allowed radius (meters)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={radius}
                onChangeText={setRadius}
                placeholder="e.g. 150"
                placeholderTextColor="#6b7280"
              />
              <Text style={styles.hint}>
                Tip: 100–200 meters usually works well in real GPS conditions
                because phone GPS error is often around 5–30 meters.
              </Text>

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                disabled={saving}
                onPress={handleSave}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.buttonText}>Save settings</Text>
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
  safe: { flex: 1, backgroundColor: "#e5f3ff" },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
  flex: { flex: 1 },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
  },
  circleTop: {
    backgroundColor: "rgba(59,130,246,0.18)",
    top: -70,
    right: -50,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(16,185,129,0.16)",
    bottom: -90,
    left: -60,
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5f3ff",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 14,
  },
  hint: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
});
