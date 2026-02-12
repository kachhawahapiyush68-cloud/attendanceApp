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

export async function fetchReport(
  month: number,
  year: number,
  employeeId?: string
): Promise<ReportItem[]> {
  try {
    const payload = {
      month,
      year,
      employeeId: employeeId || "",
    };

    const res = await api.post<ReportResponse | any[]>("/reports", payload);

    let records: any[] = [];
    if (!res.data) return [];

    if (!Array.isArray(res.data) && res.data.success && Array.isArray(res.data.records)) {
      records = res.data.records;
    } else if (Array.isArray(res.data)) {
      records = res.data;
    }

    return records.map((rec: any): ReportItem => {
      let selfieUrl = rec.selfie || null;
      if (selfieUrl && !selfieUrl.startsWith("http")) {
        selfieUrl = null;
      }

      const rawStatus = rec.status;
      let statusStr = "Present";
      if (rawStatus === "absent" || rawStatus === 0) statusStr = "Absent";
      else if (rawStatus === "late" || rawStatus === 2) statusStr = "Late";
      else if (rawStatus === "half_day" || rawStatus === 3)
        statusStr = "Half day";

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
        hoursWorked:
          typeof rec.hoursWorked === "number"
            ? rec.hoursWorked
            : rec.hoursWorked
            ? Number(rec.hoursWorked)
            : null,
        overtimeHours:
          typeof rec.overtimeHours === "number"
            ? rec.overtimeHours
            : rec.overtimeHours
            ? Number(rec.overtimeHours)
            : null,
      };
    });
  } catch {
    return [];
  }
}
