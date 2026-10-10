export type PaddleFailureStage = "paddle_config" | "paddle_transactions" | "paddle_adjustments";

export type PaddleFailure = {
  stage: PaddleFailureStage;
  name: string;
  code: string;
  status: number | null;
  paddleCode: string | null;
};

export type PaddleGetClient = {
  get: (url: string, queryParams?: unknown) => Promise<unknown>;
};

const DETAIL = Symbol("paddleFailure");

const STAGES = new Set<PaddleFailureStage>(["paddle_config", "paddle_transactions", "paddle_adjustments"]);
const NAMES = new Set(["Error", "TypeError", "SyntaxError", "ApiError", "RangeError"]);
const CODES = new Set([
  "PADDLE_CONFIG_MISSING",
  "PADDLE_ENVIRONMENT_INVALID",
  "PADDLE_CONFIG_INVALID",
  "PADDLE_PRODUCT_ID_INVALID",
  "PADDLE_API_ERROR",
  "PADDLE_REQUEST_FAILED",
  "PADDLE_RESPONSE_INVALID",
  "PADDLE_UNKNOWN",
  "start_invalid",
  "end_invalid",
  "range_invalid",
]);

function leaked(value: string) {
  const lower = value.toLowerCase();
  return (
    lower.includes("authorization") ||
    lower.includes("bearer") ||
    lower.includes("paddle_api_key") ||
    lower.includes("cron_secret") ||
    lower.includes("@") ||
    lower.includes("txn_") ||
    lower.includes("pdl_") ||
    lower.includes("ctm_") ||
    lower.includes("adj_") ||
    lower.includes("apikey") ||
    /\s/.test(value)
  );
}

function validStatus(value: unknown): number | null {
  return typeof value === "number" && Number.isInteger(value) && value >= 100 && value <= 599 ? value : null;
}

function normalizeCode(code: string) {
  const mapped = code === "PADDLE_CONFIG_INVALID" ? "PADDLE_PRODUCT_ID_INVALID" : code;
  return CODES.has(mapped) && !leaked(mapped) ? mapped : "PADDLE_UNKNOWN";
}

function normalizePaddleCode(code: string | null) {
  if (!code || code.length > 64 || !/^[a-z][a-z0-9_]+$/.test(code) || leaked(code)) return null;
  return code;
}

function normalizeName(name: string) {
  return NAMES.has(name) && !leaked(name) ? name : "Error";
}

function publishPaddleFailure(input: PaddleFailure): PaddleFailure {
  return {
    stage: STAGES.has(input.stage) ? input.stage : "paddle_config",
    name: normalizeName(input.name),
    code: normalizeCode(input.code),
    status: validStatus(input.status),
    paddleCode: normalizePaddleCode(input.paddleCode),
  };
}

function readDetail(error: unknown): PaddleFailure | null {
  if (!error || typeof error !== "object") return null;
  const value = (error as Record<symbol, unknown>)[DETAIL];
  if (!value || typeof value !== "object") return null;
  const failure = value as Partial<PaddleFailure>;
  if (typeof failure.stage !== "string" || typeof failure.code !== "string") return null;
  return publishPaddleFailure({
    stage: failure.stage as PaddleFailureStage,
    name: typeof failure.name === "string" ? failure.name : "Error",
    code: failure.code,
    status: failure.status ?? null,
    paddleCode: typeof failure.paddleCode === "string" ? failure.paddleCode : null,
  });
}

function numericStatus(error: unknown) {
  if (!error || typeof error !== "object") return null;
  const record = error as { status?: unknown; statusCode?: unknown };
  return validStatus(record.status) ?? validStatus(record.statusCode);
}

export function diagnosticError(input: PaddleFailure) {
  const failure = publishPaddleFailure(input);
  const error = new Error(failure.code);
  error.name = failure.name;
  Object.defineProperty(error, DETAIL, { value: failure });
  return error;
}

export function withStage(error: unknown, stage: PaddleFailureStage) {
  const existing = readDetail(error);
  if (existing) return error instanceof Error ? error : diagnosticError(existing);
  return diagnosticError({
    stage,
    name: error instanceof Error ? error.name : "Error",
    code: error instanceof Error ? error.message : "PADDLE_UNKNOWN",
    status: numericStatus(error),
    paddleCode: null,
  });
}

function paddleErrorBody(response: unknown): { code?: unknown } | null {
  if (!response || typeof response !== "object" || !("error" in response)) return null;
  const body = (response as { error?: unknown }).error;
  if (!body || typeof body !== "object") return null;
  return body as { code?: unknown };
}

function readHttpStatus(response: unknown): number | null {
  if (!response || typeof response !== "object") return null;
  for (const key of Object.getOwnPropertySymbols(response)) {
    const nested = (response as Record<symbol, unknown>)[key];
    if (!nested || typeof nested !== "object") continue;
    const status = validStatus((nested as { status?: unknown }).status);
    if (status !== null) return status;
  }
  return validStatus((response as { status?: unknown }).status);
}

export function capturePaddleHttpErrors(client: PaddleGetClient, stage: () => PaddleFailureStage) {
  const original = client.get.bind(client);
  client.get = async (url: string, queryParams?: unknown) => {
    let response: unknown;
    try {
      response = await original(url, queryParams);
    } catch (error) {
      if (readDetail(error)) throw error;
      throw diagnosticError({
        stage: stage(),
        name: error instanceof Error ? error.name : "Error",
        code: error instanceof SyntaxError ? "PADDLE_RESPONSE_INVALID" : "PADDLE_REQUEST_FAILED",
        status: numericStatus(error),
        paddleCode: null,
      });
    }
    if (paddleErrorBody(response)) {
      const code = paddleErrorBody(response)?.code;
      throw diagnosticError({
        stage: stage(),
        name: "ApiError",
        code: "PADDLE_API_ERROR",
        status: readHttpStatus(response),
        paddleCode: typeof code === "string" ? code : null,
      });
    }
    return response;
  };
}

export function publicPaddleFailure(error: unknown, fallbackStage: PaddleFailureStage = "paddle_config"): PaddleFailure {
  return (
    readDetail(error) ??
    publishPaddleFailure({
      stage: fallbackStage,
      name: error instanceof Error ? error.name : "Error",
      code: error instanceof Error ? error.message : "PADDLE_UNKNOWN",
      status: numericStatus(error),
      paddleCode: null,
    })
  );
}

export function paddleFailedResponse(error: unknown, fallbackStage?: PaddleFailureStage) {
  return { ok: false as const, error: "paddle_failed" as const, ...publicPaddleFailure(error, fallbackStage) };
}

export function logPaddleFailure(failure: PaddleFailure) {
  const safe = publishPaddleFailure(failure);
  console.error("[operations:paddle]", {
    stage: safe.stage,
    name: safe.name,
    code: safe.code,
    status: safe.status,
    paddleCode: safe.paddleCode,
  });
}
