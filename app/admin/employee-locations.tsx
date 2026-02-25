// app/admin/employee-locations.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import api from "../../services/api";

interface LocationRow {
  id: number;
  street: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postcode: string | null;
  latitude: number;
  longitude: number;
  userId: number;
}

export default function EmployeeLocationsScreen() {
  const params = useLocalSearchParams();
  const userId = Number(params.userId);
  const name = (params.name as string) || "";

  const [locations, setLocations] = useState<LocationRow[]>([]);

  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");

  const [loading, setLoading] = useState(false);

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editStreet, setEditStreet] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editLat, setEditLat] = useState("");
  const [editLon, setEditLon] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await api.get(`/locations/${userId}`);
      const list = Array.isArray(res.data?.locations)
        ? res.data.locations
        : [];
      setLocations(list);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to load locations");
    }
  }, [userId]);

  useEffect(() => {
    if (!Number.isFinite(userId)) {
      Alert.alert("Error", "Invalid user id");
      return;
    }
    load();
  }, [load, userId]);

  const handleAdd = async () => {
    const nLat = Number(lat);
    const nLon = Number(lon);
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) {
      Alert.alert("Error", "Valid latitude & longitude required");
      return;
    }
    setLoading(true);
    try {
      await api.post(`/locations/${userId}`, {
        street: street || null,
        city: city || null,
        state: null,
        country: null,
        postcode: null,
        latitude: nLat,
        longitude: nLon,
      });
      setLat("");
      setLon("");
      setStreet("");
      setCity("");
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to add location");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (loc: LocationRow) => {
    setEditingId(loc.id);
    setEditStreet(loc.street || "");
    setEditCity(loc.city || "");
    setEditLat(String(loc.latitude));
    setEditLon(String(loc.longitude));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditStreet("");
    setEditCity("");
    setEditLat("");
    setEditLon("");
  };

  const handleSaveEdit = async () => {
    if (editingId == null) return;

    const nLat = Number(editLat);
    const nLon = Number(editLon);
    if (Number.isNaN(nLat) || Number.isNaN(nLon)) {
      Alert.alert("Error", "Valid latitude & longitude required");
      return;
    }

    setLoading(true);
    try {
      // small PATCH route you should add on backend:
      // PATCH /locations/:id  (update street, city, latitude, longitude)
      await api.patch(`/locations/${editingId}`, {
        street: editStreet || null,
        city: editCity || null,
        latitude: nLat,
        longitude: nLon,
      });

      cancelEdit();
      await load();
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update location");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (loc: LocationRow) => {
    Alert.alert(
      "Delete location",
      "Are you sure you want to delete this location? If it has been used in attendance, it will not be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/locations/${loc.id}`);
              await load();
            } catch (e: any) {
              Alert.alert(
                "Error",
                e?.response?.data?.message ||
                  e?.message ||
                  "Failed to delete location"
              );
            }
          },
        },
      ]
    );
  };

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
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerCard}>
              <Text style={styles.title}>Home locations</Text>
              <Text style={styles.subtitle}>
                Assign precise coordinates for {name || "this employee"} so
                distance checks stay accurate.
              </Text>
            </View>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved locations</Text>
              <Text style={styles.sectionHint}>
                Typically one home location, but you can store multiple.
              </Text>
            </View>

            <View style={styles.listWrapper}>
              <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>
                    No locations yet. Add one below.
                  </Text>
                }
                renderItem={({ item }) => {
                  const isEditing = editingId === item.id;
                  return (
                    <View style={styles.card}>
                      {isEditing ? (
                        <>
                          <Text style={styles.editLabel}>Editing</Text>
                          <TextInput
                            style={styles.input}
                            placeholder="Street / label"
                            placeholderTextColor="#6b7280"
                            value={editStreet}
                            onChangeText={setEditStreet}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="City"
                            placeholderTextColor="#6b7280"
                            value={editCity}
                            onChangeText={setEditCity}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Latitude"
                            placeholderTextColor="#6b7280"
                            keyboardType="numeric"
                            value={editLat}
                            onChangeText={setEditLat}
                          />
                          <TextInput
                            style={styles.input}
                            placeholder="Longitude"
                            placeholderTextColor="#6b7280"
                            keyboardType="numeric"
                            value={editLon}
                            onChangeText={setEditLon}
                          />
                          <View style={styles.editButtonsRow}>
                            <TouchableOpacity
                              style={[styles.smallBtn, styles.cancelBtn]}
                              onPress={cancelEdit}
                              disabled={loading}
                            >
                              <Text style={styles.smallBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.smallBtn, styles.saveBtn]}
                              onPress={handleSaveEdit}
                              disabled={loading}
                            >
                              <Text style={styles.smallBtnText}>
                                {loading ? "Saving..." : "Save"}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      ) : (
                        <>
                          <Text style={styles.cardTitle}>
                            {item.street || "Location"}
                            {item.city ? ` · ${item.city}` : ""}
                          </Text>
                          <Text style={styles.meta}>
                            Lat: {item.latitude} · Lon: {item.longitude}
                          </Text>
                          <View style={styles.cardButtonsRow}>
                            <TouchableOpacity
                              style={[styles.smallBtn, styles.editBtn]}
                              onPress={() => startEdit(item)}
                            >
                              <Text style={styles.smallBtnText}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.smallBtn, styles.deleteBtn]}
                              onPress={() => handleDelete(item)}
                            >
                              <Text style={styles.smallBtnText}>Delete</Text>
                            </TouchableOpacity>
                          </View>
                        </>
                      )}
                    </View>
                  );
                }}
              />
            </View>

            <View style={styles.form}>
              <Text style={styles.formTitle}>Add new location</Text>
              <Text style={styles.formHint}>
                Use coordinates from Google Maps to avoid mistakes in distance
                checks.
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Street / label (optional)"
                placeholderTextColor="#6b7280"
                value={street}
                onChangeText={setStreet}
              />
              <TextInput
                style={styles.input}
                placeholder="City (optional)"
                placeholderTextColor="#6b7280"
                value={city}
                onChangeText={setCity}
              />
              <TextInput
                style={styles.input}
                placeholder="Latitude"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={lat}
                onChangeText={setLat}
              />
              <TextInput
                style={styles.input}
                placeholder="Longitude"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
                value={lon}
                onChangeText={setLon}
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleAdd}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Saving..." : "Add location"}
                </Text>
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
  flex: { flex: 1 },
  backgroundLayer: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
  },
  circleTop: {
    backgroundColor: "rgba(37,99,235,0.18)",
    top: -90,
    right: -70,
  },
  circleBottomLeft: {
    backgroundColor: "rgba(16,185,129,0.16)",
    bottom: -100,
    left: -80,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 12,
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0f172a",
  },
  sectionHint: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 2,
  },
  listWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.6)",
    marginBottom: 14,
  },
  emptyText: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0f172a",
  },
  meta: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  cardButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
  },
  editButtonsRow: {
    flexDirection: "row",
    marginTop: 8,
    justifyContent: "flex-end",
  },
  smallBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginLeft: 6,
  },
  smallBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f9fafb",
  },
  editBtn: {
    backgroundColor: "#2563eb",
  },
  deleteBtn: {
    backgroundColor: "#dc2626",
  },
  saveBtn: {
    backgroundColor: "#16a34a",
  },
  cancelBtn: {
    backgroundColor: "#6b7280",
  },
  editLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 4,
  },
  form: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#cbd5e1",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
  },
  formHint: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 7 }),
    marginTop: 6,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#16a34a",
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.2,
  },
});
