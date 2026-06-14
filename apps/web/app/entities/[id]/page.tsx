import { ArrowLeft, Building2, CalendarClock, FileCheck2, Network } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel, RiskBadge, StatusBadge } from "../../../components/workspace-ui";
import { getEvidenceSnapshotsForCounterparty, getWorkspaceData } from "../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export default async function EntityDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { counterparties, alerts, exposures } = await getWorkspaceData();
  const entity = counterparties.find((item) => item.id === id);
  if (!entity) notFound();

  const snapshots = await getEvidenceSnapshotsForCounterparty(id);
  const entityExposures = exposures.filter((item) => item.entityId === id);
  const entityAlerts = alerts.filter((item) => item.entityId === id);

  return (
    <>
      <Link className="back-link" href="/entities">
        <ArrowLeft aria-hidden="true" size={15} /> Counterparties
      </Link>
      <PageHeader
        eyebrow={`${entity.type} profile`}
        title={entity.name}
        description={`${entity.cin} · ${entity.sector} · Evidence refreshed today`}
        actions={
          <>
            <form action="/api/verifications/mca" method="post">
              <input name="counterpartyId" type="hidden" value={entity.id} />
              <button className="button button-secondary" type="submit">Request verification</button>
            </form>
            <form action={`/api/counterparties/${entity.id}/watchlist`} method="post">
              <button className="button" type="submit">Add to watchlist</button>
            </form>
          </>
        }
      />

      <section className="entity-summary">
        <div>
          <span>Current risk</span>
          <RiskBadge severity={entity.risk} />
        </div>
        <div><span>Total exposure</span><strong>{entity.exposure}</strong></div>
        <div><span>External rating</span><strong>{entity.rating}</strong></div>
        <div><span>Verification</span><StatusBadge status="Verified" /></div>
      </section>

      <section className="detail-grid">
        <Panel title="Identity and verification" description="Normalized facts from stored evidence">
          <dl className="detail-list">
            <div><dt>Legal name</dt><dd>{entity.name}</dd></div>
            <div><dt>CIN</dt><dd className="identifier">{entity.cin}</dd></div>
            <div><dt>GSTIN</dt><dd className="identifier">{entity.gstin}</dd></div>
            <div><dt>Entity type</dt><dd>{entity.type}</dd></div>
            <div><dt>Sector</dt><dd>{entity.sector}</dd></div>
            <div><dt>Verified through</dt><dd>{entity.verified}</dd></div>
          </dl>
        </Panel>
        <Panel title="Monitoring coverage" description="Evidence freshness and next checks">
          <div className="coverage-list">
            <div><FileCheck2 size={17} /><span><strong>GST profile</strong><small>Fresh · checked today</small></span><StatusBadge status="Current" /></div>
            <div><Building2 size={17} /><span><strong>MCA master data</strong><small>Fresh · checked today</small></span><StatusBadge status="Current" /></div>
            <div><Network size={17} /><span><strong>Directors and charges</strong><small>Next check in 3 days</small></span><StatusBadge status="Scheduled" /></div>
            <div><CalendarClock size={17} /><span><strong>Rating action</strong><small>Continuous source watch</small></span><StatusBadge status="Monitored" /></div>
          </div>
        </Panel>
      </section>

      <Panel title="NCD exposures" description="Instruments linked to this issuer">
        <div className="table-wrap">
          <table>
            <thead><tr><th>ISIN</th><th>Outstanding</th><th>Maturity</th><th>Security</th><th>Risk</th></tr></thead>
            <tbody>
              {entityExposures.map((exposure) => (
                <tr key={exposure.id}>
                  <td><Link className="entity-link" href={`/ncd-exposures/${exposure.id}`}>{exposure.isin}</Link></td>
                  <td className="numeric">{exposure.outstanding}</td>
                  <td>{exposure.maturity}</td>
                  <td>{exposure.security}</td>
                  <td><RiskBadge severity={exposure.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Evidence snapshots" description="Normalized facts from the latest provider responses">
        <div className="coverage-list">
          {snapshots.slice(0, 3).map((snapshot) => (
            <div key={snapshot.id}>
              <FileCheck2 size={17} />
              <span>
                <strong>{snapshot.source.toUpperCase()}</strong>
                <small>Fetched {new Date(snapshot.fetched_at).toLocaleString("en-IN")}</small>
              </span>
              <StatusBadge status="Current" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Open alerts" description="Events and rule outputs requiring action">
        {entityAlerts.length ? (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Severity</th><th>Trigger</th><th>Source</th><th>Owner</th><th>Status</th></tr></thead>
              <tbody>
                {entityAlerts.map((alert) => (
                  <tr key={alert.id}>
                    <td><RiskBadge severity={alert.severity} /></td>
                    <td>{alert.trigger}</td>
                    <td>{alert.source}</td>
                    <td>{alert.owner}</td>
                    <td><StatusBadge status={alert.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="empty-state">No open alerts for this counterparty.</div>}
      </Panel>
    </>
  );
}
