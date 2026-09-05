export const DEFAULT_AI_MODEL = "gpt-5.6-luna";
export const AI_MAX_OUTPUT_TOKENS = 500;
export const AI_PROVIDER_TIMEOUT_MS = 12_000;
export const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
export const OPENAI_SITE_CAP_SCOPE = "openai_daily_cap";

export function parseOpenAiDailyCap(env: Record<string, string | undefined> = process.env): number | null {
  const raw = env.AI_OPENAI_DAILY_CAP;
  if (raw == null || !String(raw).trim()) return null;
  const n = Number(String(raw).trim());
  if (!Number.isInteger(n) || n < 0) return null;
  return n;
}

export function extractResponsesText(payload: unknown): string {
  if (!payload || typeof payload !== "object") return "";
  const rec = payload as Record<string, unknown>;
  if (typeof rec.output_text === "string" && rec.output_text.trim()) return rec.output_text.trim();
  if (!Array.isArray(rec.output)) return "";
  const parts: string[] = [];
  for (const item of rec.output) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    if (typeof row.text === "string" && row.text.trim()) parts.push(row.text.trim());
    if (!Array.isArray(row.content)) continue;
    for (const cell of row.content) {
      if (!cell || typeof cell !== "object") continue;
      const piece = cell as Record<string, unknown>;
      if (typeof piece.text === "string" && piece.text.trim()) parts.push(piece.text.trim());
    }
  }
  return parts.join("\n").trim();
}

export type OpenAiTutorResult =
  | { ok: true; text: string }
  | { ok: false; reason: "network" | "http" | "timeout" | "empty" | "invalid" };

export async function requestOpenAiTutor(opts: {
  apiKey: string;
  prompt: string;
  model?: string;
  timeoutMs?: number;
  fetch?: typeof fetch;
}): Promise<OpenAiTutorResult> {
  const timeoutMs = opts.timeoutMs ?? AI_PROVIDER_TIMEOUT_MS;
  const fetchFn = opts.fetch ?? fetch;
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);
  try {
    const res = await fetchFn(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${opts.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: opts.model || DEFAULT_AI_MODEL,
        input: opts.prompt,
        max_output_tokens: AI_MAX_OUTPUT_TOKENS,
        temperature: 0.2,
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
