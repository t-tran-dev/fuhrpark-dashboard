import { useEffect, useState } from "react";
import { getVehicles, updateVehicle } from "../api/vehicles";
import { VehicleTable } from "../components/VehicleTable";
import type { Vehicle, VehicleStatus } from "../types";
import styles from "./VehicleListPage.module.css";

export function VehicleListPage() {
  const [query, setQuery] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getVehicles(query).then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, [query]);

  async function handleStatusChange(id: number, status: VehicleStatus) {
    const updated = await updateVehicle(id, { status });
    const vehicle = vehicles.find((v) => v.id === id);
    if (vehicle) {
      vehicle.status = updated.status;
      setVehicles(vehicles);
    }
  }

  const today = new Date().toLocaleDateString("de-DE");
  const workshopCount = vehicles.filter((v) => v.status === "workshop").length;
  const overdueCount = vehicles.filter((v) => v.nextMaintenance < today).length;

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
        {loading && <span className={styles.loading}>Lade …</span>}
      </div>

      <p className={styles.summary}>
        {vehicles.length} Fahrzeuge · {workshopCount} in der Werkstatt · {overdueCount} mit
        überfälliger Wartung
      </p>

      <VehicleTable vehicles={vehicles} onStatusChange={handleStatusChange} />
    </section>
  );
}
