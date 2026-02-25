// services/salaryRateService.ts
import api from "./api";

export type SalaryType = "hourly" | "fixed";

export interface SalaryRateItem {
  user_id: string;
  name: string;
  salaryType: SalaryType;
  hourlyRate: number;
  overtimeHourlyRate: number;
  fixedMonthlySalary: number;
}

interface SalaryRateResponse {
  success?: boolean;
  items?: any[];
}

export async function fetchSalaryRates(): Promise<SalaryRateItem[]> {
  const res = await api.get<SalaryRateResponse>("/salary/rates");

  if (!res.data?.success || !Array.isArray(res.data.items)) {
    return [];
  }

  return res.data.items.map((item: any): SalaryRateItem => ({
    user_id: item.user_id || "",
    name: item.name || "Unknown",
    salaryType:
      item.salaryType === "fixed" || item.salary_type === "fixed"
        ? "fixed"
        : "hourly",
    hourlyRate:
      typeof item.hourlyRate === "number"
        ? item.hourlyRate
        : Number(item.hourlyRate || 0),
    overtimeHourlyRate:
      typeof item.overtimeHourlyRate === "number"
        ? item.overtimeHourlyRate
        : Number(item.overtimeHourlyRate || 0),
    fixedMonthlySalary:
      typeof item.fixedMonthlySalary === "number"
        ? item.fixedMonthlySalary
        : typeof item.fixed_monthly_salary === "number"
        ? item.fixed_monthly_salary
        : Number(item.fixed_monthly_salary || 0),
  }));
}

export async function updateSalaryRate(
  user_id: string,
  payload: {
    salary_type: SalaryType;
    hourlyRate?: number;
    overtimeHourlyRate?: number;
    fixed_monthly_salary?: number;
  }
): Promise<void> {
  await api.patch(`/salary/rates/${encodeURIComponent(user_id)}`, payload);
}
