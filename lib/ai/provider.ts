export const DEFAULT_AI_MODEL = "deepseek-v4-flash";
export const AI_MAX_OUTPUT_TOKENS = 500;
export const AI_PROVIDER_TIMEOUT_MS = 12_000;
export const DEEPSEEK_RESPONSES_URL = "https://api.deepseek.com/responses";
export const PROVIDER_SITE_CAP_SCOPE = "ai_provider_daily_cap";

export type AiProviderName = "deepseek" | "local";

export function parseAiProvider(env: Record<string, string | undefined> = process.env): AiProviderName {
  const raw = String(env.AI_PROVIDER || "").trim().toLowerCase();
  return raw === "deepseek" ? "deepseek" : "local";
}

export function parseProviderDailyCap(env: Record<string, string | undefined> = process.env): number | null {
  const raw = env.AI_PROVIDER_DAILY_CAP;
  if (raw == null || !String(raw).trim()) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export function extractResponsesText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const rec = payload as Record<string, unknown>;
  if (!Array.isArray(rec.output)) return "";
  const parts: string[] = [];
  for (const item of rec.output) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (row.type === "reasoning") continue;
    if (row.type && row.type !== "message") continue;
    if (!Array.isArray(row.content)) continue;
    for (const cell of row.content) {
      if (!cell || typeof cell !== "object") continue;
      const piece = cell as Record<string, unknown>;
      if (piece.type === "reasoning") continue;
      if (piece.type && piece.type !== "output_text") continue;
      if (typeof piece.text === "string" && piece.text.trim()) parts.push(piece.text.trim());
    }
  }
  return parts.join("\n").trim();
}

export type DeepSeekTutorResult =
  | { ok: true; text: string }
  | { ok: false; reason: "network" | "http" | "timeout" | "empty" | "invalid" };

export async function requestDeepSeekTutor(opts: {
  apiKey: string;
  instructions: string;
  input: string;
  model?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}): Promise<DeepSeekTutorResult> {
  const timeoutMs = opts.timeoutMs ?? AI_PROVIDER_TIMEOUT_MS;
  const fetchFn = opts.fetch ?? fetch;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetchFn(DEEPSEEK_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model || DEFAULT_AI_MODEL,
        instructions: opts.instructions,
        input: opts.input,
        max_output_tokens: AI_MAX_OUTPUT_TOKENS,
        stream: false,
        reasoning: { effort: "none" },
      }),
      signal: ac.signal,
    });
    if (!res.ok) return { ok: false, reason: "http" };
    let json: unknown;
    try {
      json = await res.json();
    } catch {
      return { ok: false, reason: "invalid" };
    }
    const text = extractResponsesText(json);
    if (!text) return { ok: false, reason: "empty" };
    return { ok: true, text };
  } catch (err) {
    const name = err && typeof err === "object" && "name" in err ? String((err as { name?: string }).name) : "";
    if (name === "AbortError" || ac.signal.aborted) return { ok: false, reason: "timeout" };
    return { ok: false, reason: "network" };
  } finally {
    clearTimeout(timer);
  }
}
