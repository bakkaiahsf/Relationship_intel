import { Building2, SlidersHorizontal, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { FilterBar, PageHeader, Panel, RiskBadge } from "../../components/workspace-ui";
import { getWorkspaceData } from "../../lib/rivr-db";

export const metadata = { title: "Counterparties" };
export const dynamic = "force-dynamic";

export default async function EntitiesPage() {
  const { counterparties } = await getWorkspaceData();

  return (
    <>
      <PageHeader
        eyebrow="Business identity"
        title="Counterparties"
        description="Verified issuers, borrowers, guarantors, trustees, vendors, and related parties."
        actions={<Link className="button" href="/entities/new"><Building2 size={15} /> Add counterparty</Link>}
      />
      <Panel title="Entity register" description="Identity, exposure, verification coverage, and risk">
        <FilterBar searchPlaceholder="Search legal name, GSTIN or CIN">
          <button className="filter-button" type="button">
            <SlidersHorizontal aria-hidden="true" size={15} /> Filters
          </button>
        </FilterBar>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Legal name</th>
                <th>Type</th>
                <th>Identifiers</th>
                <th>Exposure</th>
                <th>Rating</th>
                <th>Verified sources</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {counterparties.map((entity) => (
                <tr key={entity.id}>
                  <td>
                    <Link className="entity-link" href={`/entities/${entity.id}`}>
                      {entity.name}
                    </Link>
                    <span className="cell-subtext">{entity.sector}</span>
                  </td>
                  <td>{entity.type}</td>
                  <td>
                    <span className="identifier">{entity.cin}</span>
                    <span className="cell-subtext">{entity.gstin}</span>
                  </td>
                  <td className="numeric">{entity.exposure}</td>
                  <td>{entity.rating}</td>
                  <td>
                    <span className="verified-cell">
                      <UserRoundCheck aria-hidden="true" size={15} /> {entity.verified}
                    </span>
                  </td>
                  <td><RiskBadge severity={entity.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
