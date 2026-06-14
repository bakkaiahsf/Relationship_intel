import { NextResponse } from "next/server";
import { createCounterpartyRecord } from "../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const legalName = String(formData.get("legalName") ?? "").trim();
  const type = String(formData.get("type") ?? "issuer").trim();
  const cin = String(formData.get("cin") ?? "").trim();
  const gstin = String(formData.get("gstin") ?? "").trim();
  const sector = String(formData.get("sector") ?? "").trim();
  const riskSeverity = String(formData.get("riskSeverity") ?? "low").trim() as
    | "critical"
    | "high"
    | "medium"
    | "low";

  if (!legalName || !cin || !gstin || !sector) {
    return NextResponse.json({ error: "Missing required counterparty fields." }, { status: 400 });
  }

  const counterparty = await createCounterpartyRecord({
    cin,
    gstin,
    legalName,
    riskSeverity,
    sector,
    type
  });

  const slug = String(counterparty.metadata.demo_id ?? counterparty.legal_name);
  return NextResponse.redirect(new URL(`/entities/${slug}`, request.url));
}
