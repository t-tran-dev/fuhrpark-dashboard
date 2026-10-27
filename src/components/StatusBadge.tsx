import type { VehicleStatus } from "../types";
import { STATUS_LABELS } from "../utils/format";
import styles from "./StatusBadge.module.css";

export function StatusBadge({ status }: { status: VehicleStatus }) {
  return <span className={`${styles.badge} ${styles[status]}`}>{STATUS_LABELS[status]}</span>;
}
