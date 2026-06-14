import { NextResponse } from "next/server";
import { createVerificationSnapshot } from "../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ source: string }> }
) {
  const { source } = await params;
  const formData = await request.formData();
  const counterpartyId = String(formData.get("counterpartyId") ?? "").trim();
  if (!counterpartyId) {
    return NextResponse.json({ error: "counterpartyId is required." }, { status: 400 });
  }

  await createVerificationSnapshot({
    counterpartyDemoId: counterpartyId,
    source: source as "gst" | "mca" | "pan" | "udyam" | "rating" | "ibc" | "manual"
  });

  const referer = request.headers.get("referer");
  return NextResponse.redirect(new URL(referer ?? `/entities/${counterpartyId}`, request.url));
}
