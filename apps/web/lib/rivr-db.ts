import { getServerConnectorConfig } from "@accelerator/config";
import {
  alertRows as demoAlertRows,
  counterparties as demoCounterparties,
  exposureTimeline as demoExposureTimeline,
  portfolioRows as demoPortfolioRows,
  relationshipLinks as demoRelationshipLinks,
  RiskSeverity
} from "./mock-data";

type JsonObject = Record<string, unknown>;

type DemoCounterpartyRow = {
  id: string;
  type: string;
  status: string;
  legal_name: string;
  display_name: string | null;
  sector: string | null;
  registered_state: string | null;
  risk_severity: RiskSeverity;
  metadata: JsonObject;
};

type DemoExposureRow = {
  id: string;
  issuer_counterparty_id: string;
  holder_counterparty_id: string | null;
  isin: string;
  instrument_name: string | null;
  outstanding_amount: number;
  maturity_date: string;
  secured: boolean;
  security_summary: string | null;
  rating: string | null;
  rating_outlook: string | null;
  status: string;
  metadata: JsonObject;
};

type DemoAlertRow = {
  id: string;
  title: string;
  description: string | null;
  severity: RiskSeverity;
  status: string;
  owner_id: string | null;
  due_at: string | null;
  acknowledged_at: string | null;
  escalated_at: string | null;
  closed_at: string | null;
  resolution: string | null;
  created_at: string;
  updated_at: string;
  organization_id: string;
  counterparty_id: string;
  ncd_exposure_id: string | null;
  monitoring_event_id: string;
  evidence_snapshot_id: string;
  alert_rule_id: string;
  rule_version: number;
  metadata?: JsonObject;
};

type DemoEvidenceRow = {
  id: string;
  counterparty_id: string;
  source: string;
  provider: string;
  fetched_at: string;
  normalized_facts: JsonObject;
  raw_payload_reference: string | null;
  provider_transaction_id: string | null;
};

type DemoRelationshipRow = {
  id: string;
  source_counterparty_id: string;
  target_counterparty_id: string;
  relationship_type: string;
  confidence: number | null;
  source: string;
  metadata: JsonObject;
};

type SupabaseTableRow = Record<string, unknown>;

const DEMO_ORG_SLUG = "artha-debt-fund";
const DEMO_ADMIN_EMAIL = "demo-admin@rivr.local";
const DEMO_ADMIN_NAME = "B. Kumar";
const DEMO_USERS = [
  { email: "demo-admin@rivr.local", fullName: "B. Kumar" },
  { email: "ananya.rao@rivr.local", fullName: "Ananya Rao" },
  { email: "rohit.sen@rivr.local", fullName: "Rohit Sen" },
  { email: "meera.shah@rivr.local", fullName: "Meera Shah" },
  { email: "vikram.das@rivr.local", fullName: "Vikram Das" }
] as const;

function trimQuoted(value: string | undefined) {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed.replace(/^"(.*)"$/, "$1");
}

function parseCurrencyAmount(value: string) {
  const normalized = value.replace(/[^0-9.-]/g, "");
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateToIso(value: string) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? new Date().toISOString() : parsed.toISOString();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getDemoId(row: JsonObject, fallback: string) {
  const demoId = row.demo_id;
  return typeof demoId === "string" && demoId ? demoId : fallback;
}

class SupabaseRestClient {
  private readonly baseUrl: string;
  private readonly serviceRoleKey: string;
  private readonly headers: HeadersInit;

  constructor(baseUrl: string, serviceRoleKey: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.serviceRoleKey = serviceRoleKey;
    this.headers = {
      Accept: "application/json",
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json"
    };
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    isAuthAdmin = false
  ): Promise<T> {
    const url = `${this.baseUrl}${isAuthAdmin ? "/auth/v1" : "/rest/v1"}${path}`;
    const response = await fetch(url, {
      ...init,
      headers: {
        ...this.headers,
        ...(init.headers ?? {})
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase request failed (${response.status}): ${text}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  async select<T extends SupabaseTableRow>(
    table: string,
    select = "*",
    query = ""
  ) {
    const encodedQuery = query ? `&${query}` : "";
    return this.request<T[]>(`/${table}?select=${encodeURIComponent(select)}${encodedQuery}`);
  }

  async insert<T extends SupabaseTableRow>(
    table: string,
    values: JsonObject | JsonObject[]
  ) {
    return this.request<T[]>(`/${table}`, {
      body: JSON.stringify(values),
      method: "POST",
      headers: {
        Prefer: "return=representation"
      }
    });
  }

  async update<T extends SupabaseTableRow>(
    table: string,
    values: JsonObject,
    query: string
  ) {
    return this.request<T[]>(`/${table}?${query}`, {
      body: JSON.stringify(values),
      method: "PATCH",
      headers: {
        Prefer: "return=representation"
      }
    });
  }

  async delete<T extends SupabaseTableRow>(table: string, query: string) {
    return this.request<T[]>(`/${table}?${query}`, {
      method: "DELETE",
      headers: {
        Prefer: "return=representation"
      }
    });
  }

  async listAuthUsers() {
    const response = await this.request<{
      users: Array<{ id: string; email?: string; user_metadata?: JsonObject }>;
    }>(`/admin/users?per_page=200`, {}, true);
    return response.users;
  }

  async createAuthUser(input: {
    email: string;
    fullName: string;
  }) {
    try {
      return await this.request<{
        id: string;
        email?: string;
        user_metadata?: JsonObject;
      }>(
        "/admin/users",
        {
          body: JSON.stringify({
            email: input.email,
            email_confirm: true,
            password: `demo-${slugify(input.email)}-123!`,
            user_metadata: { full_name: input.fullName }
          }),
          method: "POST"
        },
        true
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("email_exists")) {
        throw error;
      }

      const users = await this.listAuthUsers();
      const existing = users.find((user) => user.email === input.email);
      if (!existing) {
        throw error;
      }

      return existing;
    }
  }
}

function createClient() {
  const config = getServerConnectorConfig(process.env);
  const baseUrl = trimQuoted(config.database.url);
  const serviceRoleKey = trimQuoted(config.database.serviceRoleKey);

  if (!baseUrl || !serviceRoleKey) {
    throw new Error("Supabase server credentials are not configured.");
  }

  return new SupabaseRestClient(baseUrl, serviceRoleKey);
}

async function findOrCreateDemoAdmin(client: SupabaseRestClient) {
  const existingUsers = await client.listAuthUsers();
  const existingUser = existingUsers.find((user) => user.email === DEMO_ADMIN_EMAIL);
  if (existingUser) {
    return existingUser;
  }

  return client.createAuthUser({
    email: DEMO_ADMIN_EMAIL,
    fullName: DEMO_ADMIN_NAME
  });
}

async function ensureDemoUsers(client: SupabaseRestClient) {
  const users = await client.listAuthUsers();
  const userByEmail = new Map(users.map((user) => [user.email ?? "", user]));
  const createdUsers = [];

  for (const user of DEMO_USERS) {
    const existing = userByEmail.get(user.email);
    if (existing) {
      createdUsers.push(existing);
      continue;
    }

    const created = await client.createAuthUser(user);
    createdUsers.push(created);
  }

  return createdUsers;
}

async function findOrCreateOrganization(client: SupabaseRestClient, creatorId: string) {
  const organizations = await client.select<{ id: string; name: string; slug: string }>(
    "organizations",
    "id,name,slug",
    `slug=eq.${encodeURIComponent(DEMO_ORG_SLUG)}`
  );

  if (organizations[0]) {
    return organizations[0];
  }

  const [organization] = await client.insert<{ id: string; name: string; slug: string }>(
    "organizations",
    {
      created_by: creatorId,
      name: "Artha Debt Fund",
      slug: DEMO_ORG_SLUG
    }
  );

  await client.insert("organization_members", {
    organization_id: organization.id,
    role: "owner",
    user_id: creatorId
  });

  return organization;
}

async function seedCounterparties(client: SupabaseRestClient, organizationId: string) {
  const existing = await client.select<DemoCounterpartyRow>(
    "counterparties",
    "id,legal_name,display_name,sector,registered_state,risk_severity,metadata",
    `organization_id=eq.${organizationId}`
  );

  if (existing.length > 0) {
    return existing;
  }

  const ownerNames = DEMO_USERS.map((user) => user.fullName);

  const seeded = await client.insert<DemoCounterpartyRow>(
    "counterparties",
    demoCounterparties.map((counterparty, index) => {
      const orgCounterparty = {
        organization_id: organizationId,
        type: counterparty.type.toLowerCase(),
        legal_name: counterparty.name,
        display_name: counterparty.name,
        sector: counterparty.sector,
        registered_state: index === 0 ? "Maharashtra" : "Gujarat",
        risk_severity: counterparty.risk,
        metadata: {
          cin: counterparty.cin,
          demo_id: counterparty.id,
          exposure: counterparty.exposure,
          owner_name: ownerNames[index] ?? ownerNames[0],
          rating: counterparty.rating,
          verified: counterparty.verified
        }
      };

      return orgCounterparty;
    })
  );

  const counterpartyByDemoId = new Map<string, DemoCounterpartyRow>(
    seeded.map((row) => [getDemoId(row.metadata, row.id), row])
  );

  await client.insert(
    "counterparty_identifiers",
    demoCounterparties.flatMap((counterparty) => {
      const match = counterpartyByDemoId.get(counterparty.id);
      if (!match) {
        return [];
      }

      return [
        {
          counterparty_id: match.id,
          is_primary: true,
          masked_value: counterparty.cin,
          normalized_value: counterparty.cin,
          organization_id: organizationId,
          type: "cin"
        },
        {
          counterparty_id: match.id,
          masked_value: counterparty.gstin,
          normalized_value: counterparty.gstin,
          organization_id: organizationId,
          type: "gstin"
        }
      ];
    })
  );

  return seeded;
}

async function seedExposures(client: SupabaseRestClient, organizationId: string, counterparties: DemoCounterpartyRow[]) {
  const existing = await client.select<DemoExposureRow>(
    "ncd_exposures",
    "id,issuer_counterparty_id,holder_counterparty_id,isin,instrument_name,outstanding_amount,maturity_date,secured,security_summary,rating,rating_outlook,status,metadata",
    `organization_id=eq.${organizationId}`
  );

  if (existing.length > 0) {
    return existing;
  }

  const counterpartyByDemoId = new Map(
    counterparties.map((counterparty) => [getDemoId(counterparty.metadata, counterparty.id), counterparty])
  );

  return client.insert<DemoExposureRow>(
    "ncd_exposures",
    demoPortfolioRows.flatMap((row) => {
      const issuer = counterpartyByDemoId.get(row.entityId);
      if (!issuer) {
        return [];
      }

      return [
        {
          holder_counterparty_id: null,
          instrument_name: `${row.issuer} NCD`,
          issuer_counterparty_id: issuer.id,
          isin: row.isin,
          metadata: {
            demo_id: row.id,
            risk: row.risk,
            sector: row.sector
          },
          maturity_date: parseDateToIso(row.maturity).slice(0, 10),
          outstanding_amount: parseCurrencyAmount(row.outstanding),
          organization_id: organizationId,
          rating: row.rating,
          rating_outlook: row.rating.split("/").pop()?.trim() ?? null,
          secured: row.security.toLowerCase() === "secured",
          security_summary: row.security,
          status: "active"
        }
      ];
    })
  );
}

async function seedEvidenceAndAlerts(
  client: SupabaseRestClient,
  organizationId: string,
  counterparties: DemoCounterpartyRow[],
  exposures: DemoExposureRow[],
  users: Array<{ id: string; email?: string; user_metadata?: JsonObject }>
) {
  const existingAlerts = await client.select<DemoAlertRow>(
    "alerts",
    "id,title,status,organization_id,alert_rule_id,rule_version",
    `organization_id=eq.${organizationId}`
  );
  if (existingAlerts.length > 0) {
    return;
  }

  const defaultRule = await client.insert<{ id: string }>("alert_rules", {
    code: "rating-action",
    condition: {
      source: "rating",
      severity: "critical"
    },
    description: "Critical rating or insolvency signals trigger same-day review.",
    enabled: true,
    name: "Rating action watch",
    organization_id: organizationId,
    severity: "critical",
    source: "rating",
    version: 1
  });

  const counterpartyByDemoId = new Map(
    counterparties.map((counterparty) => [getDemoId(counterparty.metadata, counterparty.id), counterparty])
  );
  const exposureByDemoId = new Map(
    exposures.map((exposure) => [getDemoId(exposure.metadata, exposure.id), exposure])
  );

  const userByName = new Map(
    users.map((user) => [String(user.user_metadata?.full_name ?? user.email ?? ""), user])
  );

  const evidenceSnapshots: DemoEvidenceRow[] = [];
  for (const row of demoCounterparties) {
    const counterparty = counterpartyByDemoId.get(row.id);
    if (!counterparty) continue;

    evidenceSnapshots.push({
      counterparty_id: counterparty.id,
      fetched_at: new Date().toISOString(),
      id: crypto.randomUUID(),
      normalized_facts: {
        cin: row.cin,
        gstin: row.gstin,
        legal_name: row.name,
        owner_name: counterparty.metadata.owner_name,
        verified: row.verified
      },
      provider: "mock",
      provider_transaction_id: null,
      raw_payload_reference: null,
      source: "mca"
    });
  }

  const createdSnapshots = await client.insert<DemoEvidenceRow>(
    "evidence_snapshots",
    evidenceSnapshots.map((snapshot) => ({
      counterparty_id: snapshot.counterparty_id,
      fetched_at: snapshot.fetched_at,
      normalized_facts: snapshot.normalized_facts,
      organization_id: organizationId,
      provider: snapshot.provider,
      provider_transaction_id: snapshot.provider_transaction_id,
      raw_payload_reference: snapshot.raw_payload_reference,
      source: snapshot.source,
      status: "complete"
    }))
  );

  const snapshotByCounterparty = new Map(
    createdSnapshots.map((snapshot) => [snapshot.counterparty_id, snapshot])
  );

  const monitoringEvents = demoAlertRows.flatMap((alert) => {
    const counterparty = counterpartyByDemoId.get(alert.entityId);
    const snapshot = counterparty ? snapshotByCounterparty.get(counterparty.id) : undefined;
    if (!counterparty || !snapshot) {
      return [];
    }

    const source =
      alert.source.toLowerCase().includes("rating")
        ? "rating"
        : alert.source.toLowerCase().includes("gst")
          ? "gst"
          : "mca";

    return [
      {
        after_facts: {
          alert: alert.trigger,
          exposure: alert.exposure,
          source: alert.source
        },
        before_facts: null,
        counterparty_id: counterparty.id,
        detector_version: "1.0",
        event_fingerprint: `seed-${alert.id}`,
        event_type: "detected",
        evidence_snapshot_id: snapshot.id,
        monitoring_run_id: null,
        organization_id: organizationId,
        previous_evidence_snapshot_id: null,
        source
      }
    ];
  });

  const createdEvents = await client.insert<{ id: string }>(
    "monitoring_events",
    monitoringEvents
  );

  const eventByFingerprint = new Map(
    createdEvents.map((event, index) => [monitoringEvents[index].event_fingerprint, event])
  );

  const alertsToSeed = demoAlertRows.flatMap((alert) => {
    const counterparty = counterpartyByDemoId.get(alert.entityId);
    const exposure = exposureByDemoId.get(alert.id.replace("ALT-", "exp-"));
    const event = eventByFingerprint.get(`seed-${alert.id}`);
    const snapshot = counterparty ? snapshotByCounterparty.get(counterparty.id) : undefined;
    if (!counterparty || !event || !snapshot) {
      return [];
    }

    return [
      {
        acknowledged_at: null,
        alert_rule_id: defaultRule[0].id,
        closed_at: null,
        counterparty_id: counterparty.id,
        created_at: new Date().toISOString(),
        description: `${alert.trigger}. ${alert.source} evidence triggered rule version 1.0.`,
        due_at: null,
        escalated_at: alert.status.toLowerCase() === "escalated" ? new Date().toISOString() : null,
        evidence_snapshot_id: snapshot.id,
        monitoring_event_id: event.id,
        ncd_exposure_id: exposure?.id ?? null,
        organization_id: organizationId,
        owner_id: userByName.get(alert.owner)?.id ?? users[0]?.id ?? null,
        resolution: null,
        rule_version: 1,
        severity: alert.severity,
        status: alert.status.toLowerCase(),
        title: alert.trigger,
        updated_at: new Date().toISOString()
      }
    ];
  });

  const alertsByDemoId = new Map<string, JsonObject>();
  demoAlertRows.forEach((alert, index) => {
    const seeded = alertsToSeed[index];
    if (seeded) {
      alertsByDemoId.set(alert.id, seeded);
    }
  });

  await client.insert("alerts", alertsToSeed);

  await client.insert(
    "alert_decisions",
    demoAlertRows
      .filter((alert) => alert.status !== "Open")
      .map((alert) => {
        const counterparty = counterpartyByDemoId.get(alert.entityId);
        const alertEvent = alertsByDemoId.get(alert.id);
        if (!counterparty || !alertEvent) {
          return null;
        }

        return {
          alert_id: alertEvent.id,
          decided_by: null,
          decision: alert.status === "Escalated" ? "committee_escalation" : "watch",
          notes: `${alert.owner} seeded decision path for ${alert.trigger}.`,
          organization_id: organizationId
        };
      })
      .filter(Boolean) as JsonObject[]
  );

  const relationships = demoRelationshipLinks.flatMap((relationship) => {
    const source = [...counterpartyByDemoId.values()].find((item) => item.legal_name === relationship.source);
    const target = [...counterpartyByDemoId.values()].find((item) => item.legal_name === relationship.target);
    if (!source || !target) {
      return [];
    }

    return [
      {
        confidence: relationship.confidence.toLowerCase() === "high" ? 0.95 : 0.68,
        metadata: {
          demo_source: relationship.source,
          demo_exposure: relationship.exposure,
          demo_target: relationship.target
        },
        organization_id: organizationId,
        relationship_type: relationship.type,
        source: "mca",
        source_counterparty_id: source.id,
        target_counterparty_id: target.id
      }
    ];
  });

  await client.insert("counterparty_relationships", relationships);
}

let seededWorkspace: Promise<string> | null = null;

async function ensureDemoWorkspace() {
  const client = createClient();

  if (!seededWorkspace) {
    seededWorkspace = (async () => {
      const adminUser = await findOrCreateDemoAdmin(client);
  const organization = await findOrCreateOrganization(client, adminUser.id);
      const users = await ensureDemoUsers(client);
      const counterparties = await seedCounterparties(client, organization.id);
      const exposures = await seedExposures(client, organization.id, counterparties);
      await seedEvidenceAndAlerts(client, organization.id, counterparties, exposures, users);
      return organization.id;
    })();
  }

  return seededWorkspace;
}

async function getOrganizationId() {
  return ensureDemoWorkspace();
}

async function fetchCounterparties(organizationId: string) {
  return createClient().select<DemoCounterpartyRow>(
    "counterparties",
    "id,legal_name,display_name,sector,registered_state,risk_severity,metadata,status,type",
    `organization_id=eq.${organizationId}&order=created_at.desc`
  );
}

async function fetchExposures(organizationId: string) {
  return createClient().select<DemoExposureRow>(
    "ncd_exposures",
    "id,issuer_counterparty_id,holder_counterparty_id,isin,instrument_name,outstanding_amount,maturity_date,secured,security_summary,rating,rating_outlook,status,metadata",
    `organization_id=eq.${organizationId}&order=created_at.desc`
  );
}

async function fetchAlerts(organizationId: string) {
  return createClient().select<DemoAlertRow>(
    "alerts",
    "id,organization_id,counterparty_id,ncd_exposure_id,monitoring_event_id,evidence_snapshot_id,alert_rule_id,rule_version,title,description,severity,status,owner_id,due_at,acknowledged_at,escalated_at,closed_at,resolution,created_at,updated_at",
    `organization_id=eq.${organizationId}&order=created_at.desc`
  );
}

async function fetchRelationships(organizationId: string) {
  return createClient().select<DemoRelationshipRow>(
    "counterparty_relationships",
    "id,source_counterparty_id,target_counterparty_id,relationship_type,confidence,source,metadata",
    `organization_id=eq.${organizationId}&order=created_at.desc`
  );
}

async function fetchSnapshots(organizationId: string) {
  return createClient().select<DemoEvidenceRow>(
    "evidence_snapshots",
    "id,counterparty_id,source,provider,fetched_at,normalized_facts,raw_payload_reference,provider_transaction_id",
    `organization_id=eq.${organizationId}&order=fetched_at.desc`
  );
}

function formatCurrency(amount: number) {
  return `₹${amount.toFixed(1)} Cr`;
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

function buildCounterpartyLookup(counterparties: DemoCounterpartyRow[]) {
  return new Map(counterparties.map((counterparty) => [getDemoId(counterparty.metadata, counterparty.id), counterparty]));
}

function buildExposureLookup(exposures: DemoExposureRow[]) {
  return new Map(exposures.map((exposure) => [getDemoId(exposure.metadata, exposure.id), exposure]));
}

export type WorkspaceCounterparty = {
  cin: string;
  exposure: string;
  gstin: string;
  id: string;
  name: string;
  rating: string;
  risk: RiskSeverity;
  sector: string;
  type: string;
  verified: string;
};

export type WorkspaceExposure = {
  entityId: string;
  evidenceAge: string;
  id: string;
  isin: string;
  issuer: string;
  maturity: string;
  outstanding: string;
  rating: string;
  risk: RiskSeverity;
  sector: string;
  security: string;
};

export type WorkspaceAlert = {
  age: string;
  counterparty: string;
  entityId: string;
  exposure: string;
  id: string;
  isin: string;
  owner: string;
  severity: RiskSeverity;
  source: string;
  status: string;
  trigger: string;
};

export type WorkspaceRelationship = {
  confidence: string;
  exposure: string;
  source: string;
  target: string;
  type: string;
};

export async function getWorkspaceData() {
  const organizationId = await getOrganizationId();
  const [counterpartyRows, exposureRows, alertRows, relationshipRows, snapshots, users] = await Promise.all([
    fetchCounterparties(organizationId),
    fetchExposures(organizationId),
    fetchAlerts(organizationId),
    fetchRelationships(organizationId),
    fetchSnapshots(organizationId),
    createClient().listAuthUsers()
  ]);

  const counterparties = buildCounterpartyLookup(counterpartyRows);
  const exposures = buildExposureLookup(exposureRows);
  const latestSnapshotByCounterparty = new Map<string, DemoEvidenceRow>();
  for (const snapshot of snapshots) {
    if (!latestSnapshotByCounterparty.has(snapshot.counterparty_id)) {
      latestSnapshotByCounterparty.set(snapshot.counterparty_id, snapshot);
    }
  }

  const counterpartyView: WorkspaceCounterparty[] = [...counterparties.values()].map((counterparty) => ({
    cin: String(counterparty.metadata.cin ?? ""),
    exposure: String(counterparty.metadata.exposure ?? "₹0.0 Cr"),
    gstin: String(counterparty.metadata.gstin ?? ""),
    id: String(counterparty.metadata.demo_id ?? counterparty.id),
    name: counterparty.legal_name,
    rating: String(counterparty.metadata.rating ?? ""),
    risk: counterparty.risk_severity,
    sector: counterparty.sector ?? "",
    type: counterparty.type,
    verified: String(counterparty.metadata.verified ?? "")
  }));

  const exposureView: WorkspaceExposure[] = [...exposureRows].map((exposure) => {
    const issuer = [...counterparties.values()].find((item) => item.id === exposure.issuer_counterparty_id);
    const demoId = String(exposure.metadata.demo_id ?? exposure.id);
    return {
      entityId: issuer ? String(issuer.metadata.demo_id ?? issuer.id) : demoId,
      evidenceAge: latestSnapshotByCounterparty.has(exposure.issuer_counterparty_id)
        ? "Today"
        : "Stale",
      id: demoId,
      isin: exposure.isin,
      issuer: issuer?.legal_name ?? exposure.instrument_name ?? exposure.isin,
      maturity: formatDate(exposure.maturity_date),
      outstanding: formatCurrency(Number(exposure.outstanding_amount)),
      rating: exposure.rating ?? "Unknown",
      risk: (exposure.metadata.risk as RiskSeverity) ?? "low",
      sector: String(exposure.metadata.sector ?? issuer?.sector ?? ""),
      security: exposure.secured ? "Secured" : "Unsecured"
    };
  });

  const alertView: WorkspaceAlert[] = [...alertRows].map((alert) => {
    const counterparty = [...counterparties.values()].find((item) => item.id === alert.counterparty_id);
    const exposure = [...exposures.values()].find((item) => item.id === alert.ncd_exposure_id);
    const owner = users.find((user) => user.id === alert.owner_id);
    const demoAlert = demoAlertRows.find((item) => item.trigger === alert.title);
    return {
      age: formatAlertAge(alert.created_at),
      counterparty: counterparty?.legal_name ?? alert.title,
      entityId: String(counterparty?.metadata.demo_id ?? counterparty?.id ?? alert.counterparty_id),
      exposure: exposure ? formatCurrency(Number(exposure.outstanding_amount)) : "₹0.0 Cr",
      id: String(demoAlert?.id ?? alert.id),
      isin: exposure?.isin ?? "",
      owner: String(owner?.user_metadata?.full_name ?? owner?.email ?? "Unassigned"),
      severity: alert.severity,
      source: String(demoAlert?.source ?? alert.title),
      status: formatStatusLabel(alert.status),
      trigger: alert.title
    };
  });

  const relationshipView: WorkspaceRelationship[] = [...relationshipRows].map((relationship) => {
    const source = [...counterparties.values()].find((item) => item.id === relationship.source_counterparty_id);
    const target = [...counterparties.values()].find((item) => item.id === relationship.target_counterparty_id);
    return {
      confidence: relationship.confidence && relationship.confidence >= 0.9 ? "High" : "Medium",
      exposure: String(relationship.metadata.demo_exposure ?? "₹0.0 Cr"),
      source: source?.legal_name ?? "",
      target: target?.legal_name ?? "",
      type: relationship.relationship_type
    };
  });

  return {
    alerts: alertView,
    counterparties: counterpartyView,
    exposures: exposureView,
    organizationId,
    relationships: relationshipView
  };
}

export async function getWorkspaceTables() {
  const organizationId = await getOrganizationId();
  const [counterpartyRows, exposureRows, alertRows, relationshipRows, snapshots, users] = await Promise.all([
    fetchCounterparties(organizationId),
    fetchExposures(organizationId),
    fetchAlerts(organizationId),
    fetchRelationships(organizationId),
    fetchSnapshots(organizationId),
    createClient().listAuthUsers()
  ]);

  return {
    alertRows,
    counterparties: counterpartyRows,
    exposures: exposureRows,
    organizationId,
    relationships: relationshipRows,
    snapshots,
    users
  };
}

function formatAlertAge(createdAt: string) {
  const ageMs = Date.now() - new Date(createdAt).getTime();
  const hours = Math.max(1, Math.round(ageMs / (1000 * 60 * 60)));
  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.max(1, Math.round(hours / 24));
  return `${days}d`;
}

function formatStatusLabel(status: string) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function getEntityByDemoId(demoId: string) {
  const data = await getWorkspaceData();
  return data.counterparties.find((counterparty) => counterparty.id === demoId);
}

export async function getExposureByDemoId(demoId: string) {
  const data = await getWorkspaceData();
  return data.exposures.find((exposure) => exposure.id === demoId);
}

export async function getAlertByDemoId(demoId: string) {
  const data = await getWorkspaceData();
  return data.alerts.find((alert) => alert.id === demoId);
}

export async function getEvidenceSnapshotsForCounterparty(demoId: string) {
  const organizationId = await getOrganizationId();
  const data = await getWorkspaceData();
  const counterparty = data.counterparties.find((item) => item.id === demoId);
  if (!counterparty) {
    return [];
  }

  return createClient().select<DemoEvidenceRow>(
    "evidence_snapshots",
    "id,counterparty_id,source,provider,fetched_at,normalized_facts,raw_payload_reference,provider_transaction_id",
    `organization_id=eq.${organizationId}&counterparty_id=eq.${counterparty.id}&order=fetched_at.desc`
  );
}

export function getDemoAlerts() {
  return demoAlertRows;
}

export function getDemoPortfolioRows() {
  return demoPortfolioRows;
}

export function getDemoRelationships() {
  return demoRelationshipLinks;
}

export function getDemoExposureTimeline() {
  return demoExposureTimeline;
}

export async function createCounterpartyRecord(input: {
  cin: string;
  gstin: string;
  legalName: string;
  riskSeverity: RiskSeverity;
  sector: string;
  type: string;
}) {
  const { organizationId } = await getWorkspaceTables();
  const client = createClient();
  const [created] = await client.insert<{ id: string; metadata: JsonObject; legal_name: string }>(
    "counterparties",
    {
      display_name: input.legalName,
      legal_name: input.legalName,
      metadata: {
        cin: input.cin,
        demo_id: slugify(input.legalName),
        exposure: "₹0.0 Cr",
        gstin: input.gstin,
        rating: "Unrated",
        verified: "Manual"
      },
      organization_id: organizationId,
      registered_state: "Unknown",
      risk_severity: input.riskSeverity,
      sector: input.sector,
      status: "active",
      type: input.type
    }
  );

  await client.insert("counterparty_identifiers", [
    {
      counterparty_id: created.id,
      is_primary: true,
      masked_value: input.cin,
      normalized_value: input.cin,
      organization_id: organizationId,
      type: "cin"
    },
    {
      counterparty_id: created.id,
      masked_value: input.gstin,
      normalized_value: input.gstin,
      organization_id: organizationId,
      type: "gstin"
    }
  ]);

  return created;
}

export async function toggleCounterpartyWatchlist(demoId: string) {
  const client = createClient();
  const { counterparties } = await getWorkspaceTables();
  const counterparty = counterparties.find(
    (item) => String(item.metadata.demo_id ?? item.id) === demoId
  );
  if (!counterparty) {
    throw new Error(`Counterparty ${demoId} not found.`);
  }

  await client.update("counterparties", {
    metadata: {
      ...counterparty.metadata,
      watchlisted: true
    }
  }, `id=eq.${counterparty.id}`);
}

export async function createVerificationSnapshot(input: {
  counterpartyDemoId: string;
  source: "gst" | "mca" | "pan" | "udyam" | "rating" | "ibc" | "manual";
}) {
  const client = createClient();
  const { counterparties, exposures, organizationId } = await getWorkspaceTables();
  const counterparty = counterparties.find(
    (item) => String(item.metadata.demo_id ?? item.id) === input.counterpartyDemoId
  );
  if (!counterparty) {
    throw new Error(`Counterparty ${input.counterpartyDemoId} not found.`);
  }

  const [snapshot] = await client.insert<{
    id: string;
    counterparty_id: string;
    fetched_at: string;
  }>("evidence_snapshots", {
    counterparty_id: counterparty.id,
    fetched_at: new Date().toISOString(),
    normalized_facts: {
      cin: counterparty.metadata.cin,
      gstin: counterparty.metadata.gstin,
      legal_name: counterparty.legal_name,
      risk: counterparty.risk_severity,
      verified: counterparty.metadata.verified
    },
    organization_id: organizationId,
    provider: "mock",
    source: input.source,
    status: "complete"
  });

  const lastEventFingerprint = `${input.source}-${counterparty.id}-${snapshot.fetched_at}`;
  const [monitoringEvent] = await client.insert<{ id: string }>("monitoring_events", {
    after_facts: {
      legal_name: counterparty.legal_name,
      risk: counterparty.risk_severity,
      source: input.source
    },
    before_facts: null,
    counterparty_id: counterparty.id,
    detector_version: "1.0",
    event_fingerprint: lastEventFingerprint,
    event_type: "verification",
    evidence_snapshot_id: snapshot.id,
    monitoring_run_id: null,
    organization_id: organizationId,
    previous_evidence_snapshot_id: null,
    source: input.source
  });

  const linkedExposure = exposures.find((item) => item.issuer_counterparty_id === counterparty.id);
  if (linkedExposure && counterparty.risk_severity !== "low") {
    const [rule] = await client.select<{ id: string }>(
      "alert_rules",
      "id",
      `organization_id=eq.${organizationId}&code=eq.rating-action&version=eq.1`
    );

    const existing = await client.select<{ id: string }>(
      "alerts",
      "id",
      `monitoring_event_id=eq.${monitoringEvent.id}&alert_rule_id=eq.${rule.id}&rule_version=eq.1`
    );
    if (existing.length === 0) {
      const owner = (await getWorkspaceTables()).users.find(
        (user) => String(user.user_metadata?.full_name ?? user.email ?? "") === "Ananya Rao"
      );
      await client.insert("alerts", {
        alert_rule_id: rule.id,
        counterparty_id: counterparty.id,
        description: `Verification snapshot for ${counterparty.legal_name} generated by ${input.source}.`,
        evidence_snapshot_id: snapshot.id,
        monitoring_event_id: monitoringEvent.id,
        ncd_exposure_id: null,
        organization_id: organizationId,
        owner_id: owner?.id ?? null,
        rule_version: 1,
        severity: counterparty.risk_severity,
        status: "open",
        title:
          input.source === "rating"
            ? "Rating moved to watch"
            : `${input.source.toUpperCase()} verification updated`
      });
    }
  }

  return snapshot;
}

export async function assignAlertByDemoId(demoId: string) {
  const client = createClient();
  const { alertRows, users } = await getWorkspaceTables();
  const alert = alertRows.find((row) => {
    const demoAlert = demoAlertRows.find((item) => item.trigger === row.title);
    return demoAlert?.id === demoId;
  });
  if (!alert) {
    throw new Error(`Alert ${demoId} not found.`);
  }

  const assignee = users.find(
    (user) => String(user.user_metadata?.full_name ?? user.email ?? "") === "Ananya Rao"
  );
  await client.update(
    "alerts",
    {
      owner_id: assignee?.id ?? alert.owner_id,
      status: "assigned"
    },
    `id=eq.${alert.id}`
  );
}

export async function acknowledgeAlertByDemoId(demoId: string) {
  const client = createClient();
  const { alertRows } = await getWorkspaceTables();
  const alert = alertRows.find((row) => {
    const demoAlert = demoAlertRows.find((item) => item.trigger === row.title);
    return demoAlert?.id === demoId;
  });
  if (!alert) {
    throw new Error(`Alert ${demoId} not found.`);
  }

  await client.update(
    "alerts",
    {
      acknowledged_at: new Date().toISOString(),
      status: "acknowledged"
    },
    `id=eq.${alert.id}`
  );
}

export async function recordAlertDecisionByDemoId(input: {
  decision: "continue" | "watch" | "freeze" | "exit" | "request_documents" | "committee_escalation";
  demoId: string;
  notes: string;
}) {
  const client = createClient();
  const { alertRows, organizationId, users } = await getWorkspaceTables();
  const alert = alertRows.find((row) => {
    const demoAlert = demoAlertRows.find((item) => item.trigger === row.title);
    return demoAlert?.id === input.demoId;
  });
  if (!alert) {
    throw new Error(`Alert ${input.demoId} not found.`);
  }

  const actor = users.find(
    (user) => String(user.user_metadata?.full_name ?? user.email ?? "") === "B. Kumar"
  );

  await client.insert("alert_decisions", {
    alert_id: alert.id,
    decided_by: actor?.id ?? null,
    decision: input.decision,
    notes: input.notes,
    organization_id: organizationId
  });

  await client.update(
    "alerts",
    {
      closed_at: input.decision === "exit" ? new Date().toISOString() : alert.closed_at,
      escalated_at:
        input.decision === "committee_escalation" ? new Date().toISOString() : alert.escalated_at,
      resolution: input.notes,
      status:
        input.decision === "committee_escalation"
          ? "escalated"
          : input.decision === "exit"
            ? "closed"
            : "investigating"
    },
    `id=eq.${alert.id}`
  );
}

export async function importPortfolioCsv(input: {
  csvText: string;
  filename: string;
}) {
  const client = createClient();
  const { organizationId, counterparties, exposures } = await getWorkspaceTables();
  const lines = input.csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV must include a header row and at least one data row.");
  }

  const headers = lines[0].split(",").map((header) => header.trim().toLowerCase());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",").map((value) => value.trim());
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });

  const [portfolioImport] = await client.insert<{ id: string }>("portfolio_imports", {
    created_at: new Date().toISOString(),
    idempotency_key: `${slugify(input.filename)}-${Date.now()}`,
    organization_id: organizationId,
    original_filename: input.filename,
    status: rows.length ? "processing" : "uploaded",
    total_rows: rows.length,
    valid_rows: rows.length,
    invalid_rows: 0,
    created_rows: 0,
    updated_rows: 0
  });

  let createdRows = 0;
  let updatedRows = 0;

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const legalName = String(row.issuer ?? row.legal_name ?? row.counterparty ?? "").trim();
    const isin = String(row.isin ?? "").trim();
    const outstanding = String(row.outstanding ?? row.amount ?? "0").trim();
    const maturity = String(row.maturity ?? row.maturity_date ?? "").trim();

    if (!legalName || !isin || !maturity) {
      continue;
    }

    const existingCounterparty = counterparties.find(
      (item) => item.legal_name.toLowerCase() === legalName.toLowerCase()
    );

    const counterparty =
      existingCounterparty ??
      (
        await client.insert<{ id: string; metadata: JsonObject }>("counterparties", {
          display_name: legalName,
          legal_name: legalName,
          metadata: {
            cin: String(row.cin ?? ""),
            demo_id: slugify(legalName),
            exposure: `₹${Number.parseFloat(outstanding || "0").toFixed(1)} Cr`,
            gstin: String(row.gstin ?? ""),
            rating: String(row.rating ?? "Unrated"),
            verified: "Import"
          },
          organization_id: organizationId,
          registered_state: String(row.state ?? "Unknown"),
          risk_severity: String((row.risk ?? "low")).toLowerCase() as RiskSeverity,
          sector: String(row.sector ?? "Unknown"),
          status: "active",
          type: String((row.type ?? "issuer")).toLowerCase()
        })
      )[0];

    if (!existingCounterparty) {
      await client.insert("counterparty_identifiers", [
        {
          counterparty_id: counterparty.id,
          is_primary: true,
          masked_value: String(row.cin ?? ""),
          normalized_value: String(row.cin ?? ""),
          organization_id: organizationId,
          type: "cin"
        },
        {
          counterparty_id: counterparty.id,
          masked_value: String(row.gstin ?? ""),
          normalized_value: String(row.gstin ?? ""),
          organization_id: organizationId,
          type: "gstin"
        }
      ]);
    }

    const existingExposure = exposures.find((item) => item.isin === isin);
    if (existingExposure) {
      await client.update(
        "ncd_exposures",
        {
          outstanding_amount: Number.parseFloat(outstanding || "0"),
          rating: String(row.rating ?? existingExposure.rating),
          security_summary: String(row.security ?? existingExposure.security_summary ?? ""),
          updated_at: new Date().toISOString()
        },
        `id=eq.${existingExposure.id}`
      );
      updatedRows += 1;
    } else {
      await client.insert("ncd_exposures", {
        currency: "INR",
        holder_counterparty_id: null,
        instrument_name: `${legalName} NCD`,
        issuer_counterparty_id: counterparty.id,
        isin,
        metadata: {
          demo_id: `exp-${String(index + 1).padStart(3, "0")}`,
          risk: String(row.risk ?? "low"),
          sector: String(row.sector ?? "")
        },
        maturity_date: maturity,
        organization_id: organizationId,
        outstanding_amount: Number.parseFloat(outstanding || "0"),
        rating: String(row.rating ?? "Unrated"),
        rating_outlook: String(row.rating_outlook ?? ""),
        secured: String(row.security ?? "secured").toLowerCase() === "secured",
        security_summary: String(row.security ?? "Secured"),
        status: "active"
      });
      createdRows += 1;
    }
  }

  await client.update(
    "portfolio_imports",
    {
      completed_at: new Date().toISOString(),
      created_rows: createdRows,
      invalid_rows: 0,
      status: createdRows || updatedRows ? "completed" : "completed_with_errors",
      updated_rows: updatedRows
    },
    `id=eq.${portfolioImport.id}`
  );

  return { createdRows, portfolioImportId: portfolioImport.id, updatedRows };
}
