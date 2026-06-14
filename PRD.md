# Product Requirements Document

## Product Name

Relationship Intelligence & Vendor Risk Monitoring Platform (RIVR)

---

## Goal

Build a SaaS platform that helps SME lenders, NBFCs, distributors, trade finance firms, and B2B businesses continuously monitor borrowers, vendors, and counterparties for business risk events.

The platform should provide:

* Business verification
* Continuous monitoring
* Relationship intelligence
* Risk alerts
* Portfolio risk visibility

The objective is to reduce bad debt, fraud, and manual due diligence effort while providing early warning signals through dashboards, email, and WhatsApp notifications.

## MVP Product Objective

The first product milestone is an evidence-backed NCD risk workflow:

> Upload NCD portfolio -> verify issuer -> store evidence -> detect change -> create alert -> record analyst decision.

The MVP must establish this workflow before adding AI summaries, WhatsApp delivery, relationship graphs, advanced reports, or billing automation.

The canonical backend route contracts and database table names are defined in `docs/API_CONTRACTS.md`.

---

## Users

### Super Admin

Platform administrator responsible for configuration, subscriptions, API management, and customer onboarding.

### Risk Analyst

Monitors vendors, borrowers, and counterparties.

### Credit Manager

Reviews risk alerts and borrower portfolios.

### Relationship Manager

Manages customer relationships and receives risk notifications.

### Operations User

Handles onboarding and verification activities.

### Executive User

Views portfolio-level risk summaries and reports.

---

## Core Features

### Business Verification

Verify:

* GSTIN
* CIN
* PAN
* Udyam Registration

Display:

* Business name
* Legal status
* Registration details
* Business type
* Directors
* Compliance indicators

---

### Business Monitoring

Monitor:

* GST status changes
* GST filing irregularities
* Company status changes
* Director changes
* Charge creation/modification
* Strike-off notices
* Insolvency indicators
* Public risk events

Generate change events automatically.

---

### Relationship Intelligence

Discover:

* Related companies
* Common directors
* Group structures
* Parent-child relationships
* Beneficial ownership signals

Visualize business networks.

---

### Risk Alert Engine

Generate alerts for:

* Inactive GST
* Director resignation
* New charge registration
* Company status changes
* Compliance issues
* Rule-based risk classification changes

Delivery channels:

* Dashboard
* Email
* WhatsApp

---

### Portfolio Monitoring

Portfolio dashboard showing:

* Total monitored entities
* High-risk entities
* New alerts
* Risk trends
* Sector distribution

---

### Watchlists

Users can create:

* Borrower watchlists
* Vendor watchlists
* Distributor watchlists
* Strategic account watchlists

---

### AI Risk Summary

Generate concise explanations:

Example:

"ABC Trading has become higher risk due to inactive GST status and recent director resignation."

AI must summarize data only.

AI must never generate independent risk scores.

AI risk summaries are not part of the first product milestone. Add them only after evidence, monitoring events, deterministic rules, alerts, and analyst decisions are working end to end.

---

### Audit & Compliance

Track:

* User actions
* Alert acknowledgements
* Risk decisions
* Entity monitoring history

---

## Integrations

### Data Providers

* GST Verification APIs
* MCA APIs
* Udyam Verification APIs
* PAN Verification APIs

Provider abstraction layer required.

Providers must be replaceable.

---

### Communication

* Email Provider
* WhatsApp Business API (after core milestone)
* SMS Provider (future)

---

### CRM Integrations (Future)

* Salesforce
* HubSpot
* Zoho CRM

---

### Identity & Authentication

* Supabase Auth
* SSO (future)

---

### AI Providers

* OpenAI
* Anthropic Claude
* Azure OpenAI

Provider abstraction required.

---

## Pages

### Public

* Landing Page
* Pricing
* Features
* Contact
* Login
* Signup

---

### Customer Portal

#### Dashboard

Portfolio overview.

#### Entity Search

Search business by:

* GSTIN
* CIN
* PAN
* Business name

#### Entity Details

Display:

* Verification details
* Risk indicators
* Monitoring status
* Related entities

#### Alerts

List:

* Active alerts
* Historical alerts
* Acknowledged alerts

#### Watchlists

Manage monitored entities.

#### Relationship Intelligence

Graph view of business relationships.

#### Reports

Risk and monitoring reports.

#### Settings

Organization settings.

#### Subscription

Plan management.

---

### Admin Portal

#### Customer Management

Manage tenants.

#### Provider Management

Configure API providers.

#### Monitoring Jobs

View scheduled monitoring processes.

#### System Logs

Operational monitoring.

#### Billing

Subscription management.

---

## Database Entities

### profiles

* id
* display_name
* avatar_url

### organizations

* id
* name
* slug
* created_by

### organization_members

* organization_id
* user_id
* role
* status

### counterparties

* id
* organization_id
* counterparty_type
* legal_name
* trade_name
* status

### counterparty_identifiers

* id
* organization_id
* counterparty_id
* identifier_type
* masked_value
* normalized_hash

### ncd_exposures

* id
* organization_id
* issuer_counterparty_id
* isin
* outstanding_amount
* currency
* coupon
* maturity_date
* rating
* security_status

### provider_connections

* id
* organization_id
* provider_type
* provider_name
* status
* configuration_metadata
* secret_reference

### provider_requests

* id
* organization_id
* counterparty_id
* provider
* source
* request_status
* provider_transaction_id
* requested_at

### evidence_snapshots

* id
* organization_id
* counterparty_id
* provider_request_id
* source
* normalized_facts
* raw_payload_reference
* fetched_at

### monitoring_runs

* id
* organization_id
* status
* idempotency_key
* started_at
* completed_at

### monitoring_events

* organization_id
* counterparty_id
* ncd_exposure_id
* evidence_snapshot_id
* event_type
* before_facts
* after_facts
* detected_at

### alert_rules

* id
* organization_id
* rule_key
* version
* conditions
* severity
* enabled

### alerts

* id
* organization_id
* counterparty_id
* ncd_exposure_id
* monitoring_event_id
* evidence_snapshot_id
* alert_rule_id
* rule_version
* severity
* status
* owner_id

### alert_decisions

* id
* organization_id
* alert_id
* decision
* notes
* decided_by
* created_at

### portfolio_imports

* id
* organization_id
* filename
* status
* idempotency_key
* summary

### portfolio_import_rows

* id
* organization_id
* portfolio_import_id
* row_number
* source_data
* validation_errors
* status

### relationship_links

* organization_id
* source_counterparty_id
* target_counterparty_id
* relationship_type

### watchlists

* organization_id
* name

### watchlist_entities

* watchlist_id
* counterparty_id

### subscriptions

* organization_id
* plan
* status

### audit_logs

* organization_id
* user_id
* action
* timestamp

### ai_summaries (later)

* counterparty_id
* source_event_ids
* summary
* generated_at

## Core Backend APIs

### Tenant And Access

* `GET/POST /api/orgs`
* `GET/POST /api/members`
* `PATCH /api/members/{id}`

### Portfolio And Domain Records

* `POST /api/imports/portfolio`
* `GET /api/imports/{id}/errors`
* `GET/POST /api/counterparties`
* `GET/PATCH /api/counterparties/{id}`
* `GET/POST /api/ncd-exposures`
* `GET/PATCH /api/ncd-exposures/{id}`

### Verification And Monitoring

* `POST /api/verifications/gst`
* `POST /api/verifications/mca`
* `POST /api/verifications/pan`
* `POST /api/verifications/udyam`
* `GET /api/evidence-snapshots`
* `POST /api/monitoring/run`
* `GET /api/monitoring-events`

### Alert Workflow

* `GET /api/alerts`
* `PATCH /api/alerts/{id}/assign`
* `PATCH /api/alerts/{id}/acknowledge`
* `PATCH /api/alerts/{id}/escalate`
* `PATCH /api/alerts/{id}/close`
* `POST /api/alerts/{id}/decisions`

### Dashboard And Audit

* `GET /api/dashboard/portfolio-risk`
* `GET /api/dashboard/exposure`
* `GET /api/dashboard/high-risk-counterparties`
* `GET /api/audit-logs`

---

## Risk Scoring Rules

Version 1:

Rule-based only.

Examples:

* GST inactive = High Risk
* Director resigned = Medium Risk
* Company strike-off notice = Critical Risk
* Insolvency notice = Critical Risk

No ML-based scoring in MVP.

---

## Non-Functional Requirements

### Security

* Multi-tenant architecture
* Row Level Security
* Encrypted secrets
* Audit logging

### Performance

* Search response under 3 seconds
* Dashboard load under 5 seconds

### Reliability

* 99.5% uptime target
* Alert delivery retries

### Scalability

Support:

* 500 customers
* 500,000 monitored entities

without architecture redesign.

### Compliance

* GDPR ready
* Indian data protection compliance
* Audit trail retention

### Observability

* Application logs
* Error monitoring
* Monitoring metrics
* Scheduled job visibility

---

## Subscription Plans

### Starter

₹15,000/month

* 500 monitored entities

### Growth

₹25,000/month

* 2,000 monitored entities

### Enterprise

Custom pricing

* Unlimited monitoring
* CRM integrations
* Advanced reporting

---

## Acceptance Criteria

### Business Verification

* User can verify GSTIN
* User can verify CIN
* Verification results stored

### Monitoring

* Daily monitoring jobs run successfully
* New risk events detected
* Alerts generated automatically

### Relationship Intelligence (Later Milestone)

* Related entities displayed
* Director relationships displayed

### Alerting

* Email alerts delivered
* Alert acknowledgement supported

### WhatsApp (Later Milestone)

* Approved high/critical alert templates delivered
* Delivery status webhooks processed idempotently

### Security

* Multi-tenant isolation verified
* RLS policies implemented

### Deployment

* Local development works
* Production deployment works
* Environment variables documented

### Testing

* Unit tests
* API tests
* Monitoring workflow tests
* Alert workflow tests

### MVP Success Criteria

* 10 pilot customers onboarded
* 1,000 monitored entities
* Daily monitoring operational
* At least one customer identifies actionable risk through platform alerts

### First Milestone Acceptance

* Operations user uploads a portfolio CSV with row-level validation.
* Valid rows create tenant-scoped counterparties and NCD exposures.
* Issuer verification runs through a mock provider adapter.
* Normalized facts and append-only evidence snapshots are stored.
* A changed verification result creates an immutable monitoring event.
* A versioned deterministic rule creates an evidence-linked alert.
* An analyst can assign and acknowledge the alert.
* An analyst or credit manager can record a decision and close or escalate the alert.
* Dashboard metrics include the affected NCD exposure.
* Audit logs cover the complete workflow.
* RLS tests prove tenant isolation.
