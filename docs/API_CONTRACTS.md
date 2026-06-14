# RIVR MVP API Contracts

## Objective

The first RIVR milestone must complete one evidence-backed risk workflow:

> Upload NCD portfolio -> verify issuer -> store evidence -> detect change -> create alert -> record analyst decision.

The APIs in this document are RIVR-owned backend APIs. Browser and mobile clients call these APIs; they never call GST, MCA, PAN, Udyam, rating, or notification providers directly.

## API Conventions

- Base path: `/api`.
- Authentication: Supabase Auth session.
- Tenant scope: derive `organization_id` from the authenticated membership context. Do not trust an arbitrary client-supplied organization id.
- Authorization: enforce role checks in application code and Row Level Security.
- Validation: validate path, query, and body inputs at every route boundary.
- Identifiers: use UUIDs for RIVR resources.
- Timestamps: return ISO 8601 UTC strings.
- Pagination: use cursor pagination for list APIs.
- Idempotency: require an idempotency key for imports, verification requests, and monitoring runs.
- Audit: record all mutations and sensitive evidence access.
- Errors: return a stable code, human-readable message, and optional field details.

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The portfolio contains invalid rows.",
    "details": {
      "rows": [4, 9]
    }
  }
}
```

## Roles

| Role | Primary API permissions |
| --- | --- |
| Owner/Admin | Manage organization, members, provider connections, and all portfolio data |
| Operations | Import portfolios, maintain counterparties, and request verification |
| Risk Analyst | View evidence, investigate alerts, assign/acknowledge alerts, and add decisions |
| Credit Manager | Review alerts, record final decisions, escalate, and close alerts |
| Relationship Manager | Read assigned counterparties, exposures, and alerts |
| Executive | Read portfolio dashboards and reports |

## Core API Surface

### Organizations And Members

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/orgs` | List organizations available to the current user |
| `POST` | `/api/orgs` | Create an organization and owner membership |
| `GET` | `/api/orgs/{id}` | Read organization details |
| `PATCH` | `/api/orgs/{id}` | Update organization settings |
| `GET` | `/api/members` | List members for the active organization |
| `POST` | `/api/members` | Invite or add a member |
| `PATCH` | `/api/members/{id}` | Change role or membership status |

### Portfolio Imports

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/imports/portfolio` | Upload and validate a CSV portfolio |
| `GET` | `/api/imports/{id}` | Read import status and summary |
| `GET` | `/api/imports/{id}/errors` | List row-level validation and persistence errors |

The import flow must:

1. Accept a CSV file and idempotency key.
2. Validate file size, headers, data types, required identifiers, dates, currency, and amounts.
3. Store import and row statuses before creating domain records.
4. Upsert counterparties using deterministic organization-scoped identity rules.
5. Create or update NCD exposures.
6. Return counts for accepted, rejected, created, updated, and duplicate rows.
7. Write audit records for upload, validation, and persistence.

Minimum CSV fields:

- Issuer legal name
- ISIN
- Outstanding amount
- Currency
- Maturity date
- Coupon rate or coupon description
- Secured/unsecured status
- At least one issuer identifier: CIN, GSTIN, PAN, or Udyam

### Counterparties

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/counterparties` | Search and filter tenant-owned counterparties |
| `POST` | `/api/counterparties` | Create a counterparty |
| `GET` | `/api/counterparties/{id}` | Read profile, identifiers, evidence freshness, and exposure summary |
| `PATCH` | `/api/counterparties/{id}` | Update permitted profile fields |

Supported counterparty types:

- Issuer
- Borrower
- Vendor
- Guarantor
- Trustee
- Related party

Identifiers must be stored separately from the counterparty profile and masked according to sensitivity.

### NCD Exposures

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/ncd-exposures` | List exposures with issuer, risk, maturity, and security filters |
| `POST` | `/api/ncd-exposures` | Create an exposure |
| `GET` | `/api/ncd-exposures/{id}` | Read terms, issuer, evidence, alerts, and decisions |
| `PATCH` | `/api/ncd-exposures/{id}` | Update exposure and monitoring fields |

Minimum exposure fields:

- Organization
- Issuer counterparty
- ISIN
- Outstanding amount and currency
- Coupon
- Maturity date
- Rating and outlook when available
- Secured/unsecured status
- Source import or manual-entry reference

### Verification

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/verifications/gst` | Verify GST profile and filing status |
| `POST` | `/api/verifications/mca` | Verify company, director, and charge information |
| `POST` | `/api/verifications/pan` | Validate business PAN and legal-name match |
| `POST` | `/api/verifications/udyam` | Verify MSME registration and category |
| `GET` | `/api/verifications/{id}` | Read request status and normalized result |

Verification routes must:

1. Validate the identifier.
2. Check tenant access and permissible purpose.
3. Call a server-side provider adapter.
4. Store provider request metadata.
5. Store normalized facts and a restricted raw payload reference.
6. Create an evidence snapshot.
7. Run change detection against the previous comparable snapshot.
8. Evaluate versioned rules for created monitoring events.

### Evidence

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/evidence-snapshots` | List evidence metadata and freshness |
| `GET` | `/api/evidence-snapshots/{id}` | Read an authorized evidence snapshot |

Evidence snapshots are append-only. Corrections create a replacement snapshot and audit record; they do not overwrite historical evidence.

### Monitoring

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/monitoring/run` | Run an authorized monitoring batch |
| `GET` | `/api/monitoring/runs/{id}` | Read batch status and counts |
| `GET` | `/api/monitoring-events` | List immutable detected changes |
| `GET` | `/api/monitoring-events/{id}` | Read event, before/after facts, and evidence links |

The monitoring endpoint must be protected by a job token or server identity, rate limited, idempotent, and safe to retry.

### Alerts And Decisions

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/alerts` | List alerts by severity, status, owner, age, and exposure |
| `GET` | `/api/alerts/{id}` | Read alert, triggering rule, event, evidence, and workflow history |
| `PATCH` | `/api/alerts/{id}/assign` | Assign or reassign an alert |
| `PATCH` | `/api/alerts/{id}/acknowledge` | Acknowledge an alert |
| `PATCH` | `/api/alerts/{id}/escalate` | Escalate an alert |
| `PATCH` | `/api/alerts/{id}/close` | Close an alert with a required resolution |
| `POST` | `/api/alerts/{id}/decisions` | Record an analyst or credit decision |

Initial decision values:

- Continue
- Watch
- Request documents
- Freeze
- Exit
- Escalate to committee

Every alert must link to:

- Organization
- Counterparty and optional NCD exposure
- Monitoring event
- Evidence snapshot
- Alert rule and rule version
- Severity and workflow status
- Owner and timestamps

### Dashboard And Audit

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/dashboard/portfolio-risk` | Portfolio exposure, severity, concentration, maturity, and alert aging |
| `GET` | `/api/dashboard/exposure` | Exposure totals and maturity buckets |
| `GET` | `/api/dashboard/high-risk-counterparties` | Highest-risk counterparties with affected exposure |
| `GET` | `/api/audit-logs` | Authorized organization audit history |

Dashboard responses must be calculated from tenant-scoped records and must not expose raw provider payloads.

## Provider Adapter Boundary

```text
Frontend
  -> RIVR backend API
  -> application service
  -> provider-neutral adapter
  -> external provider
  -> evidence snapshot
  -> change detector
  -> versioned rules engine
  -> alert workflow
```

Initial external data categories:

| Source | Required facts | Candidate providers |
| --- | --- | --- |
| GST | Registration status, legal name, filing status | Surepass, Perfios, Decentro, HyperVerge |
| PAN | Business PAN validation and name match | Decentro, Surepass, Perfios |
| Udyam | MSME registration, category, and status | Perfios, eKYCNow, IDS Pay |
| MCA | CIN, company status, directors, and charges | MCA-authorized or licensed private providers |
| Ratings | Rating, outlook, downgrade, and watch | CRISIL, ICRA, CARE, India Ratings |
| IBC/NCLT | Insolvency and legal proceeding alerts | Public sources or licensed legal-data providers |
| Email | Alert notifications | Resend, SendGrid, AWS SES |
| WhatsApp | Critical alerts after core milestone | Meta WhatsApp API, Gupshup, Interakt |

Provider selection requires commercial, licensing, data-use, retention, rate-limit, and sandbox-quality review. Candidate listing does not mean a provider is approved.

## Canonical MVP Tables

- `organizations`
- `organization_members`
- `counterparties`
- `counterparty_identifiers`
- `ncd_exposures`
- `provider_connections`
- `provider_requests`
- `evidence_snapshots`
- `monitoring_runs`
- `monitoring_events`
- `alert_rules`
- `alerts`
- `alert_decisions`
- `portfolio_imports`
- `portfolio_import_rows`
- `audit_logs`

`provider_connections` stores provider type, enabled status, configuration metadata, and secret references only. It must never store plaintext provider credentials.

## Initial Rule Examples

| Rule | Initial severity |
| --- | --- |
| GST cancelled | Critical |
| GST suspended or inactive | High |
| Rating default or withdrawal | Critical |
| Material rating downgrade | High or Critical according to policy |
| Director resignation | Medium, raised to High for key directors |
| New material MCA charge | High |
| Unexpected charge satisfaction for secured exposure | Critical review |
| CIRP or liquidation announcement | Critical |

Rules are deterministic, versioned, testable, and linked to the facts they evaluate. AI does not create or change rule outcomes.

## First Milestone Acceptance

The milestone is complete when:

1. An operations user uploads a valid portfolio CSV.
2. Invalid rows are reported without corrupting valid records.
3. The import creates tenant-scoped counterparties and NCD exposures.
4. A user requests at least one issuer verification through a mock provider.
5. The system stores normalized facts and an append-only evidence snapshot.
6. A later verification with changed data creates an immutable monitoring event.
7. A versioned rule creates an evidence-linked alert.
8. An analyst assigns and acknowledges the alert.
9. An analyst or credit manager records a decision.
10. The portfolio dashboard reflects the affected exposure.
11. Audit logs show the complete workflow.
12. RLS tests prove one organization cannot access another organization's records.

AI summaries and WhatsApp delivery are explicitly outside this milestone.
