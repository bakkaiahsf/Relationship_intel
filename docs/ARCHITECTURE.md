# Architecture

## Principles

- Product intent lives in `PRD.md`; engineering constraints live in `RULES.md`.
- Applications compose shared packages but do not own provider credentials.
- Vendor SDKs are adapters behind stable interfaces.
- Web, mobile, database, and deployment work evolve independently.

## Boundaries

| Area | Responsibility |
| --- | --- |
| `apps/web` | Next.js UI, route handlers, server actions, authentication context |
| `apps/mobile` | Expo application once activated |
| `packages/ui` | Shared presentational components and tokens |
| `packages/config` | Typed environment and app configuration |
| `packages/db` | Database contracts and Supabase adapter |
| `packages/ai` | AI provider contract and adapters |
| `packages/verification` | GST, MCA, PAN, and Udyam contracts and provider adapters |
| `packages/monitoring` | Evidence comparison, immutable event creation, and monitoring orchestration |
| `packages/risk` | Versioned deterministic alert rules and workflow transitions |
| `packages/imports` | Portfolio CSV validation, mapping, and persistence services |
| `packages/notifications` | Email adapter first; WhatsApp adapters after the core milestone |
| `packages/payments` | Mock payment boundary; Razorpay integration remains outside the core monitoring milestone |
| `supabase` | SQL migrations, RLS, and local seed data |
| `skills` | Repeatable Codex workflows |

## Replaceable providers

Application code should depend on internal contracts, not vendor SDKs. Verification, database, email, AI, billing, storage, and analytics providers must be selected in server-only composition code using environment configuration.

## Request Flow

```text
Client
  -> Next.js route handler/server action
  -> authenticated organization context
  -> application service
  -> database or provider adapter
  -> evidence snapshot
  -> change detector
  -> versioned risk rule
  -> alert workflow
  -> audit log
```

The canonical MVP API surface and route responsibilities are defined in `docs/API_CONTRACTS.md`.

## Data Invariants

- Every domain record is scoped to an organization.
- Counterparty identifiers are separate from canonical counterparty records.
- Evidence snapshots and monitoring events are append-only.
- Raw provider payloads are restricted; application views use normalized facts.
- Every alert links to an event, evidence snapshot, rule id, and rule version.
- Monitoring and import operations are idempotent and safe to retry.
- Alert state changes and decisions are auditable.
- Provider credentials remain outside database rows and client bundles.
- Live connector checks are exposed only through the bearer-token-protected `/api/health` route.

## Security

- Browser and mobile clients use public credentials only.
- Privileged credentials are available only to server modules.
- Supabase API tables have RLS enabled.
- Authorization is checked at application and database boundaries.
- Organization scope is derived from authenticated membership, not trusted from request bodies.
- PAN and personal identifiers are masked in default UI, API responses, and logs.
- Production mutations require explicit approval.
