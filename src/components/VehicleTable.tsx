import { Link } from "react-router-dom";
import {
  VEHICLE_STATUSES,
  type VehicleSortConfig,
  type VehicleSortKey,
  type Vehicle,
  type VehicleStatus,
} from "../types";
import { STATUS_LABELS, formatDate, formatMileage } from "../utils/format";
import { StatusBadge } from "./StatusBadge";
import styles from "./VehicleTable.module.css";

interface VehicleTableProps {
  error: Error | null;
  sort: VehicleSortConfig;
  vehicles: Vehicle[];
  onStatusChange: (id: number, status: VehicleStatus) => void;
  onSortChange: (key: VehicleSortKey) => void;
}

export function VehicleTable({
  error,
  sort,
  vehicles,
  onStatusChange,
  onSortChange,
}: VehicleTableProps) {
  if (error) return <p className={styles.empty}>{error.message}</p>;
  if (vehicles.length === 0) {
    return <p className={styles.empty}>Keine Fahrzeuge gefunden.</p>;
  }

  const sortedVehicles = [...vehicles].sort((a, b) => {
    let comparison: number;

    switch (sort.key) {
      case "plate":
        comparison = a.plate.localeCompare(b.plate, "de", {
          numeric: true,
        });
        break;

      case "mileage":
        comparison = a.mileage - b.mileage;
        break;

      case "nextMaintenance":
        comparison = a.nextMaintenance.localeCompare(b.nextMaintenance);
        break;
    }

    return sort.direction === "asc" ? comparison : -comparison;
  });

  const getAriaSort = (
    key: VehicleSortKey,
  ): "ascending" | "descending" | "none" => {
    if (sort.key !== key) return "none";
    return sort.direction === "asc" ? "ascending" : "descending";
  };

  const getSortIndicator = (key: VehicleSortKey) => {
    if (sort.key !== key) return "↕";
    return sort.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th scope="col" aria-sort={getAriaSort("plate")}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortChange("plate")}
              >
                Kennzeichen{" "}
                <span aria-hidden="true">{getSortIndicator("plate")}</span>
              </button>
            </th>

            <th scope="col">Fahrzeug</th>
            <th scope="col">Typ</th>
            <th scope="col">Status</th>

            <th
              scope="col"
              className={styles.number}
              aria-sort={getAriaSort("mileage")}
            >
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortChange("mileage")}
              >
                Kilometerstand{" "}
                <span aria-hidden="true">{getSortIndicator("mileage")}</span>
              </button>
            </th>

            <th scope="col" aria-sort={getAriaSort("nextMaintenance")}>
              <button
                type="button"
                className={styles.sortButton}
                onClick={() => onSortChange("nextMaintenance")}
              >
                Nächste Wartung{" "}
                <span aria-hidden="true">
                  {getSortIndicator("nextMaintenance")}
                </span>
              </button>
            </th>

            <th scope="col">Standort</th>
          </tr>
        </thead>
        <tbody>
          {sortedVehicles.map((vehicle) => (
            <tr key={vehicle.id}>
              <td>
                <Link to={`/vehicles/${vehicle.id}`} className={styles.plate}>
                  {vehicle.plate}
                </Link>
              </td>
              <td>
                {vehicle.make} {vehicle.model}
              </td>
              <td>{vehicle.type}</td>
              <td>
                <div className={styles.statusCell}>
                  <StatusBadge status={vehicle.status} />
                  <select
                    aria-label={`Status von ${vehicle.plate} ändern`}
                    value={vehicle.status}
                    onChange={(event) =>
                      onStatusChange(
                        vehicle.id,
                        event.target.value as VehicleStatus,
                      )
                    }
                  >
                    {VEHICLE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className={styles.number}>
                {formatMileage(vehicle.mileage)}
              </td>
              <td>{formatDate(vehicle.nextMaintenance)}</td>
              <td>{vehicle.location.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
