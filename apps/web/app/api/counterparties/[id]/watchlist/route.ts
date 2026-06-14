import { NextResponse } from "next/server";
import { toggleCounterpartyWatchlist } from "../../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await toggleCounterpartyWatchlist(id);
  const referer = request.headers.get("referer");
  return NextResponse.redirect(new URL(referer ?? `/entities/${id}`, request.url));
}
