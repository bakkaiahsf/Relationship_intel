import { PageHeader, Panel, StatusBadge } from "../../components/workspace-ui";

export const metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workspace administration"
        title="Settings"
        description="Organization configuration, roles, providers, monitoring policy, and audit controls."
      />
      <Panel title="Provider status" description="Current connector selection">
        <dl className="detail-list">
          <div><dt>Supabase</dt><dd><StatusBadge status="Connected" /></dd></div>
          <div><dt>OpenAI</dt><dd><StatusBadge status="Connected" /></dd></div>
          <div><dt>KYB provider</dt><dd><StatusBadge status="Mock" /></dd></div>
          <div><dt>Email provider</dt><dd><StatusBadge status="Mock" /></dd></div>
          <div><dt>WhatsApp provider</dt><dd><StatusBadge status="Deferred" /></dd></div>
        </dl>
      </Panel>
    </>
  );
}
