import { NextResponse } from "next/server";
import { assignAlertByDemoId } from "../../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await assignAlertByDemoId(id);
  const referer = request.headers.get("referer");
  return NextResponse.redirect(new URL(referer ?? `/alerts/${id}`, request.url));
}
