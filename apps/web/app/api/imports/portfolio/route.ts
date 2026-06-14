import { NextResponse } from "next/server";
import { importPortfolioCsv } from "../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "A CSV file is required." }, { status: 400 });
  }

  const csvText = await file.text();
  await importPortfolioCsv({
    csvText,
    filename: file.name || "portfolio.csv"
  });

  return NextResponse.redirect(new URL("/portfolio?import=success", request.url));
}
