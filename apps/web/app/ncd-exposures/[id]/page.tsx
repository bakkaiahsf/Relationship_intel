import { ArrowLeft, FileClock, MessageSquareText, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel, RiskBadge, StatusBadge } from "../../../components/workspace-ui";
import { getWorkspaceData } from "../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export default async function ExposureDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { alerts, exposures } = await getWorkspaceData();
  const exposure = exposures.find((item) => item.id === id);
  if (!exposure) notFound();
  const relatedAlerts = alerts.filter((item) => item.entityId === exposure.entityId);
  const primaryAlert = relatedAlerts[0];

  return (
    <>
      <Link className="back-link" href="/ncd-exposures"><ArrowLeft size={15} /> NCD exposures</Link>
      <PageHeader
        eyebrow="NCD monitoring cockpit"
        title={exposure.isin}
        description={`${exposure.issuer} · ${exposure.security} · Matures ${exposure.maturity}`}
        actions={
          primaryAlert ? (
            <form action={`/api/alerts/${primaryAlert.id}/decisions`} method="post">
              <input name="decision" type="hidden" value="watch" />
              <input
                name="notes"
                type="hidden"
                value="Exposure cockpit review recorded from the NCD detail view."
              />
              <button className="button" type="submit">Record decision</button>
            </form>
          ) : null
        }
      />
      <section className="entity-summary">
        <div><span>Current risk</span><RiskBadge severity={exposure.risk} /></div>
        <div><span>Outstanding</span><strong>{exposure.outstanding}</strong></div>
        <div><span>Rating</span><strong>{exposure.rating}</strong></div>
        <div><span>Evidence</span><StatusBadge status="Current" /></div>
      </section>
      <section className="detail-grid">
        <Panel title="Instrument terms" description="Core exposure terms">
          <dl className="detail-list">
            <div><dt>ISIN</dt><dd className="identifier">{exposure.isin}</dd></div>
            <div><dt>Coupon</dt><dd>10.25% fixed, quarterly</dd></div>
            <div><dt>Maturity</dt><dd>{exposure.maturity}</dd></div>
            <div><dt>Security</dt><dd>{exposure.security}</dd></div>
            <div><dt>Security cover</dt><dd>1.25x required</dd></div>
            <div><dt>Trustee</dt><dd>Catalyst Trusteeship Ltd</dd></div>
          </dl>
        </Panel>
        <Panel title="Covenant status" description="Upcoming compliance and security checks">
          <div className="coverage-list">
            <div><ShieldCheck size={17} /><span><strong>Security cover certificate</strong><small>Received 31 May 2026</small></span><StatusBadge status="Compliant" /></div>
            <div><FileClock size={17} /><span><strong>Quarterly financials</strong><small>Due 30 Jun 2026</small></span><StatusBadge status="Due soon" /></div>
            <div><ShieldCheck size={17} /><span><strong>DSRA maintenance</strong><small>Verified from trustee filing</small></span><StatusBadge status="Compliant" /></div>
          </div>
        </Panel>
      </section>
      <Panel title="Risk events and alerts" description="Evidence-backed changes affecting this exposure">
        <div className="timeline">
          {relatedAlerts.map((alert) => (
            <article className="timeline-item" key={alert.id}>
              <span className={`timeline-dot dot-${alert.severity}`} />
              <div>
                <div className="timeline-heading"><strong>{alert.trigger}</strong><RiskBadge severity={alert.severity} /></div>
                <p>{alert.source} evidence triggered rule version 1.0. Affected exposure: {alert.exposure}.</p>
                <small>{alert.age} ago · {alert.owner} · {alert.status}</small>
              </div>
            </article>
          ))}
        </div>
      </Panel>

      <Panel title="Decision log" description="What the credit team records after investigation">
        <div className="coverage-list">
          <div>
            <MessageSquareText aria-hidden="true" size={17} />
            <span>
              <strong>Analyst note</strong>
              <small>Open issue: determine whether the latest charge materially impacts coverage.</small>
            </span>
            <StatusBadge status="Draft" />
          </div>
          <div>
            <FileClock aria-hidden="true" size={17} />
            <span>
              <strong>Committee memo</strong>
              <small>Ready for export once alert is resolved.</small>
            </span>
            <StatusBadge status="Pending" />
          </div>
        </div>
      </Panel>
    </>
  );
}
