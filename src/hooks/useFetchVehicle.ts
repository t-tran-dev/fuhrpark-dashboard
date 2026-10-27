import { useState, useEffect } from "react";
import { getVehicle } from "../api/vehicles";
import { Vehicle } from "../types";

export const useFetchVehicle = (vehicleId: number) => {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setVehicle(null);
    setError(null);

    const fetchVehicle = async () => {
      try {
        const data = await getVehicle(vehicleId, controller.signal);

        if (!controller.signal.aborted) {
          setVehicle(data);
        }
      } catch (error) {
        if (controller.signal.aborted) return;

        setError(
          error instanceof Error
            ? error
            : new Error("Das Fahrzeug konnte nicht geladen werden."),
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchVehicle();

    return () => controller.abort();
  }, [vehicleId]);

  return { error, loading, vehicle, setVehicle };
};
