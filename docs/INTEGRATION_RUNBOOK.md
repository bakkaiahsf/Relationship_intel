# Data And Communication Integration Runbook

## Objective

This runbook defines how RIVR obtains, normalizes, stores, monitors, and alerts on:

- GST verification and filing data.
- MCA company, director, signatory, and charge data.
- Udyam/MSME registration data.
- PAN verification and legal-name matching.
- WhatsApp Business alerts.
- Transactional email alerts.

The application must depend on internal contracts, not a provider's request or response format. Provider credentials and calls remain server-side.

The core workflow is:

> Upload NCD portfolio -> verify issuer -> store evidence -> detect change -> create alert -> record analyst decision.

Complete this workflow with a mock provider before integrating a paid provider. AI summaries and WhatsApp delivery are later capabilities.

## Recommended MVP Provider Setup

Use a mock provider for local development and automated tests. Select one consolidated KYB provider for the first pilot only after commercial, licensing, monitoring-rights, data-retention, and sandbox-quality review.

### Primary Candidates

- Surepass, Perfios, Decentro, or HyperVerge.
- Required coverage: GST profile and filing history, business PAN validation, Udyam verification, and MCA company/director/charge data where authorized and contractually supported.

### Secondary

- Add a fallback provider only after the primary integration, normalization contract, and provider observability are stable.

### Communication

- Email: Resend.
- WhatsApp later: Meta WhatsApp Cloud API, Gupshup, or Interakt.

## Integration Architecture

Create provider-neutral packages:

```text
packages/
  verification/
    src/
      contracts.ts
      providers/
        mock.ts
        sandbox.ts
        surepass.ts
  notifications/
    src/
      contracts.ts
      providers/
        email/
          mock.ts
          resend.ts
        whatsapp/
          mock.ts
          meta.ts
          gupshup.ts
  imports/
    src/
      contracts.ts
      portfolio-csv.ts
  monitoring/
    src/
      contracts.ts
      change-detector.ts
  risk/
    src/
      contracts.ts
      rules.ts
```

Application code should call a server-side service such as `VerificationService` or `NotificationService`. It must never instantiate provider SDKs directly.

The RIVR route surface and database contracts are defined in `docs/API_CONTRACTS.md`.

## Local Environment Layout

- `.env.example` contains names, safe defaults, and empty placeholders only.
- Root `.env.local` supports repository scripts and local tooling.
- `apps/web/.env.local` is required because the npm workspace runs Next.js with `apps/web` as its working directory.
- Both local files are ignored and must never be committed.
- Vercel environment variables are the source of deployed secrets.

Use the protected `GET /api/health` route to verify:

- Supabase API reachability and RIVR schema readiness.
- OpenAI key and configured model access.
- Selected KYB, email, WhatsApp, and payment provider status.

The route requires `Authorization: Bearer <JOB_AUTH_TOKEN>` and never returns secret values.

## Supabase Migration Procedure

The repository contains additive migrations in `supabase/migrations`.

1. Use a non-production Supabase project for the first application.
2. Authenticate the Supabase CLI with `supabase login`, or set `SUPABASE_ACCESS_TOKEN`.
3. Link the expected project with `supabase link --project-ref <project-ref>`.
4. Review pending changes with `supabase db push --dry-run`.
5. Apply them with `supabase db push`.
6. Call the protected `/api/health` route and require `database.schemaReady: true`.
7. Run tenant-isolation and RLS tests before adding pilot data.

If a direct database URL is approved instead of project linking, use the non-pooling
connection and avoid printing it:

```bash
supabase db push --db-url "$POSTGRES_URL_NON_POOLING" --dry-run
supabase db push --db-url "$POSTGRES_URL_NON_POOLING"
```

The core migration creates counterparties, identifiers, NCD exposures, provider
requests, evidence snapshots, monitoring events, versioned alert rules, alerts,
decisions, portfolio imports, and counterparty relationships. Evidence snapshots
and monitoring events intentionally have no update or delete RLS policies.

## Common Provider Contract

```ts
export type VerificationSource = "gst" | "mca" | "pan" | "udyam";

export type VerificationRequest = {
  organizationId: string;
  counterpartyId: string;
  identifier: string;
  requestedBy: string;
  consentReference?: string;
};

export type VerificationResult<T> = {
  provider: string;
  source: VerificationSource;
  providerTransactionId?: string;
  fetchedAt: string;
  success: boolean;
  normalizedData?: T;
  rawPayloadReference?: string;
  errorCode?: string;
  errorMessage?: string;
};

export interface BusinessVerificationProvider {
  verifyGstin(input: VerificationRequest): Promise<VerificationResult<GstProfile>>;
  getGstReturns(input: VerificationRequest): Promise<VerificationResult<GstReturn[]>>;
  verifyCin(input: VerificationRequest): Promise<VerificationResult<CompanyProfile>>;
  getCompanyDirectors(input: VerificationRequest): Promise<VerificationResult<Director[]>>;
  getCompanyCharges(input: VerificationRequest): Promise<VerificationResult<CompanyCharge[]>>;
  verifyPan(input: VerificationRequest): Promise<VerificationResult<PanProfile>>;
  verifyUdyam(input: VerificationRequest): Promise<VerificationResult<UdyamProfile>>;
}
```

## Common Request Flow

Every verification follows the same sequence:

1. User submits or uploads an identifier.
2. Server validates identifier syntax.
3. Server checks organization access and permissible purpose.
4. Server creates a `provider_request` record with `pending` status.
5. Provider adapter authenticates and calls the provider.
6. Adapter stores provider transaction id, latency, and status.
7. Adapter normalizes provider response into the RIVR schema.
8. Sensitive raw payload is encrypted or stored in restricted object storage.
9. An `evidence_snapshot` is created.
10. The latest snapshot is compared with the previous snapshot.
11. Changes create immutable `monitoring_events`.
12. Versioned rules evaluate events and may create `alerts`.
13. Notification preferences determine email/WhatsApp delivery.
14. Audit log records who requested, viewed, or acted on the result.

All verification requests require an idempotency key. Evidence snapshots and monitoring events are append-only. A retry must not create duplicate snapshots, events, or alerts for the same provider result and rule version.

## Provider Onboarding Steps

### Step 1: Commercial And Compliance Review

Before purchasing an API:

- Confirm the provider is authorized to supply each requested data set.
- Confirm whether data is public, licensed, consent-based, or regulated.
- Review India data residency, retention, breach notification, and subcontractor terms.
- Confirm SLA, rate limits, support response time, and planned maintenance policy.
- Confirm sandbox data quality and production pricing per successful/failed request.
- Confirm whether caching and repeated monitoring are contractually permitted.
- Obtain a DPA and security documentation before production use.
- Confirm the provider is contractually permitted to support repeated monitoring, not only one-time verification.
- Confirm the authoritative source and update frequency for MCA-style and Udyam data.

### Step 2: Sandbox Account

- Create a provider sandbox account.
- Generate test credentials.
- Restrict credentials by environment and IP where supported.
- Store credentials only in `.env.local` and Vercel preview environment variables.
- Never place secrets in `NEXT_PUBLIC_*` variables.

### Step 3: Test Matrix

Obtain test identifiers covering:

- Valid active registration.
- Invalid identifier.
- Cancelled/inactive registration.
- No-record response.
- Provider timeout.
- Rate-limit response.
- Partial response with missing fields.
- Name mismatch.
- Multiple businesses linked to one PAN where supported.

### Step 4: Production Approval

Move to production only after:

- Contract and permissible data use are approved.
- Production credentials are created separately.
- Provider webhook/IP allowlists are configured where required.
- Logs redact PAN, tokens, and personal contact data.
- Retention and deletion jobs are active.
- Preview integration tests pass using non-production data.

## GST Integration

### Data To Obtain

- GSTIN.
- Legal name and trade name.
- Taxpayer/constitution type.
- Registration status.
- Registration and cancellation date.
- Principal place of business.
- State and jurisdiction.
- Nature of business activities.
- GST return filing history and filing frequency.
- Last source update timestamp.

### Steps

1. Validate the 15-character GSTIN format and checksum where implemented.
2. Call the GST profile/search endpoint.
3. Normalize provider fields into `GstProfile`.
4. Call the return-tracking endpoint for the required financial years.
5. Calculate factual indicators:
   - Active, cancelled, suspended, or inactive status.
   - Missing expected filing periods.
   - Filing delays.
   - Filing-frequency changes.
6. Store the profile and return list as separate snapshots.
7. Compare status, address, legal name, and filing behavior with the prior snapshot.
8. Generate alerts only through versioned rules.

### Monitoring Frequency

- GST registration status: daily for high-risk portfolios, weekly otherwise.
- GST filing history: after statutory filing windows or weekly.
- Manual refresh: rate-limited and audited.

### MVP Rules

- Cancelled GSTIN: critical.
- Suspended/inactive GSTIN: high.
- Legal-name mismatch: medium.
- Repeated missing returns: high.
- Single delayed filing: medium or low based on policy.

## MCA Integration

### Data To Obtain

- CIN/LLPIN.
- Company legal name.
- Company status and class/category.
- Incorporation date.
- Registered office.
- Authorized and paid-up capital where available.
- Directors and signatories with appointment/cessation dates.
- Open, modified, and satisfied charges.
- Strike-off, liquidation, or dormant indicators.
- Filing and source timestamps.

### Steps

1. Validate CIN/LLPIN format.
2. Fetch company master/profile data.
3. Fetch directors/signatories separately.
4. Fetch charge records separately.
5. Normalize entities and relationships:
   - Company profile.
   - Director records keyed by DIN where permitted.
   - Director-company appointments.
   - Charge holder, amount, dates, and status.
6. Compare each data group with its previous snapshot.
7. Create relationship links for common directors.
8. Create risk events for status, director, and charge changes.

### Monitoring Frequency

- Company status: daily or weekly.
- Directors/signatories: weekly.
- Charges: daily for secured NCD exposures, weekly otherwise.

### MVP Rules

- Strike-off/liquidation status: critical.
- Director resignation or cessation: medium/high based on role.
- New material charge: high.
- Material charge modification: medium/high.
- Unexpected charge satisfaction for active secured exposure: critical review.

## Udyam Integration

### Data To Obtain

- Udyam registration number.
- Enterprise legal name.
- Organization type.
- Major activity.
- Enterprise classification.
- Registration date.
- Plant/unit locations where available.
- Registration status.

### Steps

1. Validate the Udyam registration number format.
2. Call verification using the registration number.
3. Normalize into `UdyamProfile`.
4. Compare legal name against GST, MCA, and customer-uploaded name.
5. Store classification as time-bound evidence, not a permanent assumption.
6. Flag mismatch or inactive/unverified registration for analyst review.

### Monitoring Frequency

- At onboarding.
- Quarterly refresh.
- Manual refresh before annual review or credit committee.

## PAN Integration

### Data To Obtain

- PAN validity/status.
- Name returned by provider.
- PAN holder type where legally supplied.
- Name-match result.
- Provider transaction id and timestamp.

### Steps

1. Validate PAN format before any provider call.
2. Confirm documented purpose and authorization.
3. Submit PAN through the server-side adapter.
4. Normalize status and name.
5. Run deterministic normalized-name matching.
6. Store masked PAN in normal application tables.
7. Store unmasked PAN only when required, encrypted, and access-restricted.
8. Never include full PAN in analytics, client logs, URLs, or notification content.

### Monitoring Frequency

- At onboarding.
- On explicit reverification request.
- Do not schedule repeated PAN pulls without a documented requirement.

## Cross-Source Entity Matching

Use deterministic matching before any AI assistance.

### Match Inputs

- Legal name.
- Trade name.
- PAN-derived identity where permitted.
- Registered address and PIN code.
- CIN/GST/Udyam links.
- Director or signatory relationships.

### Match Outcomes

- `exact`: identifier and normalized legal name agree.
- `probable`: strong name/address agreement but one field differs.
- `review`: material mismatch or incomplete evidence.
- `conflict`: identifiers map to different legal entities.

AI may explain a mismatch but must not decide entity identity or override deterministic conflicts.

## WhatsApp Business Integration

### Account Setup

1. Create or use a Meta Business Portfolio.
2. Complete business verification.
3. Create a WhatsApp Business Account.
4. Add and verify a sending phone number.
5. Create a Meta app and enable WhatsApp.
6. Generate a system-user/permanent token for production.
7. Store access token and phone-number id in Vercel server environment variables.
8. Configure webhook verification token and callback URL.
9. Subscribe to message status events.

### Template Setup

Create approved templates for:

- Critical risk alert.
- High-risk alert.
- Daily portfolio digest.
- Alert escalation reminder.

Each template should contain:

- Customer organization name.
- Issuer/borrower display name.
- Alert category and severity.
- Event date.
- Short factual description.
- Secure deep link to RIVR.

Do not include full PAN, sensitive raw evidence, access tokens, or unnecessary director personal data.

### Delivery Flow

1. Risk alert is created.
2. Notification policy checks severity, watchlist, role, quiet hours, and opt-in.
3. A notification job is queued with an idempotency key.
4. Provider adapter sends the approved template.
5. Provider message id is stored.
6. Webhook updates sent, delivered, read, or failed status.
7. Retry transient failures with capped exponential backoff.
8. Permanent failures are shown in the admin provider-health view.

## Email Integration

### Account Setup

1. Create a Resend account.
2. Add and verify the sending domain.
3. Configure SPF and DKIM records.
4. Create a restricted API key.
5. Add `RESEND_API_KEY` and `EMAIL_FROM` to Vercel environments.
6. Configure webhook signing secret when delivery events are enabled.

### Email Types

- Critical/high-risk alert.
- Daily alert digest.
- Weekly portfolio summary.
- Verification failure/action required.
- Credit committee memo export.

### Delivery Flow

1. Create notification record before sending.
2. Render a versioned React Email template.
3. Send through `EmailProvider`.
4. Store provider message id and template version.
5. Process delivered, bounced, complained, and failed webhooks.
6. Suppress repeated sends to bounced or opted-out addresses.
7. Retry only transient failures.

## Notification Contract

```ts
export type NotificationMessage = {
  organizationId: string;
  recipientId: string;
  channel: "email" | "whatsapp";
  template: string;
  templateVersion: number;
  variables: Record<string, string>;
  idempotencyKey: string;
};

export interface NotificationProvider {
  send(message: NotificationMessage): Promise<{
    provider: string;
    providerMessageId: string;
    acceptedAt: string;
  }>;
}
```

## Database Records

Core records:

- `provider_connections`: selected provider, environment, status, configuration metadata.
- `provider_requests`: request lifecycle, requester, latency, status, transaction id, and error code.
- `evidence_snapshots`: normalized facts and restricted raw payload reference.
- `monitoring_runs`: idempotent monitoring batch and status.
- `monitoring_events`: append-only before/after facts and evidence link.
- `alert_rules`: deterministic conditions, severity, and version.
- `alerts`: event, evidence, rule version, owner, severity, and workflow status.
- `alert_decisions`: analyst or credit-manager decision and notes.
- `portfolio_imports`: file-level status, idempotency, and summary.
- `portfolio_import_rows`: row-level source data, validation errors, and persistence status.

Later notification records:

- `notification_preferences`: channel, severity, watchlist, quiet hours, opt-in.
- `notification_deliveries`: template, provider message id, delivery state, retry count.
- `provider_webhook_events`: signed webhook event, processed status, deduplication key.

Never store API keys in these tables. Store only provider configuration metadata and secret references.

## Reliability Controls

- Timeout every provider request.
- Retry only rate limits, timeouts, and provider 5xx responses.
- Do not retry invalid identifiers or no-record responses.
- Add circuit breakers after repeated provider failures.
- Use idempotency keys for verification and notification jobs.
- Record provider latency and error rate.
- Support manual re-run by authorized users.
- Keep a mock provider for development and preview deployments.

## Security Controls

- Credentials are server-only.
- Encrypt sensitive raw payloads.
- Mask PAN and personal identifiers.
- Verify webhook signatures.
- Apply tenant RLS to all normalized records.
- Restrict raw evidence access to authorized roles.
- Log access to sensitive evidence.
- Define retention and deletion periods.
- Reject identifiers in URL query strings where they can enter logs.

## Implementation Order

### Integration Phase A: Portfolio Import And Domain Records

- Implement the portfolio CSV contract.
- Validate required headers, identifiers, dates, amounts, currency, coupon, and security status.
- Store file-level and row-level import results.
- Create organization-scoped counterparties, identifiers, and NCD exposures.
- Add import idempotency and audit logs.

### Integration Phase B: Contracts, Mock Verification, And Evidence

- Define normalized GST, MCA, PAN, and Udyam types.
- Implement mock success, invalid, timeout, rate-limit, partial-response, and changed-response scenarios.
- Add provider request logging and append-only evidence snapshots.
- Add deterministic legal-name and identifier matching.

### Integration Phase C: Change Detection, Rules, And Decisions

- Compare comparable snapshots and create immutable events.
- Add versioned GST, rating, director, charge, and insolvency rules.
- Build assign, acknowledge, escalate, close, and decision transitions.
- Link every alert to event, evidence, provider, rule id, and rule version.
- Reflect affected exposure in dashboard queries.

### Integration Phase D: Approved Provider Integration

- Complete provider commercial and compliance review.
- Integrate one approved GST/PAN/Udyam/MCA provider server-side.
- Validate normalization against the mock contract.
- Add provider latency, error rate, rate-limit, and health reporting.

### Integration Phase E: Scheduling And Email

- Add protected scheduled monitoring and retries.
- Integrate Resend or another approved email provider.
- Add alert templates, delivery records, retries, and webhook processing.

### Integration Phase F: Relationship Intelligence

- Integrate MCA company, director, and charge monitoring.
- Integrate Udyam verification where not covered by the primary provider.
- Build relationship links and secured-exposure charge monitoring.

### Integration Phase G: WhatsApp And AI

- Complete Meta, Gupshup, or Interakt onboarding.
- Integrate approved WhatsApp templates and delivery-status webhooks.
- Add evidence-only AI summaries after alert creation is reliable.

### Integration Phase H: Fallback And Operations

- Add a secondary provider only when pilot requirements justify it.
- Add circuit breaker, manual replay, and provider failover controls.
- Test credential rotation and provider outage runbook.

## Go-Live Checklist

- Provider contracts and data purpose approved.
- Sandbox and production credentials are separate.
- All adapters pass contract tests.
- PII redaction tests pass.
- RLS tests pass for verification and notification tables.
- Webhook signature and replay tests pass.
- Provider timeout, rate-limit, and outage behavior is tested.
- Vercel preview uses mock or sandbox providers.
- Production variables are added only after approval.
- Provider-health dashboard shows latency, errors, and last success.

## Reference Links

- Sandbox GST public API overview: https://developer.sandbox.co.in/api-reference/gst/compliance/guides/public/overview
- Sandbox authentication: https://developer.sandbox.co.in/api-reference/authenticate
- Sandbox GSTIN search: https://developer.sandbox.co.in/api-reference/gst/compliance/endpoints/public/search_gstin
- Sandbox GST return tracking: https://developer.sandbox.co.in/api-reference/gst/compliance/endpoints/public/track_gstrs
- Surepass business verification: https://surepass.io/business-verification/
- Signzy India Stack APIs: https://www.signzy.com/fintech-apis/india-stack
- Meta WhatsApp Cloud API: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
- Resend with Next.js: https://resend.com/docs/send-with-nextjs
