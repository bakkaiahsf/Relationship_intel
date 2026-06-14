import { getWorkspaceData } from "../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { exposures } = await getWorkspaceData();
  const header = ["Issuer", "ISIN", "Outstanding", "Maturity", "Rating", "Security", "Risk"].join(",");
  const rows = exposures.map((row) =>
    [
      row.issuer,
      row.isin,
      row.outstanding,
      row.maturity,
      row.rating,
      row.security,
      row.risk
    ]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Disposition": 'attachment; filename="portfolio-export.csv"',
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
