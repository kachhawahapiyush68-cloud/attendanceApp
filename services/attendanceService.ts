// services/attendanceService.ts
import { useAuthStore } from "../Store/authStore";

type StatusType = "present" | "absent" | "late" | "half_day";
type WorkType = "office" | "home";
export type ModeType = "in" | "out";

export interface LocationData {
  latitude: number;
  longitude: number;
}

interface AttendanceRecord {
  location?: string;
  selfie?: string;
  status?: string;
  date?: string;
}

interface AttendanceResponse {
  record?: AttendanceRecord;
  message?: string;
  approvalStatus?: "APPROVED_AUTO" | "PENDING_APPROVAL";
  mode?: ModeType;
}

const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.80:3001";

export async function markAttendanceRequest(
  officeId: number,
  status: StatusType,
  selfieUri: string | null,
  location: LocationData | null,
  workType: WorkType,
  mode: ModeType,
  task?: string,
  locationName?: string,
  deviceId?: string,
  networkType?: string
): Promise<AttendanceResponse> {
  const formData = new FormData();

  if (selfieUri) {
    formData.append(
      "selfie",
      {
        uri: selfieUri,
        type: "image/jpeg",
        name: "attendance.jpg",
      } as any
    );
  }

  formData.append("officeId", String(officeId));
  formData.append("status", status);
  formData.append("workType", workType);
  formData.append("mode", mode);
  formData.append("locationName", locationName || "");

  if (mode === "out" && task) {
    formData.append("task", task);
  }

  if (location) {
    formData.append("latitude", String(location.latitude));
    formData.append("longitude", String(location.longitude));
  }

  if (deviceId) formData.append("deviceId", deviceId);
  if (networkType) formData.append("networkType", networkType);

  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}/attendance/mark`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    let errMsg = "Attendance failed";
    try {
      const err = await res.json();
      errMsg = err?.message || errMsg;
    } catch {
      const errText = await res.text();
      errMsg = errText || errMsg;
    }
    throw new Error(errMsg);
  }

  const data: AttendanceResponse = await res.json();

  if (data.record?.selfie) {
    const selfiePath = data.record.selfie;
    if (!/^https?:\/\//i.test(selfiePath)) {
      data.record.selfie = `${BASE_URL}${
        selfiePath.startsWith("/") ? "" : "/"
      }${selfiePath}`;
    }
  }

  if (data.record) {
    data.record.location = data.record.location ?? "Not available";
  }

  return data;
}

export async function fetchTodayStatus(): Promise<"none" | "in" | "out"> {
  const token = useAuthStore.getState().token;

  const res = await fetch(`${BASE_URL}/attendance/status/today`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return "none";
  }

  const data = await res.json();
  return (data.state as "none" | "in" | "out") || "none";
}
