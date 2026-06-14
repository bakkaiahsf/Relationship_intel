import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PageHeader, Panel } from "../../../components/workspace-ui";

export const metadata = { title: "Add Counterparty" };
export const dynamic = "force-dynamic";

export default function NewCounterpartyPage() {
  return (
    <>
      <Link className="back-link" href="/entities">
        <ArrowLeft size={15} /> Counterparties
      </Link>
      <PageHeader
        eyebrow="Business identity"
        title="Add counterparty"
        description="Create a new issuer, borrower, guarantor, or vendor and start monitoring evidence."
      />
      <Panel title="Counterparty details" description="Required fields for the first demo slice">
        <form action="/api/counterparties" method="post" className="import-form">
          <label className="form-field">
            <span>Legal name</span>
            <input name="legalName" placeholder="Maitri Infrastructure Pvt Ltd" required />
          </label>
          <label className="form-field">
            <span>Counterparty type</span>
            <select name="type" required>
              <option value="issuer">Issuer</option>
              <option value="borrower">Borrower</option>
              <option value="guarantor">Guarantor</option>
              <option value="vendor">Vendor</option>
              <option value="group_company">Group company</option>
            </select>
          </label>
          <label className="form-field">
            <span>CIN</span>
            <input name="cin" placeholder="U45203GJ2010PTC061429" required />
          </label>
          <label className="form-field">
            <span>GSTIN</span>
            <input name="gstin" placeholder="24AAHCM9014C1ZP" required />
          </label>
          <label className="form-field">
            <span>Sector</span>
            <input name="sector" placeholder="Infrastructure" required />
          </label>
          <label className="form-field">
            <span>Risk severity</span>
            <select name="riskSeverity" required>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </label>
          <button className="button" type="submit">
            Create counterparty
          </button>
        </form>
      </Panel>
    </>
  );
}
