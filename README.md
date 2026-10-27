# Fuhrpark-Dashboard

Kleines Dashboard zur Verwaltung einer Fahrzeugflotte: React 18, TypeScript, Vite, React Router, Vitest.
Die Daten kommen von einer lokalen REST-API (`server/`), die ohne weitere Abhängigkeiten mit Node läuft.

## Voraussetzungen

- Node.js ≥ 20 (siehe `.nvmrc`)
- npm

## Starten

```bash
npm install
npm run api   # Terminal 1: API auf http://localhost:3001
npm run dev   # Terminal 2: Frontend auf http://localhost:5173
```

Das Frontend leitet alle Anfragen an `/api/*` per Vite-Proxy an die API weiter.

## Scripts

| Script              | Beschreibung                                                    |
| ------------------- | --------------------------------------------------------------- |
| `npm run dev`       | Frontend im Entwicklungsmodus                                   |
| `npm run api`       | API starten                                                     |
| `npm run api:flaky` | API mit langsameren Antworten (bis 2,5 s) und ca. 20 % HTTP 500 |
| `npm run build`     | Typecheck und Production-Build                                  |
| `npm run typecheck` | Nur Typecheck                                                   |
| `npm test`          | Unit-Tests (Vitest), einmalig                                   |
| `npm run test:watch`| Unit-Tests im Watch-Modus                                       |

## API

Die Daten liegen im Speicher. Nach einem Neustart der API sind alle Änderungen zurückgesetzt.
Jede Antwort ist künstlich verzögert (150–1200 ms).

### `GET /api/vehicles?q=<suchbegriff>`

Liefert alle Fahrzeuge als Array. `q` ist optional und durchsucht Kennzeichen, Hersteller/Modell, Typ,
Standort und Fahrer/in (Groß-/Kleinschreibung, Leerzeichen und Bindestriche werden ignoriert).

### `GET /api/vehicles/:id`

Liefert ein Fahrzeug, oder `404` mit `{ "error": "Fahrzeug nicht gefunden" }`.

### `PATCH /api/vehicles/:id`

Ändert einzelne Felder eines Fahrzeugs und liefert das aktualisierte Fahrzeug zurück.
Änderbar sind nur `status`, `mileage`, `nextMaintenance` und `driver`.

| Feld              | Regel                                                     |
| ----------------- | --------------------------------------------------------- |
| `status`          | `"available"`, `"in_use"` oder `"workshop"`               |
| `mileage`         | ganze Zahl, nicht kleiner als der bisherige Wert          |
| `nextMaintenance` | gültiges Datum im Format `JJJJ-MM-TT`                     |
| `driver`          | Text mit höchstens 60 Zeichen oder `null`                 |

Bei Verstößen antwortet die API mit `400`:

```json
{
  "error": "Validierung fehlgeschlagen",
  "fields": {
    "mileage": "Darf nicht kleiner als der bisherige Wert (48211) sein."
  }
}
```

### Fahrzeug

```json
{
  "id": 1,
  "plate": "LER-IT 482",
  "make": "VW",
  "model": "Crafter",
  "type": "Transporter",
  "status": "in_use",
  "mileage": 48211,
  "nextMaintenance": "2026-11-03",
  "location": { "city": "Leer", "lat": 53.2316, "lng": 7.461 },
  "driver": "Anna Becker",
  "updatedAt": "2026-10-20T08:15:00.000Z"
}
```

## Projektstruktur

```
server/            lokale REST-API (Node, ohne Abhängigkeiten)
src/
  api/             Zugriff auf die REST-API
  components/      wiederverwendbare UI-Komponenten
  pages/           Seiten (eine pro Route)
  utils/           Hilfsfunktionen (Formatierung, Wartung)
  types.ts         gemeinsame Typen
```
