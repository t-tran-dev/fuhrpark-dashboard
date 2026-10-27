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

export type VehiclePatch = Partial<Pick<Vehicle, "status" | "mileage" | "nextMaintenance" | "driver">>;
