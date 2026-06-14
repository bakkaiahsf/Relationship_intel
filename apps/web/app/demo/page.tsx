import { CheckCircle2, PlayCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { PageHeader, Panel, StatusBadge } from "../../components/workspace-ui";
import { demoChecklist, demoStats } from "../../lib/mock-data";

export const metadata = { title: "Demo flow" };

export default function DemoPage() {
  return (
    <>
      <PageHeader
        eyebrow="Demo walkthrough"
        title="Demo-ready operating flow"
        description="Use this path to show the full credit-risk story without leaving the product."
        actions={
          <>
            <Link className="button button-secondary" href="/portfolio">
              Start on portfolio
            </Link>
            <Link className="button" href="/alerts/ALT-2048">
              Open critical alert
            </Link>
          </>
        }
      />

      <section className="metric-grid" aria-label="Demo stats">
        {demoStats.map((stat) => (
          <article className="metric-card" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <div className="metric-change change-flat">
              <CheckCircle2 aria-hidden="true" size={14} />
              <span>{stat.note}</span>
            </div>
          </article>
        ))}
      </section>

      <section className="detail-grid">
        <Panel title="Demo script" description="Click these pages in order during the walkthrough">
          <div className="demo-steps">
            {demoChecklist.map((step, index) => (
              <Link className="demo-step" href={step.route} key={step.route}>
                <span className="demo-step-number">{index + 1}</span>
              <span className="demo-step-copy">
                <strong>{step.step}</strong>
                <small>{step.summary}</small>
              </span>
              <StatusBadge status={step.status} />
            </Link>
          ))}
        </div>
        </Panel>

        <Panel title="Talk track" description="What to say as each screen changes">
          <div className="talk-track">
            <div>
              <PlayCircle aria-hidden="true" size={18} />
              <p>Import a portfolio and show the table-based portfolio register.</p>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" size={18} />
              <p>Open an issuer profile and explain how evidence, identifiers, and freshness are kept together.</p>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" size={18} />
              <p>Open the exposure cockpit and show how alerts are tied back to terms and covenant status.</p>
            </div>
            <div>
              <ShieldCheck aria-hidden="true" size={18} />
              <p>Finish on the critical alert and summarize the decision trail and audit posture.</p>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
