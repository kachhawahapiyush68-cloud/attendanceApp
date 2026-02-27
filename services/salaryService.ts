// services/salaryService.ts
import api from "./api";
import type { SalaryType } from "./salaryRateService";

export interface SalaryItem {
  user_id: string;
  name: string;

  // hourly
  totalHours: number;
  totalOvertime: number;
  hourlyRate: number;
  overtimeHourlyRate: number;

  // fixed
  presentDays: number;
  totalDaysInMonth: number;

  basePay: number;
  overtimePay: number;
  totalPay: number;
  salaryType?: SalaryType;
}

interface SalaryResponse {
  success?: boolean;
  count?: number;
  items?: any[];
}

export async function fetchSalarySummary(
  month: number,
  year: number,
  employeeId?: string
): Promise<SalaryItem[]> {
  const payload: any = { month, year };
  if (employeeId) payload.employeeId = employeeId;

  const res = await api.post<SalaryResponse>("/salary", payload);

  if (!res.data?.success || !Array.isArray(res.data.items)) {
    return [];
  }

  return res.data.items.map((item: any): SalaryItem => ({
    user_id: item.user_id || "",
    name: item.name || "Unknown",

    totalHours:
      typeof item.totalHours === "number"
        ? item.totalHours
        : item.totalHours
        ? Number(item.totalHours)
        : 0,
    totalOvertime:
      typeof item.totalOvertime === "number"
        ? item.totalOvertime
        : item.totalOvertime
        ? Number(item.totalOvertime)
        : 0,
    hourlyRate:
      typeof item.hourlyRate === "number"
        ? item.hourlyRate
        : Number(item.hourlyRate || 0),
    overtimeHourlyRate:
      typeof item.overtimeHourlyRate === "number"
        ? item.overtimeHourlyRate
        : Number(item.overtimeHourlyRate || 0),

    presentDays:
      typeof item.presentDays === "number"
        ? item.presentDays
        : Number(item.presentDays || 0),
    totalDaysInMonth:
      typeof item.totalDaysInMonth === "number"
        ? item.totalDaysInMonth
        : Number(item.totalDaysInMonth || 0),

    basePay:
      typeof item.basePay === "number"
        ? item.basePay
        : Number(item.basePay || 0),
    overtimePay:
      typeof item.overtimePay === "number"
        ? item.overtimePay
        : Number(item.overtimePay || 0),
    totalPay:
      typeof item.totalPay === "number"
        ? item.totalPay
        : Number(item.totalPay || 0),

    salaryType:
      item.salaryType === "fixed" || item.salary_type === "fixed"
        ? "fixed"
        : "hourly",
  }));
}
