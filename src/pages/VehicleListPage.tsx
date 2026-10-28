import { useState } from "react";
import { updateVehicle } from "../api/vehicles";
import { VehicleTable } from "../components/VehicleTable";
import { useFetchVehicles } from "../hooks";
import { VehicleType, type VehicleStatus } from "../types";
import { isMaintenanceOverdue } from "../utils/maintenance";
import styles from "./VehicleListPage.module.css";

const ALL_OPTION = "all";

export type VehicleStatusFilter = typeof ALL_OPTION | VehicleStatus;
export type VehicleTypeFilter = typeof ALL_OPTION | VehicleType;

const VehicleStatusFilterOptionsMap: Record<VehicleStatusFilter, string> = {
  all: "Alle",
  available: "Verfügbar",
  in_use: "Im Einsatz",
  workshop: "Werkstatt",
};

const VehicleTypeFilterOptionsMap: Record<VehicleTypeFilter, string> = {
  all: "Alle",
  PKW: "PKW",
  Transporter: "Transporter",
  LKW: "LKW",
};

export function VehicleListPage() {
  const [query, setQuery] = useState("");
  const [vehicleStatus, setVehicleStatus] =
    useState<VehicleStatusFilter>(ALL_OPTION);
  const [vehicleType, setVehicleType] = useState<VehicleTypeFilter>(ALL_OPTION);
  const { vehicles, loading, error, setVehicles } = useFetchVehicles({
    query,
    vehicleStatus,
    vehicleType,
  });

  async function handleStatusChange(id: number, status: VehicleStatus) {
    const updated = await updateVehicle(id, { status });

    setVehicles((prev) =>
      prev.map((vehicle) => (vehicle.id === id ? updated : vehicle)),
    );
  }

  const workshopCount = vehicles.filter((v) => v.status === "workshop").length;
  const overdueCount = vehicles.filter((v) =>
    isMaintenanceOverdue(v.nextMaintenance),
  ).length;

  const vehicleStatusFilterSelectOptions = Object.entries(
    VehicleStatusFilterOptionsMap,
  ).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));

  const vehicleTypeFilterSelectOptions = Object.entries(
    VehicleTypeFilterOptionsMap,
  ).map(([value, label]) => (
    <option key={value} value={value}>
      {label}
    </option>
  ));

  return (
    <section>
      <h1>Fahrzeuge</h1>

      <div className={styles.toolbar}>
        <input
          type="search"
          className={styles.search}
          placeholder="Kennzeichen, Modell, Ort oder Fahrer/in suchen"
          aria-label="Fahrzeuge durchsuchen"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <select
          value={vehicleStatus}
          onChange={(event) =>
            setVehicleStatus(event.target.value as VehicleStatusFilter)
          }
        >
          {vehicleStatusFilterSelectOptions}
        </select>
        <select
          value={vehicleType}
          onChange={(event) =>
            setVehicleType(event.target.value as VehicleTypeFilter)
          }
        >
          {vehicleTypeFilterSelectOptions}
        </select>
        {loading && <span className={styles.loading}>Lade …</span>}
      </div>

      <p className={styles.summary}>
        {vehicles.length} Fahrzeuge · {workshopCount} in der Werkstatt ·{" "}
        {overdueCount} mit überfälliger Wartung
      </p>

      <VehicleTable
        error={error}
        vehicles={vehicles}
        onStatusChange={handleStatusChange}
      />
    </section>
  );
}
