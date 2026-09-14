import { ApiError, apiError, readJson } from "../../../../lib/api.js";
import { prisma } from "../../../../lib/prisma.js";
import { activitySchema, parsePositiveId } from "../../../../lib/validation.js";

async function activityId(params) {
  const { id } = await params;

  try {
    return parsePositiveId(id);
  } catch {
    throw new ApiError("Invalid activity ID", 400);
  }
}

export async function GET(_request, { params }) {
  try {
    const id = await activityId(params);
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: { words: true },
    });

    if (!activity) {
      throw new ApiError("Activity not found", 404);
    }

    return Response.json(activity);
  } catch (error) {
    return apiError(error);
  }
}

export async function PUT(request, { params }) {
  try {
    const id = await activityId(params);
    const data = await readJson(request, activitySchema);
    const activity = await prisma.activity.update({
      where: { id },
      data,
    });

    return Response.json(activity);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = await activityId(params);
    await prisma.activity.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
