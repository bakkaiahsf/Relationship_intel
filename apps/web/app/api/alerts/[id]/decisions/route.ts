import { NextResponse } from "next/server";
import { recordAlertDecisionByDemoId } from "../../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const decision = String(formData.get("decision") ?? "watch").trim() as
    | "continue"
    | "watch"
    | "freeze"
    | "exit"
    | "request_documents"
    | "committee_escalation";
  const notes = String(formData.get("notes") ?? "Decision recorded from the UI.").trim();

  await recordAlertDecisionByDemoId({
    decision,
    demoId: id,
    notes
  });

  const referer = request.headers.get("referer");
  return NextResponse.redirect(new URL(referer ?? `/alerts/${id}`, request.url));
}
