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

  const num = (v: any) =>
    typeof v === "number" ? v : v ? Number(v) : 0;

  return res.data.items.map((item: any): SalaryRateItem => ({
    user_id: item.user_id || "",
    name: item.name || "Unknown",
    salaryType:
      item.salaryType === "fixed" || item.salary_type === "fixed"
        ? "fixed"
        : "hourly",
    hourlyRate: num(item.hourlyRate),
    overtimeHourlyRate: num(item.overtimeHourlyRate),
    fixedMonthlySalary: num(
      item.fixedMonthlySalary ?? item.fixed_monthly_salary
    ),
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
