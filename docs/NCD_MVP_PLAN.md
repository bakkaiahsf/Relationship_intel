# India NCD Lending MVP Plan

## Product Thesis

RIVR should launch as an India-first NCD issuer, borrower, and counterparty risk monitoring platform for NBFCs, banks, debt funds, wealth/NCD distributors, family offices, corporate treasury teams, and SME lenders.

The MVP should not behave as a retail investment marketplace, automated credit approval engine, or digital lending aggregator. It should be a credit and risk workspace that verifies entities, monitors NCD exposures, detects early-warning events, and records risk decisions with evidence.

## Approved First Milestone

> Upload NCD portfolio -> verify issuer -> store evidence -> detect change -> create alert -> record analyst decision.

Build this complete vertical workflow before AI summaries, WhatsApp delivery, relationship graphs, advanced reporting, or billing automation.

The canonical backend routes, role permissions, data invariants, and first-milestone acceptance criteria are defined in `docs/API_CONTRACTS.md`.

## Target Customer

### Initial ICP

- NBFC credit and risk teams monitoring SME borrower exposures.
- Private credit and debt fund teams monitoring unlisted or privately placed NCDs.
- Wealth and NCD distribution teams tracking listed NCD issuer risk for customers.
- Corporate treasury teams monitoring counterparty and issuer exposure.
- SME lenders monitoring borrowers, vendors, guarantors, and related parties.

### Primary Users

- Credit Manager: approves monitoring actions and reviews exposure risk.
- Risk Analyst: investigates alerts, verifies evidence, and prepares memos.
- Relationship Manager: receives borrower and issuer watch alerts.
- Operations User: uploads portfolios and completes verification tasks.
- Executive User: views portfolio concentration, high-risk exposure, and trends.
- Super Admin: manages tenants, provider configuration, billing, jobs, and audit.

## MVP Boundaries

### Include

- Organization onboarding, role-based access, and tenant isolation.
- Borrower, issuer, guarantor, trustee, and related-party profiles.
- NCD exposure records with ISIN, coupon, maturity, rating, security, and outstanding amount.
- GSTIN, CIN, PAN, Udyam, director, charge, insolvency, and rating/disclosure monitoring.
- Rule-based risk alerts and analyst workflow.
- Email alert delivery after the in-app alert workflow is stable.
- Audit logs and evidence snapshots.

### Exclude Until Later

- Retail NCD purchase or marketplace flows.
- Direct loan disbursement, repayment, collection, or escrow flows.
- Automated credit approval or AI-generated score.
- AI risk summaries until the core workflow is complete.
- WhatsApp delivery until alert creation and email delivery are reliable.
- Relationship graph and advanced memo/report generation until core monitoring works.
- Bureau pulls without customer consent and regulated purpose validation.
- Production migrations, domains, billing, or provider contracts without explicit approval.

## Regulatory And Data Anchors

- SEBI NCS regulations and circulars govern issue, listing, and disclosure obligations for non-convertible securities.
- RBI digital lending guidance becomes relevant if RIVR later presents loan offers, becomes an LSP, or supports borrower-facing digital lending journeys.
- GST public search supports GSTIN status, legal name, trade name, registration details, cancellation date, filing table, and filing frequency.
- MCA data is needed for company status, registered address, directors/signatories, charges, and strike-off/liquidation indicators.
- IBBI public announcements are high-value early-warning evidence for CIRP, liquidation, voluntary liquidation, and pre-pack events.
- DPDP Act requires purpose limitation, notice/consent where applicable, data minimization, access controls, retention policy, and breach handling.

## Recommended API Strategy

Use provider-neutral interfaces in `packages/` and select providers server-side. Store normalized fields separately from raw provider payload references. Do not expose provider keys or raw credentials to browser/mobile clients.

The detailed onboarding, request flows, provider contracts, monitoring frequencies, notification delivery, retry policy, and go-live checklist are defined in `docs/INTEGRATION_RUNBOOK.md`.

### API Categories

| Category | MVP Need | Recommended Providers | Notes |
| --- | --- | --- | --- |
| GST verification | GSTIN profile, status, filing table, filing frequency | Surepass, Perfios, Decentro, HyperVerge | Start with a mock adapter, then one approved primary. Prefer filing history support. |
| MCA verification | CIN/LLPIN profile, company status, directors, charges | MCA-authorized or licensed private providers; consolidated KYB providers where contractually supported | Charges and director history are mandatory for NCD risk. |
| PAN/business PAN | Entity name match and identity confidence | Decentro, Surepass, Perfios | Treat PAN as sensitive. Store masked display values and deterministic hashes where required. |
| Udyam/MSME | MSME classification and registration | Perfios, eKYCNow, IDS Pay | Verify provider authorization, source, and monitoring rights before selection. |
| Insolvency | CIRP/liquidation public announcements | IBBI public announcements, licensed legal data provider later | Start with public source monitoring and evidence links. |
| NCD/listing disclosures | Listed NCD disclosures, issuer filings | SEBI/BSE/NSE public disclosures, licensed market data later | Manual upload first, then feed integration. |
| Ratings | Rating action and outlook changes | CRISIL, ICRA, CARE, India Ratings, Acuite feeds/alerts | MVP can start with manual rating fields plus monitored source links. |
| Credit bureau | Commercial credit report, rank, defaults | TransUnion CIBIL, CRIF High Mark, Experian, Equifax | Phase 2/enterprise only; requires permissible purpose and contracts. |
| Bank/account checks | Penny drop, account verification | Decentro, Cashfree, RazorpayX, Signzy, Surepass | Needed only if borrower onboarding expands. |
| Account Aggregator | Consent-based financial data | Setu, FinBox, Perfios, Anumati ecosystem partners | Not MVP unless underwriting is added. |
| Email | Transactional alerts and reports | Resend, SendGrid, AWS SES | Resend is fastest for MVP; keep adapter interface. |
| WhatsApp | Alert delivery | Meta Cloud API, Gupshup, Twilio, Interakt | Use approved templates for high/critical alerts. |
| AI summaries | Evidence-only summaries | OpenAI, Azure OpenAI, Anthropic through provider adapter | AI cannot create independent scores. |
| Observability | Logs, errors, uptime | Vercel logs, Sentry, PostHog, Supabase logs | Add request/provider audit early. |
| Jobs | Monitoring scheduler and retries | Vercel Cron, Inngest, QStash, Trigger.dev | Vercel Cron is simplest; Inngest is better for multi-step retries. |

### API Selection Recommendation

For MVP speed:

- Implement a mock KYB provider first so the complete workflow is testable without external credentials.
- Evaluate Surepass, Perfios, Decentro, and HyperVerge for consolidated GST/PAN/Udyam coverage.
- Select one primary only after licensing, monitoring rights, sandbox quality, rate limits, and commercial review.
- Add a secondary provider only after the primary integration and normalization contract are stable.
- Insolvency: IBBI public announcements with evidence URLs.
- Ratings and NCD disclosures: manual upload plus monitored public links in MVP; licensed feeds after pilot validation.
- Notifications: add Resend email after the in-app alert lifecycle is stable.
- WhatsApp and AI: defer until after the first milestone.

## Data Model Additions

### Core Tables

- `counterparties`: tenant-owned canonical entity record.
- `counterparty_identifiers`: GSTIN, CIN, PAN, Udyam, LEI, ISIN, DIN references.
- `ncd_exposures`: ISIN, issuer, holder/customer, outstanding, coupon, maturity, rating, security status.
- `provider_connections`: enabled provider metadata and secret references, never plaintext credentials.
- `provider_requests`: provider transaction, status, latency, and request audit.
- `evidence_snapshots`: provider, source, raw reference, normalized facts, fetched timestamp.
- `monitoring_runs`: idempotent batch execution and status.
- `monitoring_events`: immutable detected changes and source evidence.
- `alert_rules`: deterministic conditions, severity, version, and enabled status.
- `alerts`: workflow status, severity, owner, due date, escalation, event, evidence, and rule version.
- `alert_decisions`: continue, watch, freeze, exit, request documents, committee escalation.
- `portfolio_imports`: file-level import status and summary.
- `portfolio_import_rows`: row-level source data, validation, and persistence result.
- `audit_logs`: user and system actions across the complete workflow.

Later tables:

- `ncd_terms`: coupon type, payment schedule, put/call, covenants, security cover threshold.
- `security_charges`: MCA charge records, charge holder, amount, creation/modification/satisfaction date.
- `directors`: DIN, name, appointments, resignations, related companies.
- `ai_summaries`: factual summary, source event ids, model/provider, generated timestamp.

### Key Relationships

- One counterparty can have many identifiers.
- One issuer can have many NCD exposures.
- One exposure can have many covenants, ratings, security records, and alerts.
- One director can link many counterparties.
- One alert must link to source events and evidence snapshots.

## Risk Taxonomy

| Severity | Examples | Action |
| --- | --- | --- |
| Critical | CIRP/liquidation, company struck off, GST cancelled, rating default/withdrawn, security charge satisfied unexpectedly | Immediate escalation and exposure freeze recommendation. |
| High | Director resignation, new material charge, GST suspended, repeated filing delay, rating downgrade, covenant certificate overdue | Analyst review within 1 business day. |
| Medium | Address mismatch, related-party deterioration, negative outlook, missing document, delayed disclosure | Analyst review within 3 business days. |
| Low | Profile change, new relationship discovered, upcoming maturity, optional data missing | Track in normal monitoring queue. |

## Phase Plan

### Phase 0: Product And Compliance Foundation

Timeline: 1 week

Deliverables:

- Confirm RIVR as monitoring-only MVP, not an LSP or marketplace.
- Create pilot data template for 100-500 NCD/borrower records.
- Define data retention, consent, and public-source evidence policy.
- Finalize provider shortlist and sandbox credentials.
- Prepare Vercel preview project and Supabase local project.

Git/Vercel gate:

- Branch: `phase-0-foundation`.
- Required checks: `npm run check`.
- Deployment: Vercel preview only.

Exit criteria:

- Customer pilot workflow and provider choices approved.
- No production credentials or data used.

### Phase 1: Tenant, Auth, And Portfolio Upload

Timeline: 2 weeks

Deliverables:

- Supabase Auth with organization membership and roles.
- RLS policies for organization-scoped data.
- CSV upload for counterparties and NCD exposures.
- Portfolio dashboard with exposure totals, maturity buckets, and missing verification queue.
- Audit logs for upload, edit, delete, and role changes.

UI/UX:

- Operational dashboard first screen, not marketing page.
- Dense tables with filters, saved views, severity badges, and inline status.
- Upload flow with field mapping, validation errors, preview, and import summary.

Git/Vercel gate:

- Branch: `phase-1-portfolio-upload`.
- PR must include migration rollback notes.
- Vercel preview tested with seed data.

Exit criteria:

- User can upload an NCD portfolio and see tenant-safe records.

### Phase 2: Evidence And Verification Engine

Timeline: 3 weeks

Deliverables:

- Provider adapter interface for GST, MCA, PAN, and Udyam.
- Mock provider for local development and tests.
- Provider request and evidence snapshot tables.
- Evidence snapshots and normalized entity profile.
- Name match and identifier mismatch flags.
- Append-only evidence access with role checks and audit logs.

UI/UX:

- Entity profile with identity confidence, source freshness, and evidence drawer.
- Verification queue grouped by failed, mismatch, stale, and verified.
- Empty/error states for provider downtime and missing credentials.

Git/Vercel gate:

- Branch: `phase-2-verification-engine`.
- Provider keys only in Vercel/Supabase secrets.
- Preview deployed with mock provider by default.

Exit criteria:

- User can verify GSTIN/CIN/PAN/Udyam through the mock adapter and store evidence.

### Phase 3: Change Detection And Alert Workflow

Timeline: 3 weeks

Deliverables:

- Change detector comparing latest provider response with previous snapshot.
- Immutable monitoring events with before/after facts.
- Versioned rule-based alert generation.
- Alert lifecycle: open, assigned, acknowledged, escalated, closed.
- Analyst and credit-manager decision log.
- Protected manual monitoring endpoint.

UI/UX:

- Analyst work queue sorted by severity, exposure, age, and owner.
- Alert detail page with timeline, evidence, impact, and decision actions.
- Executive strip with critical exposure, high-risk count, and alert aging.

Git/Vercel gate:

- Branch: `phase-3-alert-engine`.
- Preview validates the protected monitoring endpoint.
- Tests cover critical rule generation.

Exit criteria:

- A changed verification creates an event and alert, and an analyst records a decision.

### Phase 4: Scheduling, Email, And NCD Workspace

Timeline: 3 weeks

Deliverables:

- Scheduled monitoring job using Vercel Cron or Inngest.
- Email alerts through a provider adapter with retries.
- One approved real KYB provider integration behind server-only code.
- NCD detail page with issuer, ISIN, terms, ratings, security, covenants, and alerts.
- Covenant tracker: due dates, threshold, received status, overdue alerts.
- Rating watch and manual rating action upload.
- Security charge tracking and MCA charge comparison.
- Risk decision log and committee memo export.

UI/UX:

- NCD exposure page should feel like a credit monitoring cockpit.
- Use tabs for Overview, Terms, Covenants, Security, Events, Decisions.
- Add export actions as icon buttons with accessible labels.

Git/Vercel gate:

- Branch: `phase-4-ncd-workspace`.
- Preview includes sample NCD portfolio and generated memo.

Exit criteria:

- Credit manager can review one NCD exposure and record a decision.

### Phase 5: Relationship Intelligence

Timeline: 2 weeks

Deliverables:

- Director and related-entity graph.
- Group exposure aggregation.
- Common director, address, PAN/GST, and customer-provided group links.
- Hidden concentration alerts.

UI/UX:

- Graph should be practical, not decorative.
- Provide table fallback for accessibility and export.
- Show relationship confidence and source evidence.

Git/Vercel gate:

- Branch: `phase-5-relationship-intel`.
- Preview tested on desktop and mobile.

Exit criteria:

- User can identify related entities and total group exposure.

### Phase 6: WhatsApp, AI Summary, And Pilot Readiness

Timeline: 2 weeks

Deliverables:

- WhatsApp template alerts for critical/high events.
- AI factual summary with cited event ids.
- PDF/CSV reports.
- Admin provider health page.
- Pilot onboarding checklist and support SOP.

UI/UX:

- AI summary displayed as "system-generated factual summary" with source events.
- WhatsApp preferences per role/watchlist.
- Provider health visible only to admins.

Git/Vercel gate:

- Branch: `phase-6-pilot-readiness`.
- Vercel preview used for customer pilot walkthrough.
- Production deploy only after explicit approval.

Exit criteria:

- One pilot customer can onboard, monitor, receive alerts, and export risk memos.

## Git And Release Workflow

- Create one feature branch per phase.
- Use small PRs for schema, provider, UI, and job changes where practical.
- Every PR must pass `npm run check`.
- Every migration must include rollback notes in the PR description.
- Every phase gets a Vercel preview URL.
- Production deploys require explicit approval after preview validation.
- Do not commit `.env.local`, provider credentials, customer files, or raw production exports.

## Vercel Deployment Strategy

- Configure Vercel project root as `apps/web`.
- Use Vercel Git integration for preview deployments.
- Use `vercel link --repo` for this monorepo.
- Use Vercel environment variables for provider credentials.
- Use preview deployments for every phase.
- Use `vercel promote` only after preview validation and approval.
- Add Vercel Cron for simple scheduled monitoring; move to Inngest if monitoring needs multi-step retries, long-running queues, or per-provider retry orchestration.

## UI/UX Direction

The app should feel like a professional credit risk terminal, not a marketing site.

### Visual Style

- Quiet, dense, high-trust interface with restrained color.
- White/neutral surfaces with strong table hierarchy and risk color accents.
- No decorative gradients, oversized hero sections, or card-heavy marketing layout inside the product.
- Use shadcn/ui-compatible components and lucide icons.
- Keep cards for repeated entities, metrics, dialogs, and contained tools only.

### Main Navigation

- Dashboard
- Portfolio
- Entities
- NCD Exposures
- Alerts
- Relationships
- Reports
- Admin
- Settings

### Critical Screens

- Portfolio dashboard: exposure, risk distribution, alert aging, maturity buckets.
- Entity search: GSTIN, CIN, PAN, business name, ISIN.
- Entity detail: verification, identifiers, directors, charges, events, alerts.
- NCD detail: terms, security, rating, covenants, repayment, decisions.
- Alert queue: severity, exposure impact, owner, SLA, source.
- Relationship graph: group exposure and related parties.
- Admin provider health: provider latency, error rate, last successful job.

## Recommended MCPs And Plugins

### Already Configured

- `openaiDeveloperDocs`: official OpenAI API and Codex documentation lookup.
- `context7`: current library documentation lookup.
- `playwright`: browser automation for UI verification.

### Recommended Next

- Supabase MCP: inspect schema, migrations, RLS, and local data safely.
- GitHub MCP: manage issues, PRs, reviews, and release notes from Codex.
- Sentry MCP: inspect runtime errors once observability is added.
- PostHog MCP or analytics access: inspect funnels and product usage after pilot.
- Vercel plugin/skills: keep using Vercel CLI, deployments, env-vars, storage, functions, and verification skills.
- Browser plugin: verify local and preview UI flows with screenshots.

### Avoid For Now

- Direct production database MCP access.
- Any MCP that can mutate billing, domains, or production data without approval.
- Provider dashboards with write access until pilot controls are mature.

## Environment Variables To Add

```bash
# Provider selection
KYB_PROVIDER=mock
NOTIFICATION_EMAIL_PROVIDER=mock
NOTIFICATION_WHATSAPP_PROVIDER=mock
PAYMENTS_PROVIDER=mock
JOB_AUTH_TOKEN=
EVIDENCE_STORAGE_BUCKET=rivr-evidence

# KYB providers
SANDBOX_API_KEY=
SANDBOX_API_SECRET=
SUREPASS_API_TOKEN=
PERFIOS_API_KEY=
PERFIOS_API_SECRET=
SIGNZY_CLIENT_ID=
SIGNZY_CLIENT_SECRET=
DECENTRO_CLIENT_ID=
DECENTRO_CLIENT_SECRET=
HYPERVERGE_APP_ID=
HYPERVERGE_APP_KEY=

# Razorpay test credentials
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# Notifications
RESEND_API_KEY=
EMAIL_FROM=
WHATSAPP_PROVIDER=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ALERT_TEMPLATE_CRITICAL=
WHATSAPP_ALERT_TEMPLATE_HIGH=

# Observability
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

Keep these empty in `.env.example` and configured only in `.env.local` or Vercel environment variables.

## Source References

- SEBI NCS Regulations: https://www.sebi.gov.in/legal/regulations/oct-2025/securities-and-exchange-board-of-india-issue-and-listing-of-non-convertible-securities-regulations-2021-last-amended-on-october-28-2025-_97902.html
- SEBI NCS issue/listing master circular: https://www.sebi.gov.in/legal/master-circulars/oct-2025/master-circular-for-issue-and-listing-of-non-convertible-securities-securitised-debt-instruments-security-receipts-municipal-debt-securities-and-commercial-paper_97343.html
- SEBI NCS listing obligations master circular: https://www.sebi.gov.in/legal/master-circulars/jul-2025/master-circular-for-listing-obligations-and-disclosure-requirements-for-non-convertible-securities-securitized-debt-instruments-and-or-commercial-paper_95230.html
- RBI annual report digital lending and ULI context: https://www.rbi.org.in/scripts/AnnualReportPublications.aspx?Id=1436
- GST taxpayer search manual: https://tutorial.gst.gov.in/userguide/taxpayersdashboard/Search_Taxpayer_manual.htm
- IBBI public announcements: https://ibbi.gov.in/public-announcement
- DPDP Act 2023: https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf
- Sandbox GST/MCA docs: https://developer.sandbox.co.in/api-reference/gst/compliance/guides/public/overview
- Surepass business verification: https://surepass.io/business-verification/
- Signzy India Stack: https://www.signzy.com/fintech-apis/india-stack
