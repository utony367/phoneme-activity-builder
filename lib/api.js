export class ApiError extends Error {
  constructor(message, status = 500, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function readJson(request, schema) {
  let body;

  try {
    body = await request.json();
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new ApiError("Malformed JSON", 400);
    }

    throw error;
  }

  const result = schema.safeParse(body);
  if (!result.success) {
    throw new ApiError("Invalid request data", 400, result.error.flatten());
  }

  return result.data;
}

export function apiError(error) {
  if (error instanceof ApiError) {
    return Response.json(
      {
        error: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
      { status: error.status },
    );
  }

  if (error?.code === "P2002") {
    return Response.json({ error: "A duplicate record already exists" }, { status: 409 });
  }

  if (error?.code === "P2025") {
    return Response.json({ error: "Record not found" }, { status: 404 });
  }

  return Response.json({ error: "Internal server error" }, { status: 500 });
}
