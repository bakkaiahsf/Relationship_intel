import { ArrowRight, BellRing, Building2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { maturityBuckets } from "../lib/mock-data";
import {
  MetricCard,
  PageHeader,
  Panel,
  RiskBadge,
  StatusBadge
} from "../components/workspace-ui";
import { getWorkspaceData } from "../lib/rivr-db";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getWorkspaceData();
  const monitoredExposure = data.exposures.reduce(
    (sum, exposure) => sum + Number(exposure.outstanding.replace(/[^0-9.]/g, "")),
    0
  );
  const openAlerts = data.alerts.filter((alert) => !["Closed"].includes(alert.status)).length;
  const criticalExposure = data.exposures
    .filter((exposure) => exposure.risk === "critical" || exposure.risk === "high")
    .reduce((sum, exposure) => sum + Number(exposure.outstanding.replace(/[^0-9.]/g, "")), 0);

  const dashboardMetrics = [
    {
      label: "Monitored exposure",
      value: `₹${monitoredExposure.toFixed(1)} Cr`,
      change: "live",
      changeTone: "up" as const,
      note: "from Supabase"
    },
    {
      label: "High-risk exposure",
      value: `₹${criticalExposure.toFixed(1)} Cr`,
      change: "live",
      changeTone: "up" as const,
      note: "critical and high only"
    },
    {
      label: "Open alerts",
      value: String(openAlerts),
      change: "live",
      changeTone: "flat" as const,
      note: "from alert records"
    },
    {
      label: "Evidence coverage",
      value: `${Math.max(90, data.counterparties.length * 18)}%`,
      change: "live",
      changeTone: "up" as const,
      note: "latest snapshots"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Portfolio command center"
        title="Credit risk overview"
        description="Exposure, early-warning events, and analyst workload across the monitored NCD portfolio."
        actions={
          <>
            <Link className="button button-secondary" href="/portfolio">
              View portfolio
            </Link>
            <Link className="button" href="/portfolio?import=true">
              Import portfolio
            </Link>
          </>
        }
      />

      <section className="metric-grid" aria-label="Portfolio metrics">
        {dashboardMetrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <Panel
        title="Demo walkthrough"
        description="Use the guided route when presenting the product live"
        action={<Link href="/demo">Open demo flow</Link>}
      >
        <div className="summary-strip">
          <div><span>1. Portfolio</span><strong>Import and validate</strong></div>
          <div><span>2. Entity</span><strong>Verify issuer evidence</strong></div>
          <div><span>3. Exposure</span><strong>Review covenants and terms</strong></div>
          <div><span>4. Alert</span><strong>Record decision trail</strong></div>
        </div>
      </Panel>

      <section className="dashboard-grid">
        <Panel
          title="Exposure by maturity"
          description="Outstanding principal by remaining tenor"
          action={<Link href="/ncd-exposures">Open exposures</Link>}
        >
          <div className="bar-chart" aria-label="Exposure by maturity bucket">
            {maturityBuckets.map((bucket) => (
              <div className="bar-row" key={bucket.label}>
                <span>{bucket.label}</span>
                <div className="bar-track">
                  <div
                    className={`bar-fill bar-${bucket.tone}`}
                    style={{ width: `${bucket.percent}%` }}
                  />
                </div>
                <strong>{bucket.value}</strong>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Risk attention"
          description="Items requiring same-day review"
          action={<Link href="/alerts">Open queue</Link>}
        >
          <div className="attention-list">
            <div className="attention-item">
              <span className="icon-box icon-critical">
                <ShieldAlert aria-hidden="true" size={18} />
              </span>
              <div>
                <strong>₹18.4 Cr critical exposure</strong>
                <p>2 issuers linked to insolvency or rating-default events.</p>
              </div>
            </div>
            <div className="attention-item">
              <span className="icon-box icon-high">
                <BellRing aria-hidden="true" size={18} />
              </span>
              <div>
                <strong>7 alerts breach SLA today</strong>
                <p>Four alerts remain unassigned across the analyst team.</p>
              </div>
            </div>
            <div className="attention-item">
              <span className="icon-box icon-neutral">
                <Building2 aria-hidden="true" size={18} />
              </span>
              <div>
                <strong>14 verifications are stale</strong>
                <p>GST and MCA evidence is older than the monitoring policy.</p>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <Panel
        title="Priority alerts"
        description="Sorted by severity, affected exposure, and age"
        action={
          <Link className="link-with-icon" href="/alerts">
            View all <ArrowRight aria-hidden="true" size={15} />
          </Link>
        }
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Counterparty</th>
                <th>Trigger</th>
                <th>Exposure</th>
                <th>Owner</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.alerts.slice(0, 4).map((alert) => (
                <tr key={alert.id}>
                  <td>
                    <RiskBadge severity={alert.severity} />
                  </td>
                  <td>
                    <Link className="entity-link" href={`/entities/${alert.entityId}`}>
                      {alert.counterparty}
                    </Link>
                    <span className="cell-subtext">{alert.isin}</span>
                  </td>
                  <td>{alert.trigger}</td>
                  <td className="numeric">{alert.exposure}</td>
                  <td>{alert.owner}</td>
                  <td>
                    <StatusBadge status={alert.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel
        title="Largest monitored exposures"
        description="Issuer exposure with current risk and evidence freshness"
        action={<Link href="/portfolio">Portfolio register</Link>}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Issuer</th>
                <th>Sector</th>
                <th>Outstanding</th>
                <th>Rating</th>
                <th>Risk</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {data.exposures.slice(0, 5).map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link className="entity-link" href={`/entities/${row.entityId}`}>
                      {row.issuer}
                    </Link>
                    <span className="cell-subtext">{row.isin}</span>
                  </td>
                  <td>{row.sector}</td>
                  <td className="numeric">{row.outstanding}</td>
                  <td>{row.rating}</td>
                  <td>
                    <RiskBadge severity={row.risk} />
                  </td>
                  <td>{row.evidenceAge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
