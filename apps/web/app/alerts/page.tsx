import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FilterBar, PageHeader, Panel, RiskBadge, StatusBadge } from "../../components/workspace-ui";
import { alertRows } from "../../lib/mock-data";

export const metadata = { title: "Alerts" };

export default function AlertsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Analyst work queue"
        title="Risk alerts"
        description="Investigate evidence-backed events, assign ownership, and record a defensible decision."
        actions={<button className="button" type="button">Create saved view</button>}
      />
      <div className="queue-tabs" role="tablist" aria-label="Alert views">
        <button className="active" role="tab" type="button">Open <span>24</span></button>
        <button role="tab" type="button">Assigned to me <span>7</span></button>
        <button role="tab" type="button">Beyond SLA <span>7</span></button>
        <button role="tab" type="button">Closed</button>
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
              {alertRows.map((alert) => (
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
