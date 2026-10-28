import { useState, useEffect } from "react";
import { getVehicles } from "../api/vehicles";
import { Vehicle } from "../types";
import {
  VehicleStatusFilter,
  VehicleTypeFilter,
} from "../pages/VehicleListPage";

const DEBOUNCE_DELAY = 300;

export type UseFetchVehiclesProps = {
  query: string;
  vehicleStatus: VehicleStatusFilter;
  vehicleType: VehicleTypeFilter;
};

export const useFetchVehicles = ({
  query,
  vehicleStatus,
  vehicleType,
}: UseFetchVehiclesProps) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);

    const fetchVehicles = async () => {
      try {
        const vehicles = await getVehicles({
          signal: controller.signal,
          query,
          vehicleStatus,
          vehicleType,
        });

        if (!controller.signal.aborted) {
          setVehicles(vehicles);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error instanceof Error) {
          setError(error);
        } else {
          setError(new Error("Es konnten keine Fahrzeuge geladen werden."));
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    const debounceTimer = setTimeout(fetchVehicles, DEBOUNCE_DELAY);

    return () => {
      clearTimeout(debounceTimer);
      controller.abort();
    };
  }, [query, vehicleStatus, vehicleType]);

  return { vehicles, loading, error, setVehicles };
};
