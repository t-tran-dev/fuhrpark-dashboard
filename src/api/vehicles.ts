import {
  QUERY_KEY,
  type QueryProperty,
  type VehicleFilters,
  type Vehicle,
  type VehiclePatch,
} from "../types";

const BASE_URL = "/api";

type GetVehicleProps = {
  signal: AbortSignal;
} & VehicleFilters;

export async function getVehicles({
  signal,
  ...queryProps
}: GetVehicleProps): Promise<Vehicle[]> {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(queryProps)) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "all"
    ) {
      searchParams.set(QUERY_KEY[key as QueryProperty], String(value));
    }
  }

  const queryString = searchParams.toString();
  const params = queryString ? `?${queryString}` : "";

  const res = await fetch(`${BASE_URL}/vehicles${params}`, {
    signal,
  });

  if (!res.ok) {
    console.error(`Failed to fetch vehicles: ${res.status}`);
    throw new Error(`Es konnten keine Fahrzeuge geladen werden: ${res.status}`);
  }

  return res.json();
}

export async function getVehicle(
  id: number,
  signal?: AbortSignal,
): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    signal,
  });

  if (!res.ok) {
    console.error(`Failed to fetch vehicle ${id}: ${res.status}`);
    throw new Error("Das Fahrzeug konnte nicht geladen werden.");
  }

  return res.json();
}

export async function updateVehicle(
  id: number,
  patch: VehiclePatch,
): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    console.error(`Failed to update vehicle ${id}: ${res.status}`);
    throw new Error(`Das Fahrzeug konnte nicht aktualisiert werden`);
  }

  return res.json();
}
