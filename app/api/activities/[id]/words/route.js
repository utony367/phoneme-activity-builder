import { ApiError, apiError, readJson } from "../../../../../lib/api.js";
import { prisma } from "../../../../../lib/prisma.js";
import { wordSchema, parsePositiveId } from "../../../../../lib/validation.js";
import { createWordData } from "../../../../../lib/words.js";

async function activityId(params) {
  const { id } = await params;

  try {
    return parsePositiveId(id);
  } catch {
    throw new ApiError("Invalid activity ID", 400);
  }
}

export async function POST(request, { params }) {
  try {
    const id = await activityId(params);
    const activity = await prisma.activity.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!activity) {
      throw new ApiError("Activity not found", 404);
    }

    const input = await readJson(request, wordSchema);
    const word = await prisma.word.create({
      data: createWordData(id, input),
    });

    return Response.json(word, { status: 201 });
  } catch (error) {
    return apiError(error);
  }
}
