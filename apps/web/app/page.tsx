import { ButtonLink, FeatureCard } from "@accelerator/ui";

const capabilities = [
  ["Web", "Next.js App Router starter with strict TypeScript."],
  ["Mobile", "An Expo-ready workspace that can share domain packages."],
  ["Data", "Supabase migrations, RLS patterns, and provider adapters."],
  ["Delivery", "Codex skills, test gates, and deployment checklists."]
] as const;

export default function Home() {
  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Codex AI Accelerator Kit</p>
        <h1>From product requirements to a reviewable MVP.</h1>
        <p className="lede">
          Replace the PRD, connect only the services you need, and use Codex
          workflows to build, test, and prepare a deployment.
        </p>
        <div className="actions">
          <ButtonLink href="https://developers.openai.com/codex">
            Codex documentation
          </ButtonLink>
          <ButtonLink href="/api/health" variant="secondary">
            Health endpoint
          </ButtonLink>
        </div>
      </section>

      <section className="grid" aria-label="Accelerator capabilities">
        {capabilities.map(([title, description]) => (
          <FeatureCard key={title} title={title}>
            {description}
          </FeatureCard>
        ))}
      </section>

      <section className="workflow">
        <p className="eyebrow">Start here</p>
        <ol>
          <li>Replace PRD.md with your product requirements.</li>
          <li>Review RULES.md and configure .env.local.</li>
          <li>Ask Codex to build the MVP from the PRD.</li>
          <li>Run npm run check before a preview deployment.</li>
        </ol>
      </section>
    </main>
  );
}
