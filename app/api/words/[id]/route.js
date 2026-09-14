import { ApiError, apiError, readJson } from "../../../../lib/api.js";
import { prisma } from "../../../../lib/prisma.js";
import { wordSchema, parsePositiveId } from "../../../../lib/validation.js";
import { updateWordData } from "../../../../lib/words.js";

async function wordId(params) {
  const { id } = await params;

  try {
    return parsePositiveId(id);
  } catch {
    throw new ApiError("Invalid word ID", 400);
  }
}

export async function PUT(request, { params }) {
  try {
    const id = await wordId(params);
    const input = await readJson(request, wordSchema);
    const word = await prisma.word.update({
      where: { id },
      data: updateWordData(input),
    });

    return Response.json(word);
  } catch (error) {
    return apiError(error);
  }
}

export async function DELETE(_request, { params }) {
  try {
    const id = await wordId(params);
    await prisma.word.delete({ where: { id } });

    return Response.json({ success: true });
  } catch (error) {
    return apiError(error);
  }
}
