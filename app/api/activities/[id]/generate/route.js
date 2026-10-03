import { recordGeneration } from "../../../../../lib/telemetry.js";
import { ApiError, apiError } from "../../../../../lib/api.js";
import { generateActivityHtml } from "../../../../../lib/generators/index.js";
import { prisma } from "../../../../../lib/prisma.js";
import { parsePositiveId } from "../../../../../lib/validation.js";

async function activityId(params) {
  const { id } = await params;
  try {
    return parsePositiveId(id);
  } catch {
    throw new ApiError("Invalid activity ID", 400);
  }
}

function downloadFilename(title, id) {
  const stem = String(title ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return (stem || "phoneme-activity-" + id) + ".html";
}

async function generate(params) {
  const id = await activityId(params);
  const activity = await prisma.activity.findUnique({
    where: { id },
    include: { words: true },
  });
  if (!activity) throw new ApiError("Activity not found", 404);

  const start = performance.now();
  const snapshot = { activityId: id, activityTitle: activity.title, activityType: activity.activityType, source: activity.source || "LIVE" };
  let html;
  try {
    html = generateActivityHtml(activity);
  } catch (error) {
    await recordGeneration(prisma, { ...snapshot, outcome: "FAILURE", durationMs: Math.round(performance.now() - start), errorCategory: "INVALID_ACTIVITY", errorMessage: "Stored activity could not be generated. Check words and settings." });
    throw new ApiError(error instanceof Error ? error.message : "Unable to generate activity", 400);
  }

  await recordGeneration(prisma, { ...snapshot, outcome: "SUCCESS", durationMs: Math.round(performance.now() - start) });
  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": 'attachment; filename="' + downloadFilename(activity.title, id) + '"',
      "Cache-Control": "no-store",
    },
  });
}

export async function GET(_request, { params }) {
  try {
    return await generate(params);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(_request, { params }) {
  try {
    return await generate(params);
  } catch (error) {
    return apiError(error);
  }
}
