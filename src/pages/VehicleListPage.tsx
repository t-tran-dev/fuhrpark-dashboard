import { useState } from "react";
import { updateVehicle } from "../api/vehicles";
import { VehicleListToolbar, VehicleTable } from "../components";
import { useFetchVehicles, useUrlParams } from "../hooks";
import {
  ALL_OPTION,
  VEHICLE_URL_KEYS,
  type VehicleSortConfig,
  type VehicleSortKey,
  type VehicleStatus,
} from "../types";
import {
  isMaintenanceOverdue,
  isVehicleStatus,
  isVehicleType,
  isVehicleSortKey,
} from "../utils";
import styles from "./VehicleListPage.module.css";

export function VehicleListPage() {
  const { searchParams, updateParams } = useUrlParams();
  const query = searchParams.get(VEHICLE_URL_KEYS.query) ?? "";

  const rawStatus = searchParams.get(VEHICLE_URL_KEYS.status);
  const rawType = searchParams.get(VEHICLE_URL_KEYS.type);
  const rawSort = searchParams.get(VEHICLE_URL_KEYS.sort);
  const rawDirection = searchParams.get(VEHICLE_URL_KEYS.direction);

  const vehicleStatus = isVehicleStatus(rawStatus) ? rawStatus : ALL_OPTION;
  const vehicleType = isVehicleType(rawType) ? rawType : ALL_OPTION;

  const sort: VehicleSortConfig = {
    key: isVehicleSortKey(rawSort) ? rawSort : "plate",
    direction: rawDirection === "desc" ? "desc" : "asc",
  };

  const [updateError, setUpdateError] = useState<string | null>(null);

  const [updatingIds, setUpdatingIds] = useState<Set<number>>(() => new Set());

  const { vehicles, loading, error, refetch } = useFetchVehicles({
    query,
    vehicleStatus,
    vehicleType,
  });

  async function handleStatusChange(id: number, status: VehicleStatus) {
    if (updatingIds.has(id)) return;

    setUpdateError(null);
    setUpdatingIds((current) => new Set(current).add(id));

    const vehicle = vehicles.find((vehicle) => vehicle.id === id);
    const vehicleLabel = vehicle?.plate ?? `Fahrzeug ${id}`;

    try {
      await updateVehicle(id, { status });
      refetch();
    } catch (error) {
      console.error("Failed to update vehicle status", {
        vehicleId: id,
        status,
        error,
      });

      setUpdateError(
        `Der Status von ${vehicleLabel} konnte nicht geändert werden. Bitte erneut versuchen.`,
      );
    } finally {
      setUpdatingIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  }

  const handleSort = (key: VehicleSortKey) => {
    const direction =
      sort.key === key && sort.direction === "asc" ? "desc" : "asc";

    updateParams({
      [VEHICLE_URL_KEYS.sort]: key,
      [VEHICLE_URL_KEYS.direction]: direction,
    });
  };

  const workshopCount = vehicles.filter((v) => v.status === "workshop").length;
  const overdueCount = vehicles.filter((v) =>
    isMaintenanceOverdue(v.nextMaintenance),
  ).length;

  return (
    <section>
      <h1>Fahrzeuge</h1>

      <VehicleListToolbar
        query={query}
        vehicleStatus={vehicleStatus}
        vehicleType={vehicleType}
        loading={loading}
        updateParams={updateParams}
      />

      <p className={styles.summary}>
        {vehicles.length} Fahrzeuge · {workshopCount} in der Werkstatt ·{" "}
        {overdueCount} mit überfälliger Wartung
      </p>

      {updateError && (
        <p role="alert" className={styles.error}>
          {updateError}
        </p>
      )}
      <VehicleTable
        error={error}
        vehicles={vehicles}
        onStatusChange={handleStatusChange}
        sort={sort}
        onSortChange={handleSort}
        updatingIds={updatingIds}
        loading={loading}
      />
    </section>
  );
}
