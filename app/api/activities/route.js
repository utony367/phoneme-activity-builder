import { apiError, readJson } from "../../../lib/api.js";
import { prisma } from "../../../lib/prisma.js";
import { activitySchema } from "../../../lib/validation.js";

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      include: { words: true },
      orderBy: { updatedAt: "desc" },
    });

    return Response.json(activities);
  } catch (error) {
    return apiError(error);
  }
}

export async function POST(request) {
  try {
    const data = await readJson(request, activitySchema);
    const activity = await prisma.activity.create({ data });

    return Response.json(activity, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
