// services/settingsService.ts
import api from "./api";

export interface GeoRadiusSettings {
  geo_radius_m: number;
}

// Get current radius
export async function fetchGeoRadius(): Promise<number> {
  console.log("[settingsService] fetchGeoRadius");
  const res = await api.get<{ success: boolean; geo_radius_m: number }>(
    "/api/settings/geo-radius"   // <-- FIXED
  );
  if (!res.data?.success) return 150;
  return res.data.geo_radius_m ?? 150;
}

// Update radius (admin only)
export async function updateGeoRadius(radius: number): Promise<void> {
  console.log("[settingsService] updateGeoRadius:", radius);
  await api.patch("/api/settings/geo-radius", { geo_radius_m: radius }); // <-- FIXED
}
