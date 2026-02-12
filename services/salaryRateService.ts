// services/salaryRateService.ts
import api from "./api";

export interface SalaryRateItem {
  user_id: string;
  name: string;
  hourlyRate: number;
  overtimeHourlyRate: number;
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
    hourlyRate:
      typeof item.hourlyRate === "number"
        ? item.hourlyRate
        : Number(item.hourlyRate || 0),
    overtimeHourlyRate:
      typeof item.overtimeHourlyRate === "number"
        ? item.overtimeHourlyRate
        : Number(item.overtimeHourlyRate || 0),
  }));
}

export async function updateSalaryRate(
  user_id: string,
  payload: { hourlyRate?: number; overtimeHourlyRate?: number }
): Promise<void> {
  await api.patch(`/salary/rates/${encodeURIComponent(user_id)}`, payload);
}
