// Generates the vehicle test data. The random generator is seeded, so the data is the
// same on every start. Maintenance dates are relative to today, so some are always overdue.

function createRandom(seed) {
  let state = seed;
  return function random() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CITIES = [
  { city: "Leer", code: "LER", lat: 53.2316, lng: 7.461 },
  { city: "Emden", code: "EMD", lat: 53.3594, lng: 7.2061 },
  { city: "Oldenburg", code: "OL", lat: 53.1435, lng: 8.2146 },
  { city: "Bremen", code: "HB", lat: 53.0793, lng: 8.8017 },
  { city: "Hamburg", code: "HH", lat: 53.5511, lng: 9.9937 },
  { city: "Hannover", code: "H", lat: 52.3759, lng: 9.732 },
  { city: "Münster", code: "MS", lat: 51.9607, lng: 7.6261 },
  { city: "Köln", code: "K", lat: 50.9375, lng: 6.9603 },
  { city: "Berlin", code: "B", lat: 52.52, lng: 13.405 },
  { city: "Leipzig", code: "L", lat: 51.3397, lng: 12.3731 },
];

const MODELS = {
  PKW: [
    ["VW", "Golf"],
    ["VW", "Passat Variant"],
    ["Skoda", "Octavia Combi"],
    ["BMW", "320d Touring"],
    ["Tesla", "Model 3"],
    ["Opel", "Astra"],
  ],
  Transporter: [
    ["VW", "Crafter"],
    ["Mercedes-Benz", "Sprinter"],
    ["Ford", "Transit"],
    ["Renault", "Master"],
  ],
  LKW: [
    ["MAN", "TGL 12.220"],
    ["Mercedes-Benz", "Atego 1224"],
    ["DAF", "LF 230"],
  ],
};

const MILEAGE_RANGE = {
  PKW: [5_000, 180_000],
  Transporter: [10_000, 250_000],
  LKW: [20_000, 450_000],
};

const DRIVERS = [
  "Anna Becker",
  "Jonas Weber",
  "Mehmet Yilmaz",
  "Sophie Schulz",
  "Lukas Hoffmann",
  "Lea Wagner",
  "Tim Krüger",
  "Marie Schröder",
  "Paul Neumann",
  "Elif Kaya",
  "Felix Braun",
  "Nina Hartmann",
  "Ole Janssen",
  "Hanna de Vries",
  "Jan Meyer",
];

const LETTERS = "ABCDEFGHJKLMNPRSTUVWXYZ";

function pad(value) {
  return String(value).padStart(2, "0");
}

export function toIsoDate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function createVehicles(count) {
  const random = createRandom(42);
  const between = (min, max) => Math.floor(random() * (max - min + 1)) + min;
  const pick = (list) => list[Math.floor(random() * list.length)];
  const weighted = (entries) => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let roll = random() * total;
    for (const [value, weight] of entries) {
      roll -= weight;
      if (roll < 0) return value;
    }
    return entries[entries.length - 1][0];
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const usedPlates = new Set();
  const vehicles = [];

  for (let id = 1; id <= count; id++) {
    const type = weighted([
      ["PKW", 55],
      ["Transporter", 35],
      ["LKW", 10],
    ]);
    const status = weighted([
      ["available", 50],
      ["in_use", 35],
      ["workshop", 15],
    ]);
    const [make, model] = pick(MODELS[type]);
    const place = pick(CITIES);

    let plate;
    do {
      const letterCount = between(1, 2);
      let letters = "";
      for (let i = 0; i < letterCount; i++) letters += pick(LETTERS);
      plate = `${place.code}-${letters} ${between(1, 9999)}`;
    } while (usedPlates.has(plate));
    usedPlates.add(plate);

    const nextMaintenance = new Date(today);
    nextMaintenance.setDate(today.getDate() + between(-45, 240));

    const updatedAt = new Date(Date.now() - between(0, 60 * 24 * 60) * 60 * 1000);

    vehicles.push({
      id,
      plate,
      make,
      model,
      type,
      status,
      mileage: between(...MILEAGE_RANGE[type]),
      nextMaintenance: toIsoDate(nextMaintenance),
      location: {
        city: place.city,
        lat: Number((place.lat + (random() - 0.5) / 10).toFixed(5)),
        lng: Number((place.lng + (random() - 0.5) / 10).toFixed(5)),
      },
      driver: status === "in_use" ? pick(DRIVERS) : null,
      updatedAt: updatedAt.toISOString(),
    });
  }

  return vehicles;
}
