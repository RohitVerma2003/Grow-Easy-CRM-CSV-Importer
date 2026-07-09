# GrowEasy CSV Importer

An AI-powered CSV importer for GrowEasy CRM. Upload a lead export from *any*
source — Facebook Lead Ads, Google Ads, a manually built spreadsheet, another
CRM's export — and it gets automatically mapped into GrowEasy's standard CRM
schema, regardless of how the columns are named or structured.

Built as a take-home assignment (Software Developer, Intern/Full-Time).

---

## The problem this solves

Every lead source names its columns differently: `Ph No`, `phone`,
`contact_number`, and `Mobile` might all mean the same thing. Hand-writing a
mapping for every possible source doesn't scale. Instead of parsing rules,
this project uses an LLM (Gemini, via LangChain) to *semantically* map
whatever columns exist in a CSV into a fixed CRM schema — while still
enforcing hard business rules in code, because you can't fully trust an LLM
alone with things like enum constraints or "must have an email or phone."

---

## Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────┐
│   Frontend (Next.js)     │  HTTP   │   Backend (Node / Express)    │
│                           │ ──────> │                                │
│  1. Upload CSV            │         │  1. Parse CSV                 │
│  2. Preview (client-side  │         │  2. Batch rows                │
│     parse, no AI yet)     │         │  3. Gemini (via LangChain)    │
│  3. Confirm → POST file   │         │     maps each batch to the    │
│  4. Show results          │ <────── │     CRM schema (structured    │
│                           │  JSON   │     output, retried on fail)  │
└─────────────────────────┘         │  4. Enforce business rules     │
                                      │  5. Return imported/skipped   │
                                      └──────────────────────────────┘
```

Both halves are **fully stateless** — no database, nothing persisted server-side.
Each request is self-contained: file in, JSON result out.

---

## Repositories

This project is split into two independent apps, each with its own README
and setup instructions:

- **`groweasy-backend/`** — Express API that does the actual CSV parsing and
  AI field mapping.
- **`groweasy-frontend/`** — Next.js UI for uploading, previewing, confirming,
  and reviewing results.

They're decoupled on purpose: the frontend only talks to the backend over
HTTP (`NEXT_PUBLIC_API_BASE_URL`), so either can be deployed, run, or
replaced independently.

---

# Some Screenshots
<table>
  <tr>
    <td>
      <img src="https://github.com/user-attachments/assets/9b1c6e94-a9c6-4810-b47d-0df8c75d5c65" width="100%">
    </td>
    <td>
      <img src="https://github.com/user-attachments/assets/1c4d727a-cec2-4da0-9d06-20ec80bea4f3" width="100%">
    </td>
  </tr>
  <tr>
    <td>
      <img width="100%" src="https://github.com/user-attachments/assets/2004cd3d-01bf-4fdf-82ca-5c1689796936" />
    </td>
    <td>
      <img width="100%" src="https://github.com/user-attachments/assets/3c50d8ad-b9af-4616-815a-627cc5bfd71e" />
    </td>
  </tr>
</table>

---

## Quick start

You'll need a [Gemini API key](https://aistudio.google.com/apikey).

**1. Backend**
```bash
cd groweasy-backend
npm install
cp .env.example .env        # add your GEMINI_API_KEY
npm run dev                 # http://localhost:8080
```

**2. Frontend** (in a second terminal)
```bash
cd groweasy-frontend
npm install
cp .env.local.example .env.local   # points at http://localhost:8080 by default
npm run dev                        # http://localhost:3000
```

Open `http://localhost:3000`, upload a CSV, and walk through Upload → Preview
→ Confirm → Results.

---

## The CRM schema

Every imported row is mapped to this fixed shape:

| Field | Notes |
|---|---|
| `created_at` | Must be `new Date()`-parseable |
| `name` | |
| `email` | First email found; extras go to `crm_note` |
| `country_code` | e.g. `+91` |
| `mobile_without_country_code` | First number found; extras go to `crm_note` |
| `company`, `city`, `state`, `country` | |
| `lead_owner` | |
| `crm_status` | One of 4 fixed enum values, or `null` |
| `crm_note` | Remarks, extra emails/phones, anything else useful |
| `data_source` | One of 5 fixed enum values, or `null` |
| `possession_time`, `description` | |

**Hard rule:** a row with neither an email nor a phone number is **skipped**,
not imported — this is enforced in code (`postProcess.ts`), not just left to
the AI's judgment.

---

## Key design decisions

- **Structured output, not text parsing.** The backend uses LangChain's
  `withStructuredOutput()` against a Zod schema, so Gemini's response is
  guaranteed to match the CRM shape — no fragile regex/JSON-string parsing.
- **Batching + bounded concurrency.** Rows are sent to Gemini in batches
  (default 20 rows, 2 batches concurrently) rather than one row at a time
  (slow, expensive) or the whole file at once (context limits, harder to
  debug failures).
- **Retry with backoff, isolated by batch.** If one batch fails all retries,
  only *those* rows are marked skipped with a reason — the rest of the
  import still succeeds.
- **Business rules enforced twice.** The AI prompt asks for enum compliance
  and skip-if-no-contact-info, but the backend also re-checks these in code
  after the AI responds. Prompts are guidance; code is the guarantee.
- **Stateless throughout.** No database, no disk writes — everything lives
  in memory for the duration of one request.

---

## Testing

The backend has 45 unit tests (Vitest) covering CSV parsing, batching,
retry logic, schema validation, business-rule post-processing, and the
import pipeline end-to-end (with the Gemini call mocked). Run them with:

```bash
cd groweasy-backend
npm test
```

---

## Tech stack

| | |
|---|---|
| Backend | Node.js, Express, TypeScript, LangChain, Gemini (`gemini-2.5-flash-lite`), Zod, Multer, Papaparse |
| Frontend | Next.js (App Router), TypeScript, Tailwind CSS, Papaparse |
| Testing | Vitest |

No database, no Docker — kept intentionally simple per the project's scope.
