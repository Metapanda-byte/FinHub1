import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown) {
  console.error("[API Error]", error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof Error) {
    // Don't expose internal error messages in production
    const message =
      process.env.NODE_ENV === "production"
        ? "An unexpected error occurred"
        : error.message;

    return NextResponse.json(
      {
        error: message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      error: "An unexpected error occurred",
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export function createApiResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}