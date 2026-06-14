# RIVR Implementation Tasks

## Delivery Objective

First milestone:

> Upload NCD portfolio -> verify issuer -> store evidence -> detect change -> create alert -> record analyst decision.

AI summaries, WhatsApp delivery, relationship graphs, advanced reports, and billing automation are not part of this milestone.

## Current Status

### Completed Foundation

- [x] Create npm workspace and Next.js App Router starter.
- [x] Add shared UI, configuration, database, and AI package boundaries.
- [x] Add initial Supabase organization, membership, subscription, and audit schema.
- [x] Enable initial Row Level Security policies.
- [x] Document product direction, architecture, deployment, and integration controls.
- [x] Define the canonical MVP API surface in `docs/API_CONTRACTS.md`.
- [x] Confirm the API-first core workflow and defer AI/WhatsApp.
- [x] Link the repository to `bakkaiahs-projects/relationship-intel-web`.
- [x] Move local credentials out of `.env.example`.
- [x] Configure live Supabase and OpenAI connector adapters.
- [x] Add mock KYB, email, WhatsApp, and payment adapters.
- [x] Add bearer-token-protected connector health checks.
- [x] Add connector contract and health tests.
- [x] Replace the starter landing page with the RIVR application shell.
- [x] Add dashboard, portfolio, counterparty, NCD, alert, relationship, report, and settings screen prototypes.
- [x] Add typed sample data and cross-screen data-contract tests.
- [x] Add responsive navigation, dense tables, risk states, and accessible table fallbacks.
- [x] Add a guided demo walkthrough page.
- [x] Connect the core demo views to live Supabase reads and writes for portfolio import, counterparty creation, alert actions, evidence snapshots, and CSV exports.
- [x] Make the dashboard, portfolio, alerts, entities, NCD exposures, and relationship screens render dynamically from the remote schema.

### Connectivity Follow-Up

- [x] Review and apply the RIVR migration to the linked non-production Supabase project.
- [x] Confirm `schemaReady: true` through the protected health route.
- [x] Add OpenAI and job-token variables to a correctly scoped Vercel Preview environment.
- [ ] Add Razorpay test credentials only when a payment workflow is approved.
- [ ] Keep all optional providers set to `mock` until their milestone begins.

### Decisions Required Before Production Integration

- [ ] Validate the monitoring-only scope with the first pilot customer.
- [ ] Approve the minimum portfolio CSV fields.
- [ ] Approve user roles and permission matrix.
- [ ] Define public-source, licensed-data, and consent requirements.
- [ ] Define evidence retention, deletion, and legal-hold policies.
- [ ] Confirm whether raw provider payloads use encrypted database storage or restricted object storage.
- [ ] Select the first KYB provider after commercial and compliance review.
- [ ] Obtain approved sandbox identifiers and non-production credentials.
- [ ] Confirm rating and IBC/NCLT source licensing and monitoring rights.
- [ ] Decide whether Expo mobile work remains deferred until after the web pilot.

## Milestone 1: Tenant And Access Foundation

### Schema

- [ ] Add product roles: owner, admin, operations, risk analyst, credit manager, relationship manager, executive.
- [ ] Add membership status and invitation fields.
- [ ] Add active organization selection rules.
- [ ] Add additive migration with rollback notes.
- [ ] Add indexes for organization membership and role checks.

### Authentication And Authorization

- [ ] Configure Supabase Auth for local development.
- [ ] Add server-side authenticated user helper.
- [ ] Add server-side active organization helper.
- [ ] Derive organization scope from authenticated membership.
- [ ] Add reusable role and permission guards.
- [ ] Prevent client-supplied organization ids from bypassing tenant scope.
- [ ] Add unauthorized, forbidden, and missing-membership responses.

### Organization APIs

- [ ] Implement `GET /api/orgs`.
- [ ] Implement `POST /api/orgs`.
- [ ] Implement `GET /api/orgs/{id}`.
- [ ] Implement `PATCH /api/orgs/{id}`.
- [ ] Implement `GET /api/members`.
- [ ] Implement `POST /api/members`.
- [ ] Implement `PATCH /api/members/{id}`.
- [ ] Audit organization and membership mutations.

### Tenant Tests

- [ ] Test organization creation and owner membership.
- [ ] Test role permissions for every protected operation.
- [ ] Test RLS with at least two organizations and multiple roles.
- [ ] Prove one organization cannot read or mutate another organization's data.

## Milestone 2: Counterparties And NCD Exposures

### Schema

- [x] Add `counterparties` migration.
- [x] Add `counterparty_identifiers` migration.
- [x] Add `ncd_exposures` migration.
- [x] Define counterparty type enum.
- [ ] Define identifier type enum.
- [ ] Define secured/unsecured status.
- [ ] Define currency, amount, coupon, maturity, rating, and outlook fields.
- [ ] Add organization-scoped uniqueness rules for identifiers and ISIN/exposure records.
- [ ] Add masking and deterministic lookup strategy for PAN.
- [ ] Add created-by, updated-by, and timestamps.
- [ ] Add indexes for legal name, ISIN, maturity, rating, and organization filters.
- [ ] Add RLS policies for every new table.
- [ ] Add additive migration with rollback notes.

### Domain Services

- [ ] Define counterparty create, update, and search contracts.
- [ ] Define identifier normalization and validation functions.
- [ ] Define deterministic organization-scoped counterparty matching.
- [ ] Define NCD exposure create and update contracts.
- [ ] Prevent duplicate exposures during retry or repeated import.
- [ ] Audit create, update, and sensitive identifier access.

### Counterparty APIs

- [ ] Implement `GET /api/counterparties`.
- [ ] Implement `POST /api/counterparties`.
- [ ] Implement `GET /api/counterparties/{id}`.
- [ ] Implement `PATCH /api/counterparties/{id}`.
- [ ] Add filters for type, verification status, identifier, and legal name.
- [ ] Return masked sensitive identifiers by default.

### NCD Exposure APIs

- [ ] Implement `GET /api/ncd-exposures`.
- [ ] Implement `POST /api/ncd-exposures`.
- [ ] Implement `GET /api/ncd-exposures/{id}`.
- [ ] Implement `PATCH /api/ncd-exposures/{id}`.
- [ ] Add filters for issuer, ISIN, maturity, rating, security, and risk severity.
- [ ] Return issuer and current alert summary with each exposure.

### Domain Tests

- [ ] Test GSTIN, CIN, PAN, Udyam, and ISIN validation.
- [ ] Test counterparty duplicate matching.
- [ ] Test PAN masking and unauthorized access.
- [ ] Test NCD exposure amount, date, and status validation.
- [ ] Test organization-scoped uniqueness and RLS.

## Milestone 3: Portfolio Import

### Import Contract

- [ ] Finalize required CSV headers.
- [ ] Add downloadable sample portfolio CSV.
- [ ] Define file size, row count, encoding, and MIME limits.
- [ ] Define accepted date, amount, coupon, currency, and secured-status formats.
- [ ] Define duplicate, partial-success, and retry behavior.

### Schema

- [ ] Add `portfolio_imports`.
- [ ] Add `portfolio_import_rows`.
- [ ] Add import status enum.
- [ ] Add row status enum.
- [ ] Add idempotency key uniqueness.
- [ ] Add restricted source-file reference or retention policy.
- [ ] Add RLS and indexes.
- [ ] Add additive migration with rollback notes.

### Import Service

- [ ] Parse CSV using a structured parser.
- [ ] Validate headers before processing rows.
- [ ] Validate each row without failing the complete file.
- [ ] Normalize issuer names and identifiers.
- [ ] Upsert counterparties using deterministic matching.
- [ ] Create or update NCD exposures.
- [ ] Record accepted, rejected, duplicate, created, and updated counts.
- [ ] Store row-level validation and persistence errors.
- [ ] Make retries idempotent.
- [ ] Audit upload, validation, and persistence.

### Import APIs

- [ ] Implement `POST /api/imports/portfolio`.
- [ ] Implement `GET /api/imports/{id}`.
- [ ] Implement `GET /api/imports/{id}/errors`.
- [ ] Reject unauthorized file types and oversized uploads.
- [ ] Return a stable import summary contract.

### Import UI

- [x] Build portfolio register and import entry-point screen prototype.
- [ ] Add template download.
- [ ] Add drag-and-drop and file picker.
- [ ] Add validation preview.
- [ ] Add import progress and completion summary.
- [ ] Add row-level error table and CSV error export.
- [ ] Add loading, empty, retry, and failure states.

### Import Tests

- [ ] Test valid import.
- [ ] Test mixed valid and invalid rows.
- [ ] Test duplicate file retry.
- [ ] Test duplicate counterparty and exposure rows.
- [ ] Test malformed, oversized, and unsupported files.
- [ ] Test tenant isolation for imports and errors.

## Milestone 4: Provider Contracts And Evidence

### Package Boundaries

- [ ] Create `packages/verification`.
- [ ] Define normalized GST profile and filing contracts.
- [ ] Define normalized MCA company, director, and charge contracts.
- [ ] Define normalized PAN validation and name-match contracts.
- [ ] Define normalized Udyam profile contracts.
- [ ] Define provider error and retry classifications.
- [ ] Define provider health and latency result contracts.

### Mock Provider

- [ ] Implement active/valid responses.
- [ ] Implement invalid identifier responses.
- [ ] Implement no-record responses.
- [ ] Implement timeout and provider 5xx responses.
- [ ] Implement rate-limit responses.
- [ ] Implement partial-data responses.
- [ ] Implement changed responses for monitoring tests.
- [ ] Add provider contract tests.

### Schema

- [x] Add `provider_connections` migration.
- [x] Add `provider_requests` migration.
- [x] Add `evidence_snapshots` migration.
- [ ] Store provider configuration metadata and secret references only.
- [ ] Store normalized facts separately from raw payload references.
- [ ] Add source, fetched-at, provider transaction, latency, and status fields.
- [x] Make evidence snapshots append-only at the RLS policy boundary.
- [ ] Add RLS and restricted raw-evidence access policies.
- [ ] Add indexes for counterparty, source, provider, and freshness.
- [ ] Add additive migration with rollback notes.

### Verification Service And APIs

- [ ] Add syntax validation before provider calls.
- [ ] Add permissible-purpose and organization checks.
- [ ] Add idempotency handling.
- [ ] Add provider selection in server-only composition code.
- [ ] Add request, latency, status, and error recording.
- [ ] Add normalized fact persistence.
- [ ] Add restricted raw payload storage reference.
- [ ] Implement `POST /api/verifications/gst`.
- [ ] Implement `POST /api/verifications/mca`.
- [ ] Implement `POST /api/verifications/pan`.
- [ ] Implement `POST /api/verifications/udyam`.
- [ ] Implement `GET /api/verifications/{id}`.
- [ ] Implement `GET /api/evidence-snapshots`.
- [ ] Implement `GET /api/evidence-snapshots/{id}`.
- [ ] Audit verification requests and sensitive evidence views.

### Evidence UI

- [x] Add verification status and freshness to counterparty profile prototype.
- [ ] Add verification action with pending and retry states.
- [ ] Add normalized evidence view.
- [ ] Add authorized raw-evidence drawer or download.
- [ ] Add source, provider, fetched time, and transaction metadata.
- [ ] Add mismatch and incomplete-evidence indicators.

### Verification Tests

- [ ] Test every mock provider scenario.
- [ ] Test idempotent request replay.
- [ ] Test append-only evidence behavior.
- [ ] Test raw-evidence authorization and audit.
- [ ] Test provider error mapping and retry classification.
- [ ] Test secret values never enter client responses or logs.

## Milestone 5: Change Detection And Monitoring

### Package And Schema

- [ ] Create `packages/monitoring`.
- [x] Add `monitoring_runs` migration.
- [x] Add `monitoring_events` migration.
- [ ] Define comparable snapshot selection.
- [ ] Define stable fact canonicalization.
- [ ] Define event types for GST, MCA, PAN, Udyam, ratings, and insolvency.
- [ ] Store before and after facts.
- [ ] Link events to source and evidence snapshot.
- [x] Make events immutable at the RLS policy boundary.
- [ ] Add run idempotency and retry fields.
- [ ] Add RLS and indexes.
- [ ] Add additive migration with rollback notes.

### Change Detector

- [ ] Compare current and previous comparable snapshots.
- [ ] Ignore ordering and provider-format noise.
- [ ] Detect meaningful field additions, removals, and modifications.
- [ ] Deduplicate repeated provider results.
- [ ] Create no event when normalized facts are unchanged.
- [ ] Record detector version.

### Monitoring APIs

- [ ] Implement protected `POST /api/monitoring/run`.
- [ ] Implement `GET /api/monitoring/runs/{id}`.
- [ ] Implement `GET /api/monitoring-events`.
- [ ] Implement `GET /api/monitoring-events/{id}`.
- [ ] Protect job execution with server identity or job token.
- [ ] Add rate limits and safe retry behavior.
- [ ] Audit manual monitoring runs.

### Monitoring Tests

- [ ] Test unchanged snapshot behavior.
- [ ] Test each meaningful change type.
- [ ] Test event immutability.
- [ ] Test duplicate monitoring-run replay.
- [ ] Test tenant isolation and job authorization.

## Milestone 6: Versioned Rules And Alert Workflow

### Package And Schema

- [ ] Create `packages/risk`.
- [x] Add `alert_rules` migration.
- [x] Add `alerts` migration.
- [x] Add `alert_decisions` migration.
- [x] Define severity enum: critical, high, medium, low.
- [x] Define alert status values.
- [x] Define decision values.
- [x] Link alerts to event, evidence, rule id, and rule version.
- [ ] Add owner, due date, acknowledgement, escalation, closure, and resolution fields.
- [ ] Add RLS and indexes.
- [ ] Add additive migration with rollback notes.

### Initial Rules

- [x] Seed GST cancelled -> Critical rule definition.
- [x] Seed GST suspended/inactive -> High rule definition.
- [x] Seed rating default/withdrawal -> Critical rule definition.
- [x] Seed material rating downgrade -> High policy definition.
- [x] Seed key director resignation -> Medium rule definition.
- [x] Seed new material charge -> High rule definition.
- [ ] Add unexpected charge satisfaction -> Critical review.
- [x] Seed CIRP/liquidation announcement -> Critical rule definition.
- [ ] Add rule fixtures and versioning tests.

### Alert APIs

- [ ] Implement `GET /api/alerts`.
- [ ] Implement `GET /api/alerts/{id}`.
- [ ] Implement `PATCH /api/alerts/{id}/assign`.
- [ ] Implement `PATCH /api/alerts/{id}/acknowledge`.
- [ ] Implement `PATCH /api/alerts/{id}/escalate`.
- [ ] Implement `PATCH /api/alerts/{id}/close`.
- [ ] Implement `POST /api/alerts/{id}/decisions`.
- [ ] Enforce valid state transitions and role permissions.
- [ ] Require resolution or decision notes where applicable.
- [ ] Make workflow retries idempotent.
- [ ] Audit every transition and decision.

### Alert UI

- [x] Build alert work queue prototype.
- [x] Add severity, status, owner, age, exposure, and source columns and filter entry point.
- [x] Add alert detail timeline.
- [x] Show triggering rule and version.
- [x] Show before/after facts and evidence link.
- [ ] Add assign, acknowledge, escalate, close, and decision actions.
- [ ] Add accessible loading, empty, error, and confirmation states.

### Alert Tests

- [ ] Test every initial rule.
- [ ] Test duplicate event/rule evaluation.
- [ ] Test allowed and forbidden state transitions.
- [ ] Test analyst and credit-manager permissions.
- [ ] Test evidence and rule linkage.
- [ ] Test audit records for workflow changes.

## Milestone 7: Portfolio Risk Dashboard

### Queries And APIs

- [ ] Define exposure total and count metrics.
- [ ] Define severity distribution.
- [ ] Define high-risk counterparty ranking.
- [ ] Define issuer and group concentration.
- [ ] Define maturity buckets.
- [ ] Define alert aging and ownership metrics.
- [ ] Implement `GET /api/dashboard/portfolio-risk`.
- [ ] Implement `GET /api/dashboard/exposure`.
- [ ] Implement `GET /api/dashboard/high-risk-counterparties`.
- [ ] Add tenant-scoped query tests.
- [ ] Add performance indexes after query-plan review.

### Dashboard UI

- [x] Replace the accelerator landing page with the RIVR application shell.
- [x] Build portfolio overview prototype.
- [x] Add exposure and severity summaries using typed sample data.
- [x] Add maturity buckets using typed sample data.
- [x] Add high-risk counterparties table using typed sample data.
- [x] Add recent and aging alerts using typed sample data.
- [x] Add missing/stale verification queue prototype.
- [ ] Add filter state and responsive dense-table behavior.
- [ ] Add loading, empty, partial-data, and error states.

## Milestone 8: Audit And Operational Controls

### Audit API And UI

- [ ] Standardize audit action names and metadata.
- [ ] Record user and system actor types.
- [ ] Implement `GET /api/audit-logs`.
- [ ] Add filters for actor, action, entity, and date.
- [ ] Restrict sensitive metadata by role.
- [ ] Build audit history view.

### Security Review

- [ ] Verify no service-role credentials are imported by client modules.
- [ ] Verify no provider SDK is instantiated in client code.
- [ ] Redact PAN, tokens, raw payloads, and personal identifiers from logs.
- [ ] Add request body and file upload limits.
- [ ] Add CSRF/origin protections where required.
- [ ] Add rate limits for imports, verification, monitoring, and mutations.
- [ ] Add secure headers and content security policy.
- [ ] Add dependency and secret scanning.
- [ ] Document retention and deletion operations.

### Observability

- [ ] Add structured request ids.
- [ ] Add provider request metrics.
- [ ] Add import and monitoring run metrics.
- [ ] Add alert creation and workflow metrics.
- [ ] Add error monitoring.
- [ ] Add health checks for database and configured providers.
- [ ] Ensure observability data is tenant-safe and redacted.

## First Milestone End-To-End Verification

- [ ] Seed two organizations with separate users.
- [ ] Upload a valid NCD portfolio for organization A.
- [ ] Confirm counterparties and exposures are created.
- [ ] Confirm organization B cannot access organization A records.
- [ ] Verify an issuer using the mock provider.
- [ ] Confirm normalized facts and evidence snapshot are stored.
- [ ] Run a second changed verification.
- [ ] Confirm one immutable monitoring event is created.
- [ ] Confirm the expected versioned rule creates one alert.
- [ ] Assign and acknowledge the alert as a risk analyst.
- [ ] Record a decision as a risk analyst or credit manager.
- [ ] Close or escalate the alert.
- [ ] Confirm dashboard exposure and alert metrics update.
- [ ] Confirm audit history contains the complete workflow.
- [ ] Confirm demo hub walks through the workflow in order.
- [ ] Run lint, typecheck, unit tests, API tests, RLS tests, and build.
- [ ] Verify the workflow in a Vercel preview using mock data.

## Post-Core Milestones

### Real Provider And Scheduling

- [ ] Complete commercial and compliance approval for one KYB provider.
- [ ] Integrate the approved provider behind existing contracts.
- [ ] Add provider health, latency, error-rate, and rate-limit reporting.
- [ ] Add scheduled monitoring with Vercel Cron or a durable workflow provider.
- [ ] Add retry, circuit-breaker, and manual replay controls.

### Email

- [ ] Add email notification provider contract and mock.
- [ ] Integrate Resend, SendGrid, or AWS SES.
- [ ] Add high/critical alert templates.
- [ ] Add delivery records, retries, and webhook processing.
- [ ] Add notification preferences and quiet hours.

### NCD Risk Workspace

- [ ] Add NCD terms, put/call, payment schedule, and covenants.
- [ ] Add rating history and manual rating action upload.
- [ ] Add MCA security charge tracking.
- [ ] Add overdue covenant and certificate alerts.
- [ ] Add committee memo and CSV/PDF exports.

### Relationship Intelligence

- [ ] Add directors and appointments.
- [ ] Add related-party links and confidence.
- [ ] Add common director, address, PAN/GST, and customer-provided group links.
- [ ] Aggregate group exposure.
- [ ] Add hidden concentration alerts.
- [x] Build relationship graph prototype and accessible table fallback.

### WhatsApp And AI

- [ ] Complete approved WhatsApp provider onboarding.
- [ ] Add critical/high alert templates and delivery webhooks.
- [ ] Add evidence-only AI summary contract.
- [ ] Require source event ids in every generated summary.
- [ ] Prevent AI from creating or changing risk scores.
- [ ] Add factuality, access-control, and prompt-injection tests.

## Release Gates

- [x] `npm run check` passes.
- [ ] Relevant API, workflow, RLS, and security tests pass.
- [ ] New environment variables are documented in `.env.example`.
- [ ] Every migration is additive and includes rollback notes.
- [x] README and task documentation match the current core-screen prototype.
- [ ] Incomplete work is recorded in this file.
- [ ] Vercel preview is verified with mock or sandbox data.
- [ ] No production credentials or customer files are committed.
- [ ] Production migration and deployment receive explicit approval.
