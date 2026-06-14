import { ArrowLeft, FileCheck2, Flag, MessageSquareText, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader, Panel, RiskBadge, StatusBadge } from "../../../components/workspace-ui";
import { alertTimeline } from "../../../lib/mock-data";
import { getWorkspaceData } from "../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export default async function AlertDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { alerts, counterparties, exposures } = await getWorkspaceData();
  const alert = alerts.find((item) => item.id === id);
  if (!alert) notFound();

  const counterparty = counterparties.find((item) => item.id === alert.entityId);
  const exposure = exposures.find((item) => item.entityId === alert.entityId);

  return (
    <>
      <Link className="back-link" href="/alerts">
        <ArrowLeft aria-hidden="true" size={15} /> Alerts
      </Link>
      <PageHeader
        eyebrow="Alert detail"
        title={alert.trigger}
        description={`${alert.counterparty} · ${alert.id} · Source ${alert.source}`}
        actions={
          <>
            <form action={`/api/alerts/${alert.id}/assign`} method="post">
              <button className="button button-secondary" type="submit">
                <UserRoundPlus aria-hidden="true" size={15} /> Assign
              </button>
            </form>
            <form action={`/api/alerts/${alert.id}/acknowledge`} method="post">
              <button className="button button-secondary" type="submit">
                <FileCheck2 aria-hidden="true" size={15} /> Acknowledge
              </button>
            </form>
            <form action={`/api/alerts/${alert.id}/decisions`} method="post">
              <input
                name="decision"
                type="hidden"
                value={alert.severity === "critical" ? "committee_escalation" : "watch"}
              />
              <input name="notes" type="hidden" value="Decision recorded from alert detail view." />
              <button className="button" type="submit">
                <Flag aria-hidden="true" size={15} /> Record decision
              </button>
            </form>
          </>
        }
      />

      <section className="entity-summary">
        <div><span>Severity</span><RiskBadge severity={alert.severity} /></div>
        <div><span>Status</span><StatusBadge status={alert.status} /></div>
        <div><span>Owner</span><strong>{alert.owner}</strong></div>
        <div><span>Exposure</span><strong>{alert.exposure}</strong></div>
      </section>

      <section className="detail-grid">
        <Panel title="Trigger evidence" description="How the alert was created">
          <dl className="detail-list">
            <div><dt>Alert id</dt><dd className="identifier">{alert.id}</dd></div>
            <div><dt>Source</dt><dd>{alert.source}</dd></div>
            <div><dt>Issuer</dt><dd>{alert.counterparty}</dd></div>
            <div><dt>Security</dt><dd>{exposure?.security ?? "Secured"}</dd></div>
            <div><dt>Related counterparty</dt><dd>{counterparty?.name ?? alert.counterparty}</dd></div>
            <div><dt>Rule version</dt><dd>1.0</dd></div>
          </dl>
        </Panel>

        <Panel title="Workflow state" description="What the analyst sees during review">
          <div className="coverage-list">
            <div>
              <MessageSquareText aria-hidden="true" size={17} />
              <span>
                <strong>Open in queue</strong>
                <small>Appears in the analyst work queue and is filterable by owner.</small>
              </span>
              <StatusBadge status="Queued" />
            </div>
            <div>
              <UserRoundPlus aria-hidden="true" size={17} />
              <span>
                <strong>Assign and acknowledge</strong>
                <small>Ownership and acknowledgement timestamps are part of the audit trail.</small>
              </span>
              <StatusBadge status="Trackable" />
            </div>
            <div>
              <FileCheck2 aria-hidden="true" size={17} />
              <span>
                <strong>Decision note</strong>
                <small>Credit manager records continue, watch, freeze, or committee escalation.</small>
              </span>
              <StatusBadge status="Required" />
            </div>
          </div>
        </Panel>
      </section>

      <Panel title="Timeline" description="Evidence-backed workflow trail">
        <div className="timeline">
          {alertTimeline.map((entry) => (
            <article className="timeline-item" key={entry.when + entry.title}>
              <span className={`timeline-dot dot-${entry.tone}`} />
              <div>
                <div className="timeline-heading">
                  <strong>{entry.title}</strong>
                  <span>{entry.when}</span>
                </div>
                <p>{entry.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </Panel>
    </>
  );
}
