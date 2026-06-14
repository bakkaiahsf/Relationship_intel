import { Download, Network, Search } from "lucide-react";
import Link from "next/link";
import { PageHeader, Panel, RiskBadge } from "../../components/workspace-ui";
import { getWorkspaceData } from "../../lib/rivr-db";

export const metadata = { title: "Relationship Intelligence" };
export const dynamic = "force-dynamic";

export default async function RelationshipsPage({
  searchParams
}: {
  searchParams?: Promise<{ filter?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const { relationships } = await getWorkspaceData();
  const filter = params.filter?.toLowerCase();
  const filteredRelationships = filter
    ? relationships.filter((relationship) => relationship.type.toLowerCase().includes(filter))
    : relationships;

  return (
    <>
      <PageHeader
        eyebrow="Group and hidden concentration"
        title="Relationship intelligence"
        description="Trace common directors, ownership, shared addresses, and aggregated exposure with source confidence."
        actions={<Link className="button button-secondary" href="/api/exports/network"><Download size={15} /> Export network</Link>}
      />
      <div className="relationship-toolbar">
        <label><Search size={16} /><input aria-label="Search relationship network" defaultValue="Suryodaya Finance" /></label>
        <Link className={filter === "director" ? "filter-button active" : "filter-button"} href="/relationships?filter=director"><Network size={15} /> Director links</Link>
        <Link className={filter === "ownership" ? "filter-button active" : "filter-button"} href="/relationships?filter=ownership">Ownership</Link>
        <Link className={filter === "shared" ? "filter-button active" : "filter-button"} href="/relationships?filter=shared">Shared address</Link>
      </div>

      <section className="relationship-layout">
        <Panel title="Entity network" description="Selected group · ₹92.4 Cr aggregate exposure">
          <div className="network-canvas" aria-label="Business relationship network">
            <svg aria-hidden="true" className="network-lines" viewBox="0 0 800 420">
              <line x1="395" y1="198" x2="170" y2="90" />
              <line x1="405" y1="205" x2="650" y2="100" />
              <line x1="405" y1="216" x2="650" y2="330" />
              <line x1="392" y1="216" x2="180" y2="330" />
              <line className="line-warning" x1="170" y1="100" x2="650" y2="320" />
            </svg>
            <div className="network-node node-center">
              <span className="node-icon">SF</span>
              <strong>Suryodaya Finance</strong>
              <small>₹36.0 Cr · Issuer</small>
              <RiskBadge severity="critical" />
            </div>
            <div className="network-node node-top-left">
              <span className="node-icon">SC</span>
              <strong>Suryodaya Capital</strong>
              <small>Common director</small>
            </div>
            <div className="network-node node-top-right">
              <span className="node-icon">MI</span>
              <strong>Maitri Infrastructure</strong>
              <small>Shared address</small>
              <RiskBadge severity="high" />
            </div>
            <div className="network-node node-bottom-left">
              <span className="node-icon">MP</span>
              <strong>Maitri Projects LLP</strong>
              <small>Subsidiary</small>
            </div>
            <div className="network-node node-bottom-right">
              <span className="node-icon">PL</span>
              <strong>Pragati Logistics</strong>
              <small>Common director</small>
            </div>
          </div>
        </Panel>

        <Panel title="Group risk" description="Concentration and relationship signals">
          <div className="group-risk-list">
            <div><span>Aggregate exposure</span><strong>₹92.4 Cr</strong></div>
            <div><span>Direct counterparties</span><strong>5</strong></div>
            <div><span>High / critical entities</span><strong>2</strong></div>
            <div><span>Common directors</span><strong>3</strong></div>
          </div>
          <div className="risk-callout">
            <RiskBadge severity="high" />
            <strong>Hidden concentration detected</strong>
            <p>Two separately classified issuers share a promoter address and director, increasing group exposure by ₹28.5 Cr.</p>
          </div>
        </Panel>
      </section>

      <Panel title="Relationship evidence" description="Accessible table fallback with source confidence">
        <div className="table-wrap">
          <table>
            <thead><tr><th>Source</th><th>Related entity</th><th>Relationship</th><th>Confidence</th><th>Linked exposure</th></tr></thead>
            <tbody>
              {filteredRelationships.map((link) => (
                <tr key={`${link.source}-${link.target}`}>
                  <td>{link.source}</td>
                  <td>{link.target}</td>
                  <td>{link.type}</td>
                  <td><span className={`confidence confidence-${link.confidence.toLowerCase()}`}>{link.confidence}</span></td>
                  <td className="numeric">{link.exposure}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
