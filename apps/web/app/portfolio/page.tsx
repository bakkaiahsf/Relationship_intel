import { Download, SlidersHorizontal, Upload } from "lucide-react";
import Link from "next/link";
import { FilterBar, PageHeader, Panel, RiskBadge } from "../../components/workspace-ui";
import { getWorkspaceData } from "../../lib/rivr-db";

export const metadata = { title: "Portfolio" };
export const dynamic = "force-dynamic";

export default async function PortfolioPage({
  searchParams
}: {
  searchParams?: Promise<{ import?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const { exposures } = await getWorkspaceData();
  const showImportForm = params.import === "true";

  return (
    <>
      <PageHeader
        eyebrow="Portfolio register"
        title="NCD portfolio"
        description="Monitor issuer exposure, maturity, security, rating, and current evidence-backed risk."
        actions={
          <>
            <Link className="button button-secondary" href="/api/exports/portfolio">
              <Download aria-hidden="true" size={15} /> Export
            </Link>
            <Link className="button" href="?import=true">
              <Upload aria-hidden="true" size={15} /> Import CSV
            </Link>
          </>
        }
      />

      <div className="summary-strip">
        <div><span>6 issuers</span><strong>₹145.5 Cr shown</strong></div>
        <div><span>Secured</span><strong>100%</strong></div>
        <div><span>Critical / high</span><strong>₹64.5 Cr</strong></div>
        <div><span>Due in 12 months</span><strong>₹28.5 Cr</strong></div>
      </div>

      {showImportForm ? (
        <Panel title="Portfolio import" description="Upload a CSV to create counterparties and exposures">
          <form action="/api/imports/portfolio" encType="multipart/form-data" method="post" className="import-form">
            <label className="form-field">
              <span>CSV file</span>
              <input accept=".csv,text/csv" name="file" type="file" />
            </label>
            <label className="form-field">
              <span>Sample format</span>
              <textarea
                defaultValue="issuer,isin,outstanding,maturity,rating,security,sector\nSuryodaya Finance Limited,INE982X07124,36.0,14 Feb 2027,BBB- / Negative,Secured,NBFC"
                name="sample"
                readOnly
              />
            </label>
            <button className="button" type="submit">
              Upload and validate
            </button>
          </form>
        </Panel>
      ) : null}

      <section className="detail-grid">
        <Panel title="Demo import flow" description="The upload path to show during a live walkthrough">
          <div className="demo-steps compact">
            <div className="demo-step">
              <span className="demo-step-number">1</span>
              <span className="demo-step-copy">
                <strong>Upload CSV</strong>
                <small>Use the sample portfolio template and file picker.</small>
              </span>
            </div>
            <div className="demo-step">
              <span className="demo-step-number">2</span>
              <span className="demo-step-copy">
                <strong>Validate rows</strong>
                <small>Show row-level checks and import warnings before processing.</small>
              </span>
            </div>
            <div className="demo-step">
              <span className="demo-step-number">3</span>
              <span className="demo-step-copy">
                <strong>Create exposures</strong>
                <small>Highlight deterministic counterparty matching and exposure creation.</small>
              </span>
            </div>
            <div className="demo-step">
              <span className="demo-step-number">4</span>
              <span className="demo-step-copy">
                <strong>Open a detail page</strong>
                <small>Pivot into a live issuer profile or NCD monitoring cockpit.</small>
              </span>
            </div>
          </div>
        </Panel>

        <Panel title="Import preview" description="Mock states that make the upload feel real">
          <div className="coverage-list">
            <div><Upload aria-hidden="true" size={17} /><span><strong>Template download</strong><small>Sample CSV available to pilot users.</small></span></div>
            <div><SlidersHorizontal aria-hidden="true" size={17} /><span><strong>Validation preview</strong><small>Required columns and bad rows surfaced before commit.</small></span></div>
            <div><Download aria-hidden="true" size={17} /><span><strong>Completion summary</strong><small>Created, updated, and rejected counts visible after import.</small></span></div>
          </div>
        </Panel>
      </section>

      <Panel title="Exposure register" description="Live data from Supabase">
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
              {exposures.map((row) => (
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
