import { FileBarChart } from "lucide-react";
import { PageHeader, Panel } from "../../components/workspace-ui";

export const metadata = { title: "Reports" };

export default function ReportsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Committee reporting"
        title="Reports"
        description="Prepare portfolio packs, alert summaries, and evidence-backed credit committee memos."
      />
      <Panel title="Reports are scheduled for the next product slice">
        <div className="empty-state large">
          <FileBarChart aria-hidden="true" size={28} />
          <strong>No generated reports yet</strong>
          <p>Committee memo and portfolio exports will use the exposure, evidence, alert, and decision records.</p>
        </div>
      </Panel>
    </>
  );
}
