# GrowEasy CSV Importer — Frontend

## Setup

```bash
npm install
cp .env.local.example .env.local
# edit .env.local if your backend isn't at http://localhost:8080
```

## Run (dev)

```bash
npm run dev
```

Open http://localhost:3000. Make sure the backend (`groweasy-backend`) is running first — this app calls it directly, there's no server-side proxy.

## Build & run (production)

```bash
npm run build
npm start
```

## Flow

1. **Upload** — drag & drop or pick a `.csv`. Parsed entirely client-side (Papaparse), no backend call yet.
2. **Preview** — see exactly what was parsed, in a scrollable table with sticky headers.
3. **Confirm** — sends the raw file to the backend's `POST /api/import`, which runs the AI field mapping.
4. **Results** — imported vs. skipped records, totals, and a "Download CSV" button for the imported set.

## Notes

- Fully stateless — nothing is persisted client- or server-side beyond the current session's React state.
- Dark mode toggle in the header (persisted to `localStorage`).
- `NEXT_PUBLIC_API_BASE_URL` controls which backend it talks to — update this for deployment (e.g. Railway/Render URL).
