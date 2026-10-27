import { Link } from "react-router-dom";
import { VEHICLE_STATUSES, type Vehicle, type VehicleStatus } from "../types";
import { STATUS_LABELS, formatDate, formatMileage } from "../utils/format";
import { StatusBadge } from "./StatusBadge";
import styles from "./VehicleTable.module.css";

interface VehicleTableProps {
  vehicles: Vehicle[];
  onStatusChange: (id: number, status: VehicleStatus) => void;
}

export function VehicleTable({ vehicles, onStatusChange }: VehicleTableProps) {
  if (vehicles.length === 0) {
    return <p className={styles.empty}>Keine Fahrzeuge gefunden.</p>;
  }

  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Kennzeichen</th>
            <th>Fahrzeug</th>
            <th>Typ</th>
            <th>Status</th>
            <th className={styles.number}>Kilometerstand</th>
            <th>Nächste Wartung</th>
            <th>Standort</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => (
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
                      onStatusChange(vehicle.id, event.target.value as VehicleStatus)
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
              <td className={styles.number}>{formatMileage(vehicle.mileage)}</td>
              <td>{formatDate(vehicle.nextMaintenance)}</td>
              <td>{vehicle.location.city}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
