# RIVR

Relationship Intelligence & Vendor Risk Monitoring Platform is an India-first SaaS workspace for monitoring NCD issuers, borrowers, vendors, guarantors, and related counterparties.

RIVR verifies business identity, stores evidence snapshots, detects material changes, creates deterministic risk alerts, and records analyst or credit-manager decisions.

## First product milestone

```text
Upload NCD portfolio
  -> verify issuer
  -> store evidence
  -> detect change
  -> create alert
  -> record analyst decision
```

AI summaries and WhatsApp delivery are intentionally deferred until this workflow is complete.

## Local start

1. Review `PRD.md`, `RULES.md`, and `AGENTS.md`.
2. Review `docs/API_CONTRACTS.md` and `docs/NCD_MVP_PLAN.md`.
3. Copy `.env.example` to `.env.local` and add only needed local credentials.
4. Copy `.env.local` to `apps/web/.env.local`; the workspace runs Next.js from `apps/web`.
5. Run `npm install`, then `npm run dev`.
6. Call `GET /api/health` with `Authorization: Bearer <JOB_AUTH_TOKEN>` to verify live Supabase/OpenAI and mock provider connectivity.
7. Run `npm run check` before creating a preview deployment.

No production service is connected by default.

Never place real credentials in `.env.example`. Local secrets belong in ignored `.env.local` files, and deployed secrets belong in Vercel environment variables.

## Workspace

- `apps/web`: Next.js App Router application and RIVR backend routes
- `apps/mobile`: Expo activation placeholder
- `packages/*`: portable domain, provider, UI, database, and configuration boundaries
- `supabase`: migrations and local seed data
- `skills`: reusable Agent Skills
- `docs`: architecture, MCP, deployment, and task documentation

Run the full quality gate with `npm run check`.

## Core workspace screens

- `/`: portfolio risk dashboard with exposure, maturity, high-risk, and alert summaries
- `/portfolio`: NCD portfolio register and CSV import entry point
- `/entities`: counterparty register with issuer verification and risk status
- `/entities/[id]`: counterparty evidence, identifiers, exposure, events, and alerts
- `/ncd-exposures`: NCD exposure register
- `/ncd-exposures/[id]`: NCD monitoring cockpit for terms, security, covenants, and decisions
- `/alerts`: analyst alert work queue
- `/relationships`: related-party graph prototype with an accessible table fallback
- `/reports` and `/settings`: reporting and workspace configuration foundations

The screens currently use typed sample data in `apps/web/lib/mock-data.ts`. Backend API and Supabase integration remain tracked in `docs/TASKS.md`.

## Product documents

- `PRD.md`: product intent and acceptance criteria.
- `docs/API_CONTRACTS.md`: canonical MVP routes, database tables, and first milestone.
- `docs/NCD_MVP_PLAN.md`: phased product and delivery plan.
- `docs/INTEGRATION_RUNBOOK.md`: provider onboarding and operational controls.
- `docs/TASKS.md`: implementation backlog and completion state.

## Database migrations

- Additive SQL migrations live in `supabase/migrations`.
- `20260607000000_initial_schema.sql` creates tenant, membership, and audit foundations.
- `20260614000000_core_rivr_schema.sql` creates the core NCD monitoring domain, RLS policies, immutable evidence/event tables, and initial versioned rules.
- Apply migrations only to an approved non-production Supabase project first; see `docs/INTEGRATION_RUNBOOK.md`.

## Connectivity status

- Vercel project: `bakkaiahs-projects/relationship-intel-web`.
- Supabase API: connected.
- RIVR Supabase schema: migration prepared; remote application requires Supabase CLI access or a non-pooling database credential.
- OpenAI: connected with the configured model.
- KYB, email, WhatsApp, and payments: mock providers.
- Razorpay: test key placeholders exist, but local test credentials are not currently configured.
- Vercel Preview AI/job variables: pending correctly scoped Preview environment setup; Production is unchanged.
