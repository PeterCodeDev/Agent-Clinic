# AgentClinic Tech Stack

## System Design
AgentClinic is a **Next.js full-stack application** built using **Server-Side TypeScript**. It is backed by a **SQLite** database. Agents visit the clinic via a REST API, and human operators view the data via a web dashboard.

**Two surfaces, one server:**
- **API** (`/api/*` routes) — the clinical interface. Stateless per-request.
- **Dashboard** (`/dashboard/*` pages) — the operator interface. React Server Components reading directly from SQLite. Real-time updates via SSE.

**Architectural layers:**
```
Frontend:    Next.js Dashboard (React RSC) + API Routes (/api/*)
Services:    Diagnosis Engine → Treatment Selection → Followup Processor
LLM:         Anthropic SDK (claude-sonnet-4-20250514)
Storage:     SQLite (better-sqlite3 via Drizzle ORM)
Background:  Visit Expiration + Chronic Flagging (setInterval)
```

## Configuration & Environment
Environment variables (`.env`):
- `ANTHROPIC_API_KEY`: API key for LLM calls.
- `ANTHROPIC_MODEL`: (Default: claude-sonnet-4-20250514).
- `AGENTCLINIC_API_KEY`: API key for clinic endpoints (Bearer Auth).
- `DATABASE_PATH`: Path to SQLite database file.
- `FOLLOWUP_WINDOW_HOURS`: Timeout until a visit expires.
- `EXPIRE_CHECK_INTERVAL_MINUTES`: Frequency of expiration checking.

## Data Layer
- **SQLite** via `better-sqlite3`, managed through **Drizzle ORM**.
- **Schema**: Tables for `patients`, `visits`, `ailments`, `treatments`, and `ailment_treatments` (where the evolving effectiveness score is tracked).
- Write Serialization: Handled safely by SQLite in WAL mode with synchronous `better-sqlite3` calls.

## AI & APIs
The system executes two LLM calls per visit logically partitioned:
1. **Triage + Diagnosis**: Matches symptoms to ailment patterns from the database.
2. **Prescription Rationale**: Selects treatments resolving conflicts or choosing the highest-ranked treatment using custom app logic (effectiveness scoring based on `seed * 5 + observed * n / 5 + n`).

## Concurrency and Consistency
- Background jobs run via `setInterval` in the Next.js instrumentation hook.
- Server-Sent Events (SSE) native Node.js streams powers the dashboard's real-time events (`visit_created`, `visit_resolved`, `referral_created`, `chronic_flagged`).
- Synchronous single-threaded SQLite handles rate-limiter and concurrent requests without external queues for the MVP.
