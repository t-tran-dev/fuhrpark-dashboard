// Small local REST API for the fleet dashboard. No dependencies, data lives in memory
// and is reset on every restart.
//
//   npm run api        normal mode
//   npm run api:flaky  slower responses and about 20 % server errors

import http from "node:http";
import { createVehicles } from "./data.mjs";

const PORT = Number(process.env.PORT ?? 3001);
const FLAKY = process.argv.includes("--flaky");
const FAILURE_RATE = FLAKY ? 0.2 : 0;
const MIN_DELAY_MS = FLAKY ? 300 : 150;
const MAX_DELAY_MS = FLAKY ? 2500 : 1200;

const STATUSES = ["available", "in_use", "workshop"];
const EDITABLE_FIELDS = ["status", "mileage", "nextMaintenance", "driver"];

const vehicles = createVehicles(300);

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .replace(/[\s-]/g, "");
}

function matchesQuery(vehicle, query) {
  const needle = normalize(query);
  if (!needle) return true;
  const haystack = [
    vehicle.plate,
    `${vehicle.make} ${vehicle.model}`,
    vehicle.type,
    vehicle.location.city,
    vehicle.driver,
  ];
  return haystack.some((value) => normalize(value).includes(needle));
}

function isValidIsoDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

function validatePatch(current, patch) {
  const fields = {};

  if (patch === null || typeof patch !== "object" || Array.isArray(patch)) {
    return { _body: "Der Request-Body muss ein JSON-Objekt sein." };
  }

  for (const key of Object.keys(patch)) {
    if (!EDITABLE_FIELDS.includes(key)) fields[key] = "Dieses Feld kann nicht geändert werden.";
  }

  if ("status" in patch && !STATUSES.includes(patch.status)) {
    fields.status = `Erlaubt sind: ${STATUSES.join(", ")}.`;
  }

  if ("mileage" in patch) {
    if (!Number.isInteger(patch.mileage) || patch.mileage < 0) {
      fields.mileage = "Muss eine ganze Zahl ≥ 0 sein.";
    } else if (patch.mileage < current.mileage) {
      fields.mileage = `Darf nicht kleiner als der bisherige Wert (${current.mileage}) sein.`;
    }
  }

  if ("nextMaintenance" in patch && !isValidIsoDate(patch.nextMaintenance)) {
    fields.nextMaintenance = "Muss ein gültiges Datum im Format JJJJ-MM-TT sein.";
  }

  if ("driver" in patch && patch.driver !== null) {
    if (typeof patch.driver !== "string") {
      fields.driver = "Muss ein Text oder null sein.";
    } else if (patch.driver.trim().length > 60) {
      fields.driver = "Darf höchstens 60 Zeichen lang sein.";
    }
  }

  return fields;
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(body === undefined ? "" : JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 100_000) reject(new Error("Body too large"));
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "OPTIONS") return send(res, 204);

  if (!url.pathname.startsWith("/api/")) {
    return send(res, 404, { error: "Nicht gefunden" });
  }

  await sleep(MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS));

  if (Math.random() < FAILURE_RATE) {
    return send(res, 500, { error: "Interner Serverfehler" });
  }

  if (url.pathname === "/api/vehicles" && req.method === "GET") {
  const query = url.searchParams.get("q") ?? "";
  const status = url.searchParams.get("vs");
  const type = url.searchParams.get("vt");

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = matchesQuery(vehicle, query);
    const matchesStatus =
      !status || status === "all" || vehicle.status === status;
    const matchesType =
      !type || type === "all" || vehicle.type === type;

    return matchesSearch && matchesStatus && matchesType;
  });

  return send(res, 200, filteredVehicles);
}

  const match = url.pathname.match(/^\/api\/vehicles\/([^/]+)$/);
  if (match) {
    const id = Number(match[1]);
    const vehicle = Number.isInteger(id) ? vehicles.find((v) => v.id === id) : undefined;
    if (!vehicle) return send(res, 404, { error: "Fahrzeug nicht gefunden" });

    if (req.method === "GET") return send(res, 200, vehicle);

    if (req.method === "PATCH") {
      let patch;
      try {
        patch = await readJsonBody(req);
      } catch (error) {
        return send(res, 400, { error: error.message });
      }
      const fields = validatePatch(vehicle, patch);
      if (Object.keys(fields).length > 0) {
        return send(res, 400, { error: "Validierung fehlgeschlagen", fields });
      }
      if (typeof patch.driver === "string") patch.driver = patch.driver.trim() || null;
      Object.assign(vehicle, patch, { updatedAt: new Date().toISOString() });
      return send(res, 200, vehicle);
    }

    return send(res, 405, { error: "Methode nicht erlaubt" });
  }

  return send(res, 404, { error: "Nicht gefunden" });
}

const server = http.createServer((req, res) => {
  const started = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.url} -> ${res.statusCode} (${Date.now() - started} ms)`);
  });
  handle(req, res).catch((error) => {
    console.error(error);
    if (!res.headersSent) send(res, 500, { error: "Interner Serverfehler" });
  });
});

server.listen(PORT, () => {
  console.log(
    `Fuhrpark-API läuft auf http://localhost:${PORT}/api/vehicles` +
      (FLAKY ? " (flaky: langsam, ca. 20 % Fehler)" : ""),
  );
});
