import { Download, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FilterBar, PageHeader, Panel, RiskBadge } from "../../components/workspace-ui";
import { portfolioRows } from "../../lib/mock-data";

export const metadata = { title: "NCD Exposures" };

export default function ExposuresPage() {
  return (
    <>
      <PageHeader
        eyebrow="Instrument monitoring"
        title="NCD exposures"
        description="Terms, maturity, rating, security position, and issuer risk across monitored instruments."
        actions={<button className="button button-secondary" type="button"><Download size={15} /> Export register</button>}
      />
      <Panel title="Instrument register" description="All monitored NCD positions">
        <FilterBar searchPlaceholder="Search ISIN or issuer">
          <button className="filter-button" type="button"><SlidersHorizontal size={15} /> Filters</button>
        </FilterBar>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>ISIN</th><th>Issuer</th><th>Outstanding</th><th>Coupon</th><th>Maturity</th><th>Rating</th><th>Security</th><th>Risk</th></tr>
            </thead>
            <tbody>
              {portfolioRows.map((row, index) => (
                <tr key={row.id}>
                  <td><Link className="entity-link identifier" href={`/ncd-exposures/${row.id}`}>{row.isin}</Link></td>
                  <td>{row.issuer}</td>
                  <td className="numeric">{row.outstanding}</td>
                  <td>{[10.25, 11.1, 9.75, 10.6, 9.4, 9.9][index]}%</td>
                  <td>{row.maturity}</td>
                  <td>{row.rating}</td>
                  <td>{row.security}</td>
                  <td><RiskBadge severity={row.risk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
