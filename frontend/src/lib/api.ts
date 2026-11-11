import type { CalculateInput } from "./calculator";

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const invalidMessage = "The calculation service returned an invalid response.";
export async function calculate(
  input: CalculateInput,
  signal: AbortSignal,
): Promise<number> {
  const response = await fetch("/api/calculate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal,
  });
  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("INVALID_RESPONSE", invalidMessage, response.status);
  }
  if (!response.ok) {
    if (payload && typeof payload === "object" && "error" in payload) {
      const error = (
        payload as { error?: { code?: unknown; message?: unknown } }
      ).error;
      if (
        error &&
        typeof error.code === "string" &&
        error.code.trim() &&
        typeof error.message === "string" &&
        error.message.trim()
      ) {
        throw new ApiError(error.code, error.message, response.status);
      }
    }
    throw new ApiError("INVALID_RESPONSE", invalidMessage, response.status);
  }
  if (!payload || typeof payload !== "object" || !("result" in payload))
    throw new ApiError("INVALID_RESPONSE", invalidMessage, response.status);
  const result = (payload as { result: unknown }).result;
  if (typeof result !== "number" || !Number.isFinite(result))
    throw new ApiError("INVALID_RESPONSE", invalidMessage, response.status);
  return result;
}
