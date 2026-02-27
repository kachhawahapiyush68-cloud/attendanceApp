// services/officeService.ts
import api from "./api";

export interface Office {
  id: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
  is_active: 0 | 1;
}

export async function fetchOffices(): Promise<Office[]> {
  const res = await api.get<{ success: boolean; offices?: Office[] }>("/office");
  return (res.data.offices || []) as Office[];
}

export async function createOffice(payload: {
  name: string;
  latitude: number | null;
  longitude: number | null;
  radius_meters: number;
}) {
  const res = await api.post("/office", payload);
  return res.data;
}

export async function updateOffice(
  id: number,
  payload: {
    latitude?: number | null;
    longitude?: number | null;
    radius_meters?: number;
    name?: string;
    is_active?: 0 | 1;
  }
) {
  const res = await api.patch(`/office/${id}`, payload);
  return res.data;
}
