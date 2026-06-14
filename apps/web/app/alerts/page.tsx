import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FilterBar, PageHeader, Panel, RiskBadge, StatusBadge } from "../../components/workspace-ui";
import { getWorkspaceData } from "../../lib/rivr-db";

export const metadata = { title: "Alerts" };
export const dynamic = "force-dynamic";

export default async function AlertsPage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const { alerts } = await getWorkspaceData();
  const params = searchParams ? await searchParams : {};
  const statusFilter = params.status?.toLowerCase();
  const filteredAlerts = statusFilter
    ? alerts.filter((alert) => alert.status.toLowerCase() === statusFilter)
    : alerts;

  return (
    <>
      <PageHeader
        eyebrow="Analyst work queue"
        title="Risk alerts"
        description="Investigate evidence-backed events, assign ownership, and record a defensible decision."
        actions={<button className="button" type="button">Create saved view</button>}
      />
      <div className="queue-tabs" role="tablist" aria-label="Alert views">
        <Link className={!statusFilter ? "active" : ""} href="/alerts" role="tab">Open <span>{alerts.filter((alert) => alert.status !== "Closed").length}</span></Link>
        <Link className={statusFilter === "assigned" ? "active" : ""} href="/alerts?status=assigned" role="tab">Assigned to me <span>{alerts.filter((alert) => alert.owner === "Ananya Rao").length}</span></Link>
        <Link className={statusFilter === "escalated" ? "active" : ""} href="/alerts?status=escalated" role="tab">Beyond SLA <span>{alerts.filter((alert) => alert.status === "Escalated").length}</span></Link>
        <Link className={statusFilter === "closed" ? "active" : ""} href="/alerts?status=closed" role="tab">Closed</Link>
      </div>
      <Panel title="Priority queue" description="Sorted by severity, exposure, age, and SLA">
        <FilterBar searchPlaceholder="Search alerts or counterparties">
          <button className="filter-button" type="button"><SlidersHorizontal size={15} /> Filters</button>
        </FilterBar>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Severity</th><th>Alert</th><th>Counterparty</th><th>Exposure</th><th>Source</th><th>Age</th><th>Owner</th><th>Status</th></tr>
            </thead>
            <tbody>
              {filteredAlerts.map((alert) => (
                <tr key={alert.id}>
                  <td><RiskBadge severity={alert.severity} /></td>
                  <td>
                    <Link className="entity-link" href={`/alerts/${alert.id}`}>
                      {alert.trigger}
                    </Link>
                    <span className="cell-subtext">{alert.id}</span>
                  </td>
                  <td>{alert.counterparty}<span className="cell-subtext">{alert.isin}</span></td>
                  <td className="numeric">{alert.exposure}</td>
                  <td>{alert.source}</td>
                  <td>{alert.age}</td>
                  <td>{alert.owner}</td>
                  <td><StatusBadge status={alert.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
