import {
  VEHICLE_STATUSES,
  VEHICLE_TYPES,
  VEHICLE_SORT_KEYS,
  type VehicleStatus,
  type VehicleType,
  type VehicleSortKey,
} from "../types";

export function isVehicleStatus(
  value: string | null,
): value is VehicleStatus {
  return VEHICLE_STATUSES.some((status) => status === value);
}

export function isVehicleType(
  value: string | null,
): value is VehicleType {
  return VEHICLE_TYPES.some((type) => type === value);
}

export function isVehicleSortKey(
  value: string | null,
): value is VehicleSortKey {
  return VEHICLE_SORT_KEYS.some((key) => key === value);
}