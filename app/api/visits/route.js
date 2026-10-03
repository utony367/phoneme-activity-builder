import { apiError, readJson } from "../../../lib/api.js";
import { prisma } from "../../../lib/prisma.js";
import { visitSchema } from "../../../lib/telemetry-validation.js";
import { upsertVisit } from "../../../lib/telemetry.js";
export async function POST(request) {
  try {
    await upsertVisit(prisma, await readJson(request, visitSchema));
    return Response.json({ status: "recorded" });
  } catch (error) {
    return apiError(error);
  }
}
