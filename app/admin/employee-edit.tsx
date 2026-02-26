// app/admin/employee-edit.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { updateEmployee, getEmployeeById } from "../../services/employeeService";

export default function EmployeeEditScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const idParam = typeof params.id === "string" ? params.id : "";
  const nameParam = typeof params.name === "string" ? params.name : "";
  const userIdParam =
    typeof params.user_id === "string" ? params.user_id : "";

  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(userIdParam);
  const [name, setName] = useState(nameParam);
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [salaryType, setSalaryType] = useState<"hourly" | "fixed">("hourly");
  const [fixedSalary, setFixedSalary] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [overtimeRate, setOvertimeRate] = useState("");

  useEffect(() => {
    const load = async () => {
      const idNum = Number(idParam);
      if (!idNum) return;
      try {
        setLoading(true);
        const emp = await getEmployeeById(idNum);
        setUserId(emp.user_id || "");
        setName(emp.name || "");
        setEmail(emp.email || "");
        setMobile(emp.mobile_no || "");
        setAddress(emp.address || "");
        setSalaryType(emp.salary_type || "hourly");
        setFixedSalary(emp.fixed_monthly_salary || "");
        setHourlyRate(emp.hourlyRate || "");
        setOvertimeRate(emp.overtimeHourlyRate || "");
      } catch (e: any) {
        Alert.alert("Error", e?.message || "Failed to load employee");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [idParam]);

  const handleSave = async () => {
    const idNum = Number(idParam);
    if (!idNum) {
      Alert.alert("Error", "Invalid employee id");
      return;
    }

    if (!userId.trim()) {
      Alert.alert("Validation", "Employee ID is required");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Validation", "Email is required");
      return;
    }

    try {
      setLoading(true);
      await updateEmployee(idNum, {
        user_id: userId.trim(),
        name: name.trim(),
        email: email.trim(),
        mobile_no: mobile.trim(),
        address: address.trim(),
        salary_type: salaryType,
        fixed_monthly_salary: fixedSalary || null,
        hourlyRate: hourlyRate || "0",
        overtimeHourlyRate: overtimeRate || "0",
      });
      Alert.alert("Success", "Employee updated", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e?.message || "Failed to update employee");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.backgroundLayer}>
          <View style={[styles.circle, styles.circleTop]} />
          <View style={[styles.circle, styles.circleBottomLeft]} />
        </View>

        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit employee</Text>
          <Text style={styles.subtitle}>{userIdParam}</Text>

          <Text style={styles.label}>Employee ID</Text>
          <TextInput
            style={styles.input}
            value={userId}
            onChangeText={setUserId}
            placeholder="Employee code"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#6b7280"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Mobile</Text>
          <TextInput
            style={styles.input}
            value={mobile}
            onChangeText={setMobile}
            placeholder="Mobile number"
            placeholderTextColor="#6b7280"
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Address</Text>
          <TextInput
            style={styles.input}
            value={address}
            onChangeText={setAddress}
            placeholder="Address"
            placeholderTextColor="#6b7280"
          />

          <Text style={styles.label}>Salary type</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.chip,
                salaryType === "hourly" && styles.chipSelected,
              ]}
              onPress={() => setSalaryType("hourly")}
            >
              <Text
                style={[
                  styles.chipText,
                  salaryType === "hourly" && styles.chipTextSelected,
                ]}
              >
                Hourly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.chip,
                salaryType === "fixed" && styles.chipSelected,
              ]}
              onPress={() => setSalaryType("fixed")}
            >
              <Text
                style={[
                  styles.chipText,
                  salaryType === "fixed" && styles.chipTextSelected,
                ]}
              >
                Fixed monthly
              </Text>
            </TouchableOpacity>
          </View>

          {salaryType === "fixed" && (
            <>
              <Text style={styles.label}>Fixed monthly salary</Text>
              <TextInput
                style={styles.input}
                value={fixedSalary}
                onChangeText={setFixedSalary}
                placeholder="e.g. 25000.00"
                placeholderTextColor="#6b7280"
                keyboardType="numeric"
              />
            </>
          )}

          <Text style={styles.label}>Hourly rate</Text>
          <TextInput
            style={styles.input}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            placeholder="e.g. 100.00"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
          />

          <Text style={styles.label}>Overtime hourly rate</Text>
          <TextInput
            style={styles.input}
            value={overtimeRate}
            onChangeText={setOvertimeRate}
            placeholder="e.g. 150.00"
            placeholderTextColor="#6b7280"
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? "Saving..." : "Save changes"}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#e5f3ff" },
  root: { flex: 1, backgroundColor: "#e5f3ff" },
  backgroundLayer: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  circle: { position: "absolute", width: 220, height: 220, borderRadius: 110 },
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
    paddingTop: 20,
    paddingBottom: 24,
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
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 9,
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    marginTop: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    marginRight: 8,
    backgroundColor: "#ffffff",
  },
  chipSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "600",
  },
  chipTextSelected: {
    color: "#f9fafb",
  },
  button: {
    marginTop: 16,
    backgroundColor: "#2563eb",
    borderRadius: 999,
    paddingVertical: 11,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 14,
  },
});
