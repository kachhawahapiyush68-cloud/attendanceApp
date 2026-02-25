// services/reportService.ts
import api from "./api";

export interface ReportItem {
  user_id: string;
  name: string;
  in?: string | null;
  out?: string | null;
  date: string;
  status: string;
  selfie?: string | null;
  location?: string | null;
  workType?: string;
  hoursWorked?: number | null;
  overtimeHours?: number | null;
}

interface ReportResponse {
  success?: boolean;
  count?: number;
  records?: any[];
}

/**
 * Fetch attendance report.
 *
 * month, year: required
 * employeeId: optional (used by admin; ignored for employee – backend uses token)
 * fromDate, toDate: optional "YYYY-MM-DD" strings for date range filter
 */
export async function fetchReport(
  month: number,
  year: number,
  employeeId?: string,
  fromDate?: string,
  toDate?: string
): Promise<ReportItem[]> {
  try {
    const payload: {
      month: number;
      year: number;
      employeeId: string;
      fromDate?: string;
      toDate?: string;
    } = {
      month,
      year,
      employeeId: employeeId || "",
    };

    if (fromDate) payload.fromDate = fromDate;
    if (toDate) payload.toDate = toDate;

    const res = await api.post<ReportResponse | any[]>("/reports", payload);

    if (!res.data) return [];

    let records: any[] = [];

    if (
      !Array.isArray(res.data) &&
      (res.data as ReportResponse).success &&
      Array.isArray((res.data as ReportResponse).records)
    ) {
      records = (res.data as ReportResponse).records || [];
    } else if (Array.isArray(res.data)) {
      records = res.data;
    }

    return records.map((rec: any): ReportItem => {
      let selfieUrl = rec.selfie || null;
      if (selfieUrl && typeof selfieUrl === "string" && !selfieUrl.startsWith("http")) {
        // backend only returns full URLs for public images;
        // anything else we treat as null here
        selfieUrl = null;
      }

      const rawStatus = rec.status;
      let statusStr = "Present";
      if (rawStatus === "absent" || rawStatus === 0) statusStr = "Absent";
      else if (rawStatus === "late" || rawStatus === 2) statusStr = "Late";
      else if (rawStatus === "half_day" || rawStatus === 3) statusStr = "Half day";

      const hoursWorked =
        typeof rec.hoursWorked === "number"
          ? rec.hoursWorked
          : rec.hoursWorked != null
          ? Number(rec.hoursWorked)
          : null;

      const overtimeHours =
        typeof rec.overtimeHours === "number"
          ? rec.overtimeHours
          : rec.overtimeHours != null
          ? Number(rec.overtimeHours)
          : null;

      return {
        user_id: rec.user_id || rec.userId || "",
        name: rec.name || "Unknown",
        date: rec.date || "",
        status: statusStr,
        selfie: selfieUrl,
        location: rec.location || "Not tracked",
        in: rec.in || null,
        out: rec.out || null,
        workType: rec.workType,
        hoursWorked,
        overtimeHours,
      };
    });
  } catch {
    return [];
  }
}
