import type { Vehicle, VehiclePatch } from "../types";

const BASE_URL = "/api";

export async function getVehicles(
  signal: AbortSignal,
  query = "",
): Promise<Vehicle[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";

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
  return res.json();
}
