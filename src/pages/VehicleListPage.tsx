import { updateVehicle } from "../api/vehicles";
import { VehicleTable } from "../components/VehicleTable";
import { useFetchVehicles, useUrlParams } from "../hooks";
import {
  ALL_OPTION,
  VEHICLE_URL_KEYS,
  VehicleSortConfig,
  VehicleSortKey,
  type VehicleStatus,
  VehicleStatusFilter,
  VehicleTypeFilter,
} from "../types";
import { isMaintenanceOverdue } from "../utils/maintenance";
import styles from "./VehicleListPage.module.css";
import {
  isVehicleStatus,
  isVehicleType,
  isVehicleSortKey,
} from "../utils/vehiclesValidation";

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
  const { searchParams, updateParams } = useUrlParams();
  const query = searchParams.get("q") ?? "";

  const rawStatus = searchParams.get(VEHICLE_URL_KEYS.status);
  const rawType = searchParams.get(VEHICLE_URL_KEYS.type);
  const rawSort = searchParams.get(VEHICLE_URL_KEYS.sort);
  const rawDirection = searchParams.get(VEHICLE_URL_KEYS.direction);

  const vehicleStatus = isVehicleStatus(rawStatus) ? rawStatus : "all";
  const vehicleType = isVehicleType(rawType) ? rawType : "all";

  const sort: VehicleSortConfig = {
    key: isVehicleSortKey(rawSort) ? rawSort : "plate",
    direction: rawDirection === "desc" ? "desc" : "asc",
  };

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

  const handleSort = (key: VehicleSortKey) => {
    const direction =
      sort.key === key && sort.direction === "asc" ? "desc" : "asc";

    updateParams({
      sort: key,
      direction,
    });
  };

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
          onChange={(event) => updateParams({ q: event.target.value }, true)}
        />

        <select
          aria-label="Nach Status filtern"
          value={vehicleStatus}
          onChange={(event) =>
            updateParams({
              status:
                event.target.value === ALL_OPTION ? null : event.target.value,
            })
          }
        >
          {vehicleStatusFilterSelectOptions}
        </select>

        <select
          aria-label="Nach Fahrzeugtyp filtern"
          value={vehicleType}
          onChange={(event) =>
            updateParams({
              type:
                event.target.value === ALL_OPTION ? null : event.target.value,
            })
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
        sort={sort}
        onSortChange={handleSort}
      />
    </section>
  );
}
