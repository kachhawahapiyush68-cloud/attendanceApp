// app/helpers/date.ts

/**
 * Parse a MySQL DATETIME/TIMESTAMP string (from backend) as UTC
 * and return a JS Date object.
 *
 * Expected raw: "YYYY-MM-DD HH:MM:SS"
 */
export function parseMySqlDateToUTC(raw: string): Date | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Convert "YYYY-MM-DD HH:MM:SS" → "YYYY-MM-DDTHH:MM:SSZ"
  const normalized = trimmed.replace(" ", "T") + "Z";
  const d = new Date(normalized);
  if (isNaN(d.getTime())) return null;
  return d;
}

/**
 * Format MySQL datetime string into IST human readable string.
 * Use this everywhere (notifications + attendance) for consistent timing.
 */
export function formatISTDateTimeFromMySql(raw: string): string {
  const d = parseMySqlDateToUTC(raw);
  if (!d) return "";
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: true,
  });
}

/**
 * Only date part in IST, if needed.
 */
export function formatISTDateFromMySql(raw: string): string {
  const d = parseMySqlDateToUTC(raw);
  if (!d) return "";
  return d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
  });
}
