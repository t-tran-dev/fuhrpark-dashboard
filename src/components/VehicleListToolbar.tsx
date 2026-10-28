import {
  type VehicleStatusFilter,
  type VehicleTypeFilter,
  ALL_OPTION,
  VEHICLE_URL_KEYS,
} from "../types";
import { STATUS_LABELS } from "../utils";
import styles from "./VehicleListToolbar.module.css";

const vehicleStatusFilterOptionsMap: Record<VehicleStatusFilter, string> = {
  all: "Alle",
  ...STATUS_LABELS,
};

const vehicleTypeFilterOptionsMap: Record<VehicleTypeFilter, string> = {
  all: "Alle",
  PKW: "PKW",
  Transporter: "Transporter",
  LKW: "LKW",
};

const vehicleStatusFilterSelectOptions = Object.entries(
  vehicleStatusFilterOptionsMap,
).map(([value, label]) => (
  <option key={value} value={value}>
    {label}
  </option>
));

const vehicleTypeFilterSelectOptions = Object.entries(
  vehicleTypeFilterOptionsMap,
).map(([value, label]) => (
  <option key={value} value={value}>
    {label}
  </option>
));

type VehicleListToolbarProps = {
  query: string;
  vehicleStatus: VehicleStatusFilter;
  vehicleType: VehicleTypeFilter;
  loading: boolean;
  updateParams: (
    updates: Record<string, string | null>,
    replace?: boolean,
  ) => void;
};

export const VehicleListToolbar: React.FC<VehicleListToolbarProps> = ({
  query,
  vehicleStatus,
  vehicleType,
  loading,
  updateParams,
}) => {
  return (
    <div className={styles.toolbar}>
      <input
        type="search"
        className={styles.search}
        placeholder="Kennzeichen, Modell, Ort oder Fahrer/in suchen"
        aria-label="Fahrzeuge durchsuchen"
        value={query}
        onChange={(event) =>
          updateParams({ [VEHICLE_URL_KEYS.query]: event.target.value }, true)
        }
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
            type: event.target.value === ALL_OPTION ? null : event.target.value,
          })
        }
      >
        {vehicleTypeFilterSelectOptions}
      </select>
      {loading && <span className={styles.loading}>Lade …</span>}
    </div>
  );
};
