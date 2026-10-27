import type { VehicleStatus } from "../types";

export const STATUS_LABELS: Record<VehicleStatus, string> = {
  available: "Verfügbar",
  in_use: "Im Einsatz",
  workshop: "Werkstatt",
};

export function formatMileage(km: number): string {
  return `${km.toLocaleString("de-DE")} km`;
}

/** "2026-11-03" -> "03.11.2026" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}.${month}.${year}`;
}

export function formatDateTime(isoTimestamp: string): string {
  return new Date(isoTimestamp).toLocaleString("de-DE", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
