alter type public.organization_role add value if not exists 'operations';
alter type public.organization_role add value if not exists 'risk_analyst';
alter type public.organization_role add value if not exists 'credit_manager';
alter type public.organization_role add value if not exists 'relationship_manager';
alter type public.organization_role add value if not exists 'executive';

create type public.counterparty_type as enum (
  'issuer',
  'borrower',
  'vendor',
  'guarantor',
  'group_company',
  'other'
);

create type public.counterparty_status as enum (
  'active',
  'inactive',
  'watch',
  'blocked'
);

create type public.identifier_type as enum (
  'gstin',
  'cin',
  'llpin',
  'pan',
  'udyam',
  'lei',
  'isin',
  'din',
  'other'
);

create type public.risk_severity as enum (
  'critical',
  'high',
  'medium',
  'low'
);

create type public.exposure_status as enum (
  'active',
  'matured',
  'redeemed',
  'defaulted',
  'written_off'
);

create type public.verification_source as enum (
  'gst',
  'mca',
  'pan',
  'udyam',
  'rating',
  'ibc',
  'ncd_disclosure',
  'manual'
);

create type public.provider_request_status as enum (
  'pending',
  'succeeded',
  'failed',
  'retryable'
);

create type public.monitoring_run_status as enum (
  'pending',
  'running',
  'completed',
  'failed'
);

create type public.alert_status as enum (
  'open',
  'assigned',
  'acknowledged',
  'investigating',
  'escalated',
  'closed'
);

create type public.alert_decision_value as enum (
  'continue',
  'watch',
  'freeze',
  'exit',
  'request_documents',
  'committee_escalation'
);

create type public.import_status as enum (
  'uploaded',
  'validating',
  'processing',
  'completed',
  'completed_with_errors',
  'failed'
);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.counterparties (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  type public.counterparty_type not null,
  status public.counterparty_status not null default 'active',
  legal_name text not null,
  display_name text,
  sector text,
  registered_state text,
  risk_severity public.risk_severity not null default 'low',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.counterparty_identifiers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  counterparty_id uuid not null references public.counterparties(id) on delete cascade,
  type public.identifier_type not null,
  normalized_value text not null,
  masked_value text,
  is_primary boolean not null default false,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique (organization_id, type, normalized_value)
);

create table public.ncd_exposures (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  issuer_counterparty_id uuid not null references public.counterparties(id),
  holder_counterparty_id uuid references public.counterparties(id),
  isin text not null,
  instrument_name text,
  outstanding_amount numeric(20, 2) not null check (outstanding_amount >= 0),
  currency text not null default 'INR',
  coupon_rate numeric(8, 4) check (coupon_rate is null or coupon_rate >= 0),
  issue_date date,
  maturity_date date not null,
  secured boolean not null default false,
  security_summary text,
  rating text,
  rating_outlook text,
  status public.exposure_status not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, isin)
);

create table public.provider_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  provider text not null,
  capabilities text[] not null default '{}',
  enabled boolean not null default true,
  configuration_metadata jsonb not null default '{}'::jsonb,
  secret_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, provider)
);

create table public.provider_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  counterparty_id uuid references public.counterparties(id) on delete cascade,
  provider_connection_id uuid references public.provider_connections(id) on delete set null,
  source public.verification_source not null,
  provider text not null,
  idempotency_key text not null,
  identifier_hash text,
  provider_transaction_id text,
  status public.provider_request_status not null default 'pending',
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  error_code text,
  error_message text,
  requested_by uuid references auth.users(id) on delete set null,
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, idempotency_key)
);

create table public.evidence_snapshots (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  counterparty_id uuid not null references public.counterparties(id) on delete cascade,
  provider_request_id uuid references public.provider_requests(id) on delete set null,
  source public.verification_source not null,
  provider text not null,
  provider_transaction_id text,
  normalized_facts jsonb not null,
  raw_payload_reference text,
  status text not null default 'complete',
  fetched_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table public.monitoring_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  idempotency_key text not null,
  status public.monitoring_run_status not null default 'pending',
  requested_by uuid references auth.users(id) on delete set null,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz not null default now(),
  unique (organization_id, idempotency_key)
);

create table public.monitoring_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  monitoring_run_id uuid references public.monitoring_runs(id) on delete set null,
  counterparty_id uuid not null references public.counterparties(id) on delete cascade,
  evidence_snapshot_id uuid not null references public.evidence_snapshots(id),
  previous_evidence_snapshot_id uuid references public.evidence_snapshots(id),
  source public.verification_source not null,
  event_type text not null,
  before_facts jsonb,
  after_facts jsonb not null,
  detector_version text not null,
  event_fingerprint text not null,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique (organization_id, event_fingerprint)
);

create table public.alert_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  code text not null,
  version integer not null check (version > 0),
  name text not null,
  description text,
  source public.verification_source,
  condition jsonb not null,
  severity public.risk_severity not null,
  enabled boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create unique index alert_rules_scope_code_version_idx
on public.alert_rules (
  coalesce(organization_id, '00000000-0000-0000-0000-000000000000'::uuid),
  code,
  version
);

create table public.alerts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  counterparty_id uuid not null references public.counterparties(id) on delete cascade,
  ncd_exposure_id uuid references public.ncd_exposures(id) on delete set null,
  monitoring_event_id uuid not null references public.monitoring_events(id),
  evidence_snapshot_id uuid not null references public.evidence_snapshots(id),
  alert_rule_id uuid not null references public.alert_rules(id),
  rule_version integer not null check (rule_version > 0),
  title text not null,
  description text,
  severity public.risk_severity not null,
  status public.alert_status not null default 'open',
  owner_id uuid references auth.users(id) on delete set null,
  due_at timestamptz,
  acknowledged_at timestamptz,
  escalated_at timestamptz,
  closed_at timestamptz,
  resolution text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (monitoring_event_id, alert_rule_id, rule_version)
);

create table public.alert_decisions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  alert_id uuid not null references public.alerts(id) on delete cascade,
  decision public.alert_decision_value not null,
  notes text not null,
  decided_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.portfolio_imports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  idempotency_key text not null,
  original_filename text not null,
  storage_reference text,
  status public.import_status not null default 'uploaded',
  total_rows integer not null default 0 check (total_rows >= 0),
  valid_rows integer not null default 0 check (valid_rows >= 0),
  invalid_rows integer not null default 0 check (invalid_rows >= 0),
  created_rows integer not null default 0 check (created_rows >= 0),
  updated_rows integer not null default 0 check (updated_rows >= 0),
  error_summary jsonb not null default '{}'::jsonb,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (organization_id, idempotency_key)
);

create table public.portfolio_import_rows (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  portfolio_import_id uuid not null references public.portfolio_imports(id) on delete cascade,
  row_number integer not null check (row_number > 0),
  source_data jsonb not null,
  normalized_data jsonb,
  validation_errors jsonb not null default '[]'::jsonb,
  counterparty_id uuid references public.counterparties(id) on delete set null,
  ncd_exposure_id uuid references public.ncd_exposures(id) on delete set null,
  processed_at timestamptz,
  unique (portfolio_import_id, row_number)
);

create table public.counterparty_relationships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  source_counterparty_id uuid not null references public.counterparties(id) on delete cascade,
  target_counterparty_id uuid not null references public.counterparties(id) on delete cascade,
  relationship_type text not null,
  confidence numeric(5, 4) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  evidence_snapshot_id uuid references public.evidence_snapshots(id) on delete set null,
  source text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check (source_counterparty_id <> target_counterparty_id)
);

create unique index counterparty_relationship_unique_idx
on public.counterparty_relationships (
  organization_id,
  source_counterparty_id,
  target_counterparty_id,
  relationship_type,
  source
);

create index counterparties_org_risk_idx
on public.counterparties (organization_id, risk_severity, legal_name);

create index counterparty_identifiers_counterparty_idx
on public.counterparty_identifiers (counterparty_id, type);

create index ncd_exposures_org_status_maturity_idx
on public.ncd_exposures (organization_id, status, maturity_date);

create index ncd_exposures_issuer_idx
on public.ncd_exposures (issuer_counterparty_id);

create index evidence_snapshots_counterparty_source_fetched_idx
on public.evidence_snapshots (counterparty_id, source, fetched_at desc);

create index monitoring_events_org_occurred_idx
on public.monitoring_events (organization_id, occurred_at desc);

create index alerts_org_status_severity_idx
on public.alerts (organization_id, status, severity, created_at desc);

create index alerts_owner_status_idx
on public.alerts (owner_id, status, due_at);

create index portfolio_import_rows_errors_idx
on public.portfolio_import_rows (portfolio_import_id)
where jsonb_array_length(validation_errors) > 0;

create trigger counterparties_set_updated_at
before update on public.counterparties
for each row execute function public.set_updated_at();

create trigger ncd_exposures_set_updated_at
before update on public.ncd_exposures
for each row execute function public.set_updated_at();

create trigger provider_connections_set_updated_at
before update on public.provider_connections
for each row execute function public.set_updated_at();

create trigger alerts_set_updated_at
before update on public.alerts
for each row execute function public.set_updated_at();

alter table public.counterparties enable row level security;
alter table public.counterparty_identifiers enable row level security;
alter table public.ncd_exposures enable row level security;
alter table public.provider_connections enable row level security;
alter table public.provider_requests enable row level security;
alter table public.evidence_snapshots enable row level security;
alter table public.monitoring_runs enable row level security;
alter table public.monitoring_events enable row level security;
alter table public.alert_rules enable row level security;
alter table public.alerts enable row level security;
alter table public.alert_decisions enable row level security;
alter table public.portfolio_imports enable row level security;
alter table public.portfolio_import_rows enable row level security;
alter table public.counterparty_relationships enable row level security;

create policy "members read counterparties"
on public.counterparties for select
using (public.is_organization_member(organization_id));

create policy "members create counterparties"
on public.counterparties for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members update counterparties"
on public.counterparties for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "members read counterparty identifiers"
on public.counterparty_identifiers for select
using (public.is_organization_member(organization_id));

create policy "members create counterparty identifiers"
on public.counterparty_identifiers for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members update counterparty identifiers"
on public.counterparty_identifiers for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "members read ncd exposures"
on public.ncd_exposures for select
using (public.is_organization_member(organization_id));

create policy "members create ncd exposures"
on public.ncd_exposures for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members update ncd exposures"
on public.ncd_exposures for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "members read provider connections"
on public.provider_connections for select
using (public.is_organization_member(organization_id));

create policy "members manage provider connections"
on public.provider_connections for all to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "members read provider requests"
on public.provider_requests for select
using (public.is_organization_member(organization_id));

create policy "members create provider requests"
on public.provider_requests for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members read evidence snapshots"
on public.evidence_snapshots for select
using (public.is_organization_member(organization_id));

create policy "members create evidence snapshots"
on public.evidence_snapshots for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members read monitoring runs"
on public.monitoring_runs for select
using (public.is_organization_member(organization_id));

create policy "members create monitoring runs"
on public.monitoring_runs for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members read monitoring events"
on public.monitoring_events for select
using (public.is_organization_member(organization_id));

create policy "members create monitoring events"
on public.monitoring_events for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members read alert rules"
on public.alert_rules for select
using (
  organization_id is null
  or public.is_organization_member(organization_id)
);

create policy "members manage organization alert rules"
on public.alert_rules for all to authenticated
using (
  organization_id is not null
  and public.is_organization_member(organization_id)
)
with check (
  organization_id is not null
  and public.is_organization_member(organization_id)
);

create policy "members read alerts"
on public.alerts for select
using (public.is_organization_member(organization_id));

create policy "members create alerts"
on public.alerts for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members update alerts"
on public.alerts for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "members read alert decisions"
on public.alert_decisions for select
using (public.is_organization_member(organization_id));

create policy "members create alert decisions"
on public.alert_decisions for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members read portfolio imports"
on public.portfolio_imports for select
using (public.is_organization_member(organization_id));

create policy "members create portfolio imports"
on public.portfolio_imports for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members update portfolio imports"
on public.portfolio_imports for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

create policy "members read portfolio import rows"
on public.portfolio_import_rows for select
using (public.is_organization_member(organization_id));

create policy "members create portfolio import rows"
on public.portfolio_import_rows for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members read counterparty relationships"
on public.counterparty_relationships for select
using (public.is_organization_member(organization_id));

create policy "members create counterparty relationships"
on public.counterparty_relationships for insert to authenticated
with check (public.is_organization_member(organization_id));

create policy "members update counterparty relationships"
on public.counterparty_relationships for update to authenticated
using (public.is_organization_member(organization_id))
with check (public.is_organization_member(organization_id));

insert into public.alert_rules (
  organization_id,
  code,
  version,
  name,
  description,
  source,
  condition,
  severity
)
values
  (
    null,
    'GST_CANCELLED',
    1,
    'GST registration cancelled',
    'Creates a critical alert when a monitored GST registration becomes cancelled.',
    'gst',
    '{"field":"registration_status","operator":"equals","value":"cancelled"}'::jsonb,
    'critical'
  ),
  (
    null,
    'GST_SUSPENDED_INACTIVE',
    1,
    'GST registration suspended or inactive',
    'Creates a high alert when a monitored GST registration becomes suspended or inactive.',
    'gst',
    '{"field":"registration_status","operator":"in","value":["suspended","inactive"]}'::jsonb,
    'high'
  ),
  (
    null,
    'RATING_DEFAULT_WITHDRAWAL',
    1,
    'Rating default or withdrawal',
    'Creates a critical alert for rating default or unexpected withdrawal.',
    'rating',
    '{"field":"rating_action","operator":"in","value":["default","withdrawn"]}'::jsonb,
    'critical'
  ),
  (
    null,
    'MATERIAL_RATING_DOWNGRADE',
    1,
    'Material rating downgrade',
    'Creates a high alert when the normalized rating notch deterioration meets policy.',
    'rating',
    '{"field":"notch_change","operator":"less_than_or_equal","value":-2}'::jsonb,
    'high'
  ),
  (
    null,
    'KEY_DIRECTOR_RESIGNATION',
    1,
    'Key director resignation',
    'Creates a medium alert when a key director or signatory ceases appointment.',
    'mca',
    '{"field":"director_change","operator":"equals","value":"key_director_resigned"}'::jsonb,
    'medium'
  ),
  (
    null,
    'NEW_MATERIAL_CHARGE',
    1,
    'New material MCA charge',
    'Creates a high alert when a new charge exceeds the configured materiality policy.',
    'mca',
    '{"field":"charge_change","operator":"equals","value":"new_material_charge"}'::jsonb,
    'high'
  ),
  (
    null,
    'CIRP_OR_LIQUIDATION',
    1,
    'CIRP or liquidation proceeding',
    'Creates a critical alert for a CIRP admission or liquidation event.',
    'ibc',
    '{"field":"proceeding_status","operator":"in","value":["cirp_admitted","liquidation"]}'::jsonb,
    'critical'
  );

comment on table public.evidence_snapshots is
'Append-only normalized evidence. Raw sensitive payloads must use restricted storage references.';

comment on table public.monitoring_events is
'Immutable normalized changes linked to evidence snapshots and detector versions.';

comment on table public.alerts is
'Deterministic risk alerts linked to event, evidence, rule, and rule version.';

-- Rollback notes:
-- Drop policies and tables in reverse dependency order, then drop the enum types.
-- Do not remove organization_role enum values during rollback; PostgreSQL does not
-- support safe enum-value removal without replacing the type.
