export const VEHICLE_STATUSES = ["available", "in_use", "workshop"] as const;
export type VehicleStatus = (typeof VEHICLE_STATUSES)[number];

export const VEHICLE_TYPES = ["PKW", "Transporter", "LKW"] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export interface Vehicle {
  id: number;
  plate: string;
  make: string;
  model: string;
  type: VehicleType;
  status: VehicleStatus;
  mileage: number;
  /** ISO date, e.g. "2026-11-03" */
  nextMaintenance: string;
  location: {
    city: string;
    lat: number;
    lng: number;
  };
  driver: string | null;
  /** ISO timestamp */
  updatedAt: string;
}

export type VehiclePatch = Partial<
  Pick<Vehicle, "status" | "mileage" | "nextMaintenance" | "driver">
>;

export enum QUERY_KEY {
  query = "q",
  vehicleStatus = "vs",
  vehicleType = "vt",
}

export type QueryProperty = keyof typeof QUERY_KEY;

export type VehicleStatusFilter = "all" | VehicleStatus;
export type VehicleTypeFilter = "all" | VehicleType;

export type VehicleFilters = {
  query: string;
  vehicleStatus: VehicleStatusFilter;
  vehicleType: VehicleTypeFilter;
};

export type VehicleSortKey = keyof Pick<
  Vehicle,
  "plate" | "mileage" | "nextMaintenance"
>;

export type SortDirection = "asc" | "desc";

export type VehicleSortConfig = {
  key: VehicleSortKey;
  direction: SortDirection;
};
