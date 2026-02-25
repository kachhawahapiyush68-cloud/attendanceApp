// app/admin/offices.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../Store/authStore";
import {
  fetchOffices,
  createOffice,
  updateOffice,
  Office,
} from "../../services/officeService";

export default function AdminOfficesScreen() {
  const { role } = useAuthStore();
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [newName, setNewName] = useState("");
  const [newLat, setNewLat] = useState("");
  const [newLng, setNewLng] = useState("");
  const [newRadius, setNewRadius] = useState("150");

  const [selectedOfficeId, setSelectedOfficeId] = useState<number | null>(null);
  const [editRadius, setEditRadius] = useState("");

  const loadOffices = async () => {
    try {
      setLoading(true);
      const list = await fetchOffices();
      setOffices(list);
      if (list.length > 0 && selectedOfficeId == null) {
        setSelectedOfficeId(list[0].id);
        setEditRadius(String(list[0].radius_meters));
      }
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load offices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") {
      loadOffices();
    } else {
      setLoading(false);
    }
  }, [role]);

  const handleCreateOffice = async () => {
    if (!newName.trim()) {
      Alert.alert("Validation", "Office name is required");
      return;
    }

    const radiusNum = Number(newRadius);
    if (Number.isNaN(radiusNum) || radiusNum <= 0) {
      Alert.alert("Validation", "Radius must be a positive number");
      return;
    }

    const latNum = newLat ? Number(newLat) : null;
    const lngNum = newLng ? Number(newLng) : null;

    if (newLat && (Number.isNaN(latNum) || latNum! < -90 || latNum! > 90)) {
      Alert.alert("Validation", "Latitude must be between -90 and 90");
      return;
    }
    if (newLng && (Number.isNaN(lngNum) || lngNum! < -180 || lngNum! > 180)) {
      Alert.alert("Validation", "Longitude must be between -180 and 180");
      return;
    }

    try {
      setSaving(true);
      await createOffice({
        name: newName.trim(),
        latitude: latNum,
        longitude: lngNum,
        radius_meters: radiusNum,
      });
      setNewName("");
      setNewLat("");
      setNewLng("");
      setNewRadius("150");
      await loadOffices();
      Alert.alert("Success", "Office created");
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to create office");
    } finally {
      setSaving(false);
    }
  };

  const handleSelectOffice = (office: Office) => {
    setSelectedOfficeId(office.id);
    setEditRadius(String(office.radius_meters));
  };

  const handleUpdateRadius = async () => {
    if (!selectedOfficeId) {
      Alert.alert("Validation", "Select an office first");
      return;
    }
    const radiusNum = Number(editRadius);
    if (Number.isNaN(radiusNum) || radiusNum <= 0) {
      Alert.alert("Validation", "Radius must be a positive number");
      return;
    }
    try {
      setSaving(true);
      await updateOffice(selectedOfficeId, { radius_meters: radiusNum });
      await loadOffices();
      Alert.alert("Success", "Office radius updated");
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
        {/* light background shapes */}
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={behavior}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 40}
        >
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.container}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.title}>Offices</Text>
            <Text style={styles.subtitle}>
              Create offices and configure radius for geofencing.
            </Text>

            {/* Create Office */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Create new office</Text>

              <Text style={styles.label}>Office name</Text>
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="e.g. Head Office"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.label}>Latitude (optional)</Text>
              <TextInput
                style={styles.input}
                value={newLat}
                onChangeText={setNewLat}
                keyboardType="numeric"
                placeholder="23.0225"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.label}>Longitude (optional)</Text>
              <TextInput
                style={styles.input}
                value={newLng}
                onChangeText={setNewLng}
                keyboardType="numeric"
                placeholder="72.5714"
                placeholderTextColor="#6b7280"
              />

              <Text style={styles.label}>Radius (meters)</Text>
              <TextInput
                style={styles.input}
                value={newRadius}
                onChangeText={setNewRadius}
                keyboardType="numeric"
                placeholder="150"
                placeholderTextColor="#6b7280"
              />

              <TouchableOpacity
                style={[styles.button, saving && styles.buttonDisabled]}
                disabled={saving}
                onPress={handleCreateOffice}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="#fff"
                    />
                    <Text style={styles.buttonText}>Create office</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* List + edit radius */}
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Existing offices</Text>

              {offices.length === 0 ? (
                <Text style={styles.emptyText}>No offices created yet.</Text>
              ) : (
                <>
                  <FlatList
                    data={offices}
                    keyExtractor={(item) => String(item.id)}
                    scrollEnabled={false}
                    renderItem={({ item }) => {
                      const selected = item.id === selectedOfficeId;
                      return (
                        <TouchableOpacity
                          style={[
                            styles.officeRow,
                            selected && styles.officeRowSelected,
                          ]}
                          onPress={() => handleSelectOffice(item)}
                        >
                          <View style={{ flex: 1 }}>
                            <Text style={styles.officeName}>
                              #{item.id} • {item.name}
                            </Text>
                            <Text style={styles.officeMeta}>
                              Radius: {item.radius_meters} m
                            </Text>
                          </View>
                          {selected && (
                            <Ionicons
                              name="checkmark-circle"
                              size={20}
                              color="#16a34a"
                            />
                          )}
                        </TouchableOpacity>
                      );
                    }}
                  />

                  {selectedOfficeId !== null && (
                    <>
                      <Text style={[styles.label, { marginTop: 12 }]}>
                        Update radius (meters)
                      </Text>
                      <TextInput
                        style={styles.input}
                        value={editRadius}
                        onChangeText={setEditRadius}
                        keyboardType="numeric"
                        placeholder="150"
                        placeholderTextColor="#6b7280"
                      />

                      <TouchableOpacity
                        style={[
                          styles.button,
                          saving && styles.buttonDisabled,
                        ]}
                        disabled={saving}
                        onPress={handleUpdateRadius}
                      >
                        {saving ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Ionicons
                              name="save-outline"
                              size={18}
                              color="#fff"
                            />
                            <Text style={styles.buttonText}>Save radius</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </>
                  )}
                </>
              )}
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
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e5f3ff",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 4,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 8,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 13,
  },
  button: {
    flexDirection: "row",
    backgroundColor: "#16a34a",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
    marginLeft: 6,
  },
  emptyText: {
    color: "#6b7280",
    fontSize: 13,
    marginTop: 8,
  },
  officeRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    marginTop: 4,
    alignItems: "center",
  },
  officeRowSelected: {
    backgroundColor: "#dbeafe",
  },
  officeName: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "600",
  },
  officeMeta: {
    color: "#6b7280",
    fontSize: 11,
  },
});
