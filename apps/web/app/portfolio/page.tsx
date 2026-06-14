import { Download, SlidersHorizontal, Upload } from "lucide-react";
import Link from "next/link";
import { FilterBar, PageHeader, Panel, RiskBadge } from "../../components/workspace-ui";
import { portfolioRows } from "../../lib/mock-data";

export const metadata = { title: "Portfolio" };

export default function PortfolioPage() {
  return (
    <>
      <PageHeader
        eyebrow="Portfolio register"
        title="NCD portfolio"
        description="Monitor issuer exposure, maturity, security, rating, and current evidence-backed risk."
        actions={
          <>
            <button className="button button-secondary" type="button">
              <Download aria-hidden="true" size={15} /> Export
            </button>
            <button className="button" type="button">
              <Upload aria-hidden="true" size={15} /> Import CSV
            </button>
          </>
        }
      />

      <div className="summary-strip">
        <div><span>6 issuers</span><strong>₹145.5 Cr shown</strong></div>
        <div><span>Secured</span><strong>100%</strong></div>
        <div><span>Critical / high</span><strong>₹64.5 Cr</strong></div>
        <div><span>Due in 12 months</span><strong>₹28.5 Cr</strong></div>
      </div>

      <Panel title="Exposure register" description="Sample data until portfolio APIs are connected">
        <FilterBar searchPlaceholder="Search issuer or ISIN">
          <button className="filter-button" type="button">
            <SlidersHorizontal aria-hidden="true" size={15} /> Filters
          </button>
          <select aria-label="Filter by risk">
            <option>All risk levels</option>
            <option>Critical</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </FilterBar>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Issuer / ISIN</th>
                <th>Sector</th>
                <th>Outstanding</th>
                <th>Maturity</th>
                <th>Rating</th>
                <th>Security</th>
                <th>Risk</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {portfolioRows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link className="entity-link" href={`/ncd-exposures/${row.id}`}>
                      {row.issuer}
                    </Link>
                    <span className="cell-subtext">{row.isin}</span>
                  </td>
                  <td>{row.sector}</td>
                  <td className="numeric">{row.outstanding}</td>
                  <td>{row.maturity}</td>
                  <td>{row.rating}</td>
                  <td>{row.security}</td>
                  <td><RiskBadge severity={row.risk} /></td>
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
