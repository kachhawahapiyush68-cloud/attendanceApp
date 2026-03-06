// app/_layout.tsx
import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useDisplayName } from "../Store/authStore";

function LayoutContent() {
  const displayName = useDisplayName();

  const makeTitle = (suffix: string, fallback: string) =>
    displayName ? `${displayName} - ${suffix}` : fallback;

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#e5f3ff" },
          headerTintColor: "#0f172a",
          headerTitleStyle: { fontWeight: "bold" },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="login"
          options={{
            title: "Login",
            headerShown: !displayName,
          }}
        />

        {/* Admin */}
        <Stack.Screen
          name="admin/dashboard"
          options={{
            title: makeTitle("Admin", "Admin Dashboard"),
          }}
        />
        <Stack.Screen
          name="admin/register"
          options={{
            title: makeTitle("Register", "Register Employee"),
          }}
        />
        <Stack.Screen
          name="admin/employees"
          options={{
            title: makeTitle("Employees", "Employees"),
          }}
        />
        <Stack.Screen
          name="admin/employee-locations"
          options={{
            title: makeTitle("Locations", "Employee Locations"),
          }}
        />
        <Stack.Screen
          name="admin/employee-edit"
          options={{
            title: makeTitle("Edit Employee", "Edit Employee"),
          }}
        />
        <Stack.Screen
          name="admin/offices"
          options={{
            title: makeTitle("Offices", "Offices"),
          }}
        />
        <Stack.Screen
          name="admin/reports"
          options={{
            title: makeTitle("Reports", "Reports"),
          }}
        />
        <Stack.Screen
          name="admin/report-detail"
          options={{
            title: "Report Detail",
          }}
        />
        <Stack.Screen
          name="admin/notifications"
          options={{
            title: makeTitle("Notifications", "Admin Notifications"),
          }}
        />
        {/* removed admin/salary */}
        <Stack.Screen
          name="admin/salary-rates"
          options={{
            title: makeTitle("Salary Rates", "Salary Rates"),
          }}
        />
        <Stack.Screen
          name="admin/employee-salary-detail"
          options={{
            title: makeTitle("Employee Salary", "Employee Salary Detail"),
          }}
        />
        <Stack.Screen
          name="admin/settings"
          options={{
            title: makeTitle("Settings", "Admin Settings"),
          }}
        />

        {/* Employee */}
        <Stack.Screen
          name="employee/dashboard"
          options={{
            title: makeTitle("Dashboard", "Employee Dashboard"),
          }}
        />
        <Stack.Screen
          name="employee/attendance"
          options={{
            title: makeTitle("Attendance", "Attendance"),
          }}
        />
        <Stack.Screen
          name="employee/history"
          options={{
            title: makeTitle("History", "Attendance History"),
          }}
        />
        <Stack.Screen
          name="employee/notifications"
          options={{
            title: makeTitle("Notifications", "Employee Notifications"),
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return <LayoutContent />;
}
