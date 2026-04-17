# AgentClinic Roadmap

High-level implementation order in very small phases of work.

## Phase 1: Foundation & Data Layer
- **Step 1.1**: Initialize Next.js project with Server-Side TypeScript and TailwindCSS (completed).
- **Step 1.2**: Install Database dependencies (`better-sqlite3`, `drizzle-orm`, `drizzle-kit`).
- **Step 1.3**: Configure `drizzle.config.ts` and set up the SQLite DB.
- **Step 1.4**: Define the Drizzle schema (`patients`, `visits`, `ailments`, `treatments`, `ailment_treatments`).
- **Step 1.5**: Create the initial seed script to populate core ailments and treatments data.

## Phase 2: Engine Utilities & LLM Logic
- **Step 2.1**: Install `@anthropic-ai/sdk` and configure the LLM client.
- **Step 2.2**: Build the Triage/Diagnosis capability (LLM Prompt 1).
- **Step 2.3**: Build the deterministic Treatment Selection logic (ranked effectiveness).
- **Step 2.4**: Build the Prescription Rationale engine (LLM Prompt 2).
- **Step 2.5**: Construct the `engine/pipeline.ts` combining steps 2.2 through 2.4.

## Phase 3: REST API Routes (Clinical Workflow)
- **Step 3.1**: Implement `POST /api/patients` and `GET /api/patients` with Bearer auth middleware.
- **Step 3.2**: Implement `POST /api/visits` pipeline routing calls mapping directly to the DB.
- **Step 3.3**: Implement `POST /api/visits/:id/followup` to manage effectiveness score tracking and recurrence flagging.
- **Step 3.4**: Implement auxiliary catalog routes (`/api/ailments`, `/api/treatments`).

## Phase 4: Background Jobs & Server-Sent Events
- **Step 4.1**: Set up `src/instrumentation.ts` for Next.js periodic tasks.
- **Step 4.2**: Implement "Visit Expiration" background worker.
- **Step 4.3**: Implement "Chronic Condition" background worker.
- **Step 4.4**: Build the in-memory event emitter for SSE.
- **Step 4.5**: Create the `GET /api/events` endpoint.

## Phase 5: Dashboard Implementation (Frontend)
- **Step 5.1**: Build `GET /api/analytics/...` backend endpoints to supply dashboard metrics.
- **Step 5.2**: Create the Dashboard Overview Page with standard stat cards and Recharts.
- **Step 5.3**: Build the Patient Directory filter view.
- **Step 5.4**: Build the Patient Detail View (visit timeline & active treatments).
- **Step 5.5**: Build Ailment Analytics visualization and Alerts page.
- **Step 5.6**: Subscribe Frontend to SSE for real-time reactivity without page reloads.

## Phase 6: E2E Verification
- **Step 6.1**: Run a full integration Smoke Test (Registration -> Visit -> Follow Up -> Chronic Flagging).
- **Step 6.2**: Test concurrent Visit requests handling.
- **Step 6.3**: Optimize dashboard layout load time.
