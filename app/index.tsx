// app/index.tsx
import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useAuthStore } from "../Store/authStore";
import "expo-router/entry";

export default function Index() {
  const token = useAuthStore((state) => state.token);
  const role = useAuthStore((state) => state.role);
  const loadAuth = useAuthStore((state) => state.loadAuth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      await loadAuth();
      setLoading(false);
    };
    initAuth();
  }, [loadAuth]);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#e5f3ff",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!token) {
    return <Redirect href="/login" />;
  }

  if (role === "admin") {
    return <Redirect href="/admin/dashboard" />;
  }

  return <Redirect href="/employee/dashboard" />;
}
