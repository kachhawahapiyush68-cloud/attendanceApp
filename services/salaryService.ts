import api from "./api";
import type { SalaryType } from "./salaryRateService";

export interface SalaryItem {
  user_id: string;
  name: string;
  totalHours: number;
  totalOvertime: number;
  hourlyRate: number;
  overtimeHourlyRate: number;
  presentDays: number;
  payableDays: number;
  basePay: number;
  overtimePay: number;
  totalPay: number;
  salaryType: SalaryType;
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
  const params: any = { month, year };
  if (employeeId) params.employeeId = employeeId;

  const res = await api.get<SalaryResponse>("/salary", { params });

  if (!res.data?.success || !Array.isArray(res.data.items)) {
    return [];
  }

  const num = (v: any) =>
    typeof v === "number" ? v : v ? Number(v) : 0;

  return res.data.items.map((item: any): SalaryItem => {
    const salaryType: SalaryType =
      item.salaryType === "fixed" || item.salary_type === "fixed"
        ? "fixed"
        : "hourly";

    return {
      user_id: item.user_id || "",
      name: item.name || "Unknown",
      totalHours: num(item.totalHours),
      totalOvertime: num(item.totalOvertime),
      hourlyRate: num(item.hourlyRate),
      overtimeHourlyRate: num(item.overtimeHourlyRate),
      presentDays: num(item.presentDays),
      payableDays: num(item.payableDays),
      basePay: num(item.basePay),
      overtimePay: num(item.overtimePay),
      totalPay: num(item.totalPay),
      salaryType,
    };
  });
}
