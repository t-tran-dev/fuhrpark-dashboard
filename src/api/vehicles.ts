import type { Vehicle, VehiclePatch } from "../types";

const BASE_URL = "/api";

export async function getVehicles(query = ""): Promise<Vehicle[]> {
  const params = query ? `?q=${encodeURIComponent(query)}` : "";
  const res = await fetch(`${BASE_URL}/vehicles${params}`);
  return res.json();
}

export async function getVehicle(id: number): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`);
  return res.json();
}

export async function updateVehicle(id: number, patch: VehiclePatch): Promise<Vehicle> {
  const res = await fetch(`${BASE_URL}/vehicles/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return res.json();
}
