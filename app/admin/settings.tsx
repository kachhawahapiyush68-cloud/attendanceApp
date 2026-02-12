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
      <View style={styles.center}>
        <Text style={{ color: "#e5e7eb" }}>Admin only.</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={behavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 60}
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
              placeholderTextColor="#64748b"
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
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#020617" },
  flex: { flex: 1 },
  bgTop: {
    position: "absolute",
    top: -70,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: "rgba(59,130,246,0.25)",
  },
  bgBottom: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.25)",
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
    backgroundColor: "#020617",
  },
  card: {
    backgroundColor: "rgba(15,23,42,0.98)",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.5)",
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  input: {
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    backgroundColor: "#020617",
    color: "#e5e7eb",
    fontSize: 14,
  },
  hint: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "white", fontWeight: "700", fontSize: 15 },
});
