# GrowEasy CSV Importer — Backend

## Setup

```bash
npm install
cp .env.example .env
# then edit .env and set GEMINI_API_KEY to a real key
```

## Run (dev, hot-reload)

```bash
npm run dev
```

Server starts on `http://localhost:8080` (or `PORT` from `.env`).

## Build & run (production)

```bash
npm run build
npm start
```

## Endpoints

- `GET /health` → `{ "status": "ok" }`
- `POST /api/import` → multipart/form-data, field name `file` (a `.csv`)
  Returns `{ imported, skipped, totals }`

## Quick test

```bash
curl -X POST http://localhost:8080/api/import -F "file=@/path/to/sample.csv"
```
