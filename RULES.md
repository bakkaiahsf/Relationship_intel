# Development Rules

## Coding

- Use strict TypeScript.
- Keep secrets and privileged operations server-side.
- Prefer reusable components and explicit module boundaries.
- Validate external input.
- Avoid overengineering.

## Architecture

- Keep vendor SDKs behind adapters in `packages/`.
- Depend on interfaces from application code where practical.
- Make optional integrations fail closed with actionable messages.
- Do not couple shared packages to a deployment provider.

## India NCD risk product

- Treat RIVR as a monitoring and decision-support platform unless a later PR explicitly adds regulated lending, marketplace, or distribution workflows.
- Do not generate independent AI risk scores; AI may summarize stored evidence and rule outputs only.
- Complete the evidence-backed core workflow before adding AI summaries or WhatsApp delivery.
- Keep GST, MCA, PAN, Udyam, insolvency, rating, bureau, and notification providers behind server-side adapters.
- Store normalized risk facts separately from raw provider payload references.
- Link every alert to source evidence, timestamp, provider, and rule version.
- Keep evidence snapshots and monitoring events append-only.
- Make imports, verification requests, monitoring runs, and alert transitions idempotent and auditable.
- Mask PAN and personal identifiers by default in UI and logs.
- Do not pull credit bureau, account aggregator, CKYC, or bank data without validated purpose, consent, provider contract, and server-side access controls.

## Supabase

- Use Row Level Security for exposed tables.
- Create timestamped migrations.
- Never expose the service-role key in frontend bundles.
- Document schema and rollback implications.
- Do not run remote migrations without approval.

## Vercel

- Use `.env.local` locally and Vercel environment variables remotely.
- Use preview deployments before production.
- Require `npm run check` to pass before deployment.
- Do not change production domains, production environment variables, billing, or deployment aliases without approval.
- Prefer Vercel Cron for simple monitoring jobs and an external durable workflow provider only when retries or long-running orchestration are required.

## Git and agents

- Use feature branches and focused commits.
- Do not commit generated secrets, `.env.local`, or provider state.
- Explain scope before large refactors.
- Prefer a minimal complete version before enhancements.
- Update `README.md`, `docs/TASKS.md`, and `.env.example` when setup changes.
