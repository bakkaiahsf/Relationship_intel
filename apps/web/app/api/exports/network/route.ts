import { getWorkspaceData } from "../../../../lib/rivr-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const { relationships } = await getWorkspaceData();
  const header = ["Source", "Target", "Relationship", "Confidence", "Exposure"].join(",");
  const rows = relationships.map((row) =>
    [row.source, row.target, row.type, row.confidence, row.exposure]
      .map((value) => `"${String(value).replaceAll('"', '""')}"`)
      .join(",")
  );

  return new Response([header, ...rows].join("\n"), {
    headers: {
      "Content-Disposition": 'attachment; filename="relationship-network.csv"',
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
