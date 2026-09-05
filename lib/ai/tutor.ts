import { getSource } from "../../data/sources.ts";
import { retrieveContext } from "../../data/rag.ts";
import { deliverTutorAnswer, utcAiDay } from "./quota.ts";
import { localTutor } from "./local-tutor.ts";
import {
  DEFAULT_AI_MODEL,
  PROVIDER_SITE_CAP_SCOPE,
  requestDeepSeekTutor,
  type AiProviderName,
} from "./provider.ts";
import { buildTutorInput, buildTutorInstructions, type TutorMode } from "./prompt.ts";
import type { Store } from "../store/types.ts";

export type TutorQuestion = {
  question_text: string;
  topic: string;
  source_id: string;
  correct_option: string;
  explanation: string;
  option_feedback: Record<string, string>;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
};

export async function runTutorTurn(opts: {
  store: Store;
  userId: string;
  limit: number;
  mode: TutorMode;
  question: TutorQuestion;
  selected?: string;
  day?: string;
  provider?: AiProviderName;
  apiKey?: string;
  model?: string;
  providerDailyCap?: number | null;
  fetch?: typeof fetch;
  timeoutMs?: number;
  onExceedFreeQuota?: (used: number) => Promise<void>;
}) {
  const day = opts.day ?? utcAiDay();
  const q = opts.question;
  const src = getSource(q.source_id);
  const context = retrieveContext(q.topic, q.question_text, q.source_id);
  const promptInput = {
    mode: opts.mode,
    questionText: q.question_text,
    optionA: q.option_a,
    optionB: q.option_b,
    optionC: q.option_c,
    optionD: q.option_d,
    correctOption: q.correct_option,
    selected: opts.selected,
    context,
    pinCite: src.reference,
  };
  const instructions = buildTutorInstructions(opts.mode, src.reference);
  const input = buildTutorInput(promptInput);

  let text = "";
  let provider: "deepseek" | "grounded-fallback" = "grounded-fallback";
  const key = String(opts.apiKey || "").trim();
  const useDeepSeek = (opts.provider ?? "local") === "deepseek" && Boolean(key);

  if (useDeepSeek) {
    let reserved: { ok: boolean; token: string | null } = { ok: true, token: null };
    if (opts.providerDailyCap != null) {
      reserved = await opts.store.consumeSiteQuota(PROVIDER_SITE_CAP_SCOPE, day, opts.providerDailyCap);
    }
    if (reserved.ok) {
      const result = await requestDeepSeekTutor({
        apiKey: key,
        instructions,
        input,
        model: opts.model || DEFAULT_AI_MODEL,
        fetch: opts.fetch,
        timeoutMs: opts.timeoutMs,
      });
      if (result.ok) {
        text = result.text;
        provider = "deepseek";
      } else if (reserved.token) {
        await opts.store.releaseSiteQuota(PROVIDER_SITE_CAP_SCOPE, day, reserved.token);
      }
    }
  }

  if (!text.trim()) {
    text = localTutor(opts.mode, q, opts.selected, context, src.reference);
    provider = "grounded-fallback";
  }

  const delivered = await deliverTutorAnswer({
    store: opts.store,
    userId: opts.userId,
    limit: opts.limit,
    text,
    day,
    onExceedFreeQuota: opts.onExceedFreeQuota,
  });
  if (!delivered.ok) return delivered;
  return { ...delivered, text, provider };
}
