import { useState } from "react";
import { updateVehicle } from "../api/vehicles";
import { VehicleTable } from "../components/VehicleTable";
import type { VehicleStatus } from "../types";
import styles from "./VehicleListPage.module.css";
import { useFetchVehicles } from "../hooks/useFetchVehicles";

export function VehicleListPage() {
  const [query, setQuery] = useState("");
  const { vehicles, loading, error, setVehicles } = useFetchVehicles(query);

  async function handleStatusChange(id: number, status: VehicleStatus) {
    const updated = await updateVehicle(id, { status });
    const updatedVehicles = vehicles.map((vehicle) => {
      if (vehicle.id === id) return updated;
      return vehicle;
    });

    setVehicles(updatedVehicles);
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
