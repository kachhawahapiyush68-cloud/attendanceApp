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

  const behavior = Platform.OS === "ios" ? "padding" : "height";

  return (
    <View style={styles.root}>
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={behavior}
        keyboardVerticalOffset={Platform.OS === "ios" ? 10 : 0}
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
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>
                    {item.street || "Location"}
                    {item.city ? ` · ${item.city}` : ""}
                  </Text>
                  <Text style={styles.meta}>
                    Lat: {item.latitude} · Lon: {item.longitude}
                  </Text>
                </View>
              )}
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
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#020617",
  },
  flex: { flex: 1 },
  bgTop: {
    position: "absolute",
    top: -80,
    right: -60,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(37,99,235,0.22)",
  },
  bgBottom: {
    position: "absolute",
    bottom: -80,
    left: -60,
    width: 260,
    height: 260,
    borderRadius: 200,
    backgroundColor: "rgba(16,185,129,0.22)",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    backgroundColor: "rgba(15,23,42,0.95)",
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(148,163,184,0.45)",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    color: "#f9fafb",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: "#9ca3af",
  },
  sectionHeader: {
    marginTop: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#e5e7eb",
  },
  sectionHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
  listWrapper: {
    backgroundColor: "rgba(15,23,42,0.9)",
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.5)",
    marginBottom: 14,
  },
  emptyText: {
    marginTop: 6,
    color: "#9ca3af",
    fontSize: 12,
  },
  card: {
    backgroundColor: "#0b1120",
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(30,64,175,0.4)",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e5e7eb",
  },
  meta: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  form: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(55,65,81,0.6)",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e5e7eb",
    marginBottom: 4,
  },
  formHint: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: Platform.select({ ios: 10, android: 7 }),
    marginTop: 6,
    backgroundColor: "#020617",
    color: "#f9fafb",
    fontSize: 13,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#10b981",
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
