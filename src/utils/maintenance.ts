const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Number of days from today until the given ISO date. Negative if the date is in the past. */
export function daysUntil(isoDate: string, today: Date = new Date()): number {
  const target = new Date(isoDate);
  return Math.floor((target.getTime() - today.getTime()) / MS_PER_DAY);
}

export function isMaintenanceOverdue(isoDate: string, today: Date = new Date()): boolean {
  return daysUntil(isoDate, today) < 0;
}

export function isMaintenanceDueSoon(
  isoDate: string,
  withinDays = 30,
  today: Date = new Date(),
): boolean {
  const days = daysUntil(isoDate, today);
  return days >= 0 && days <= withinDays;
}

export function describeMaintenance(isoDate: string, today: Date = new Date()): string {
  const days = daysUntil(isoDate, today);
  if (days < 0) return `überfällig seit ${-days} ${days === -1 ? "Tag" : "Tagen"}`;
  if (days === 0) return "heute fällig";
  return `in ${days} ${days === 1 ? "Tag" : "Tagen"}`;
}
