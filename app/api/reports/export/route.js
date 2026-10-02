import { apiError } from "../../../../lib/api.js";
import { prisma } from "../../../../lib/prisma.js";
import { getReport, parseReportFilters } from "../../../../lib/reporting.js";
import { reportToCsv } from "../../../../lib/report-csv.js";
export const dynamic = "force-dynamic";
export async function GET(request) {
  try {
    const now = new Date();
    const report = await getReport(
      prisma,
      parseReportFilters(new URL(request.url).searchParams, now),
      now,
    );
    return new Response(reportToCsv(report), {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="activity-report.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return apiError(e);
  }
}
