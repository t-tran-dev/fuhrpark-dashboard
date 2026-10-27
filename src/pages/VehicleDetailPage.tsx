import { Link, useParams } from "react-router-dom";
import { StatusBadge } from "../components/StatusBadge";
import { formatDate, formatDateTime, formatMileage } from "../utils/format";
import { describeMaintenance } from "../utils/maintenance";
import styles from "./VehicleDetailPage.module.css";
import { useFetchVehicle } from "../hooks/useFetchVehicle";

export function VehicleDetailPage() {
  const { id } = useParams();
  const vehicleId = Number(id);
  const { error, loading, vehicle } = useFetchVehicle(vehicleId);

  if (error) return <p className={styles.empty}>{error.message}</p>;

  if (loading) {
    return <p>Lade …</p>;
  }

  if (!vehicle) {
    return <p className={styles.empty}>Ungültige.</p>;
  }

  return (
    <section>
      <Link to="/" className={styles.back}>
        ← Zurück zur Liste
      </Link>

      <header className={styles.header}>
        <div>
          <h1 className={styles.plate}>{vehicle.plate}</h1>
          <p className={styles.subtitle}>
            {vehicle.make} {vehicle.model} · {vehicle.type}
          </p>
        </div>
        <StatusBadge status={vehicle.status} />
      </header>

      <dl className={styles.details}>
        <div>
          <dt>Kilometerstand</dt>
          <dd>{formatMileage(vehicle.mileage)}</dd>
        </div>
        <div>
          <dt>Nächste Wartung</dt>
          <dd>
            {formatDate(vehicle.nextMaintenance)}{" "}
            <span className={styles.hint}>
              ({describeMaintenance(vehicle.nextMaintenance)})
            </span>
          </dd>
        </div>
        <div>
          <dt>Fahrer/in</dt>
          <dd>{vehicle.driver ?? "–"}</dd>
        </div>
        <div>
          <dt>Standort</dt>
          <dd>
            {vehicle.location.city}{" "}
            <span className={styles.hint}>
              ({vehicle.location.lat.toFixed(4)},{" "}
              {vehicle.location.lng.toFixed(4)})
            </span>
          </dd>
        </div>
        <div>
          <dt>Zuletzt geändert</dt>
          <dd>{formatDateTime(vehicle.updatedAt)}</dd>
        </div>
      </dl>

      <nav className={styles.pager}>
        {vehicleId > 1 ? (
          <Link to={`/vehicles/${vehicleId - 1}`}>← Vorheriges Fahrzeug</Link>
        ) : (
          <span />
        )}
        <Link to={`/vehicles/${vehicleId + 1}`}>Nächstes Fahrzeug →</Link>
      </nav>
    </section>
  );
}
