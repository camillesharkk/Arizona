import { getSource } from "../../data/sources.ts";
import { retrieveContext } from "../../data/rag.ts";
import { deliverTutorAnswer, utcAiDay } from "./quota.ts";
import { localTutor } from "./local-tutor.ts";
import { normalizeTutorText } from "./plain-text.ts";
import {
  DEFAULT_AI_MODEL,
  PROVIDER_SITE_CAP_SCOPE,
  requestDeepSeekTutor,
  type AiProviderName,
} from "./provider.ts";
import { buildTutorInput, buildTutorInstructions, type TutorMode } from "./prompt.ts";
import type { Store } from "../store/types.ts";
import type { Question, StateCode } from "../types.ts";

export type TutorQuestion = {
  state?: StateCode;
  source_reference?: string;
  last_verified_at?: string;
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

/** Accept a displayed permutation only when every choice matches the stored question. */
export function tutorOptionOrder(question: Question, options?: string[]): Question | null {
  if (!options) return question;
  const letters = ["A", "B", "C", "D"] as const;
  const original = [question.option_a, question.option_b, question.option_c, question.option_d];
  const mapping = options.map(text => original.indexOf(text));
  if (mapping.length !== 4 || mapping.includes(-1) || new Set(mapping).size !== 4) return null;
  const correct = letters[mapping.indexOf(letters.indexOf(question.correct_option))];
  return {
    ...question, option_a: options[0], option_b: options[1], option_c: options[2], option_d: options[3],
    correct_option: correct,
    option_feedback: Object.fromEntries(letters.map((letter, index) => [letter, question.option_feedback[letters[mapping[index]]]])) as Question["option_feedback"],
  };
}

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
  const state = q.state || "AZ";
  const reference = state === "AZ" ? getSource(q.source_id).reference : q.source_reference || "Official reference unavailable";
  const context = state === "AZ" ? retrieveContext(q.topic, q.question_text, q.source_id)
    : [q.explanation, ...Object.entries(q.option_feedback).map(([letter, feedback]) => `${letter}. ${feedback}`), reference, `Verified ${q.last_verified_at || "date unavailable"}`].join("\n");
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
    pinCite: reference,
  };
  const instructions = buildTutorInstructions(opts.mode, reference, state);
  const input = buildTutorInput(promptInput);

  let text = "";
  let provider: "deepseek" | "grounded-fallback" = "grounded-fallback";
  let fallbackReason: string | undefined = opts.provider === "deepseek" ? "missing-key" : "local";
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
        fallbackReason = undefined;
      } else {
        fallbackReason = result.reason;
        if (reserved.token) await opts.store.releaseSiteQuota(PROVIDER_SITE_CAP_SCOPE, day, reserved.token);
      }
    } else {
      fallbackReason = "site-cap";
    }
  }

  if (!text.trim()) {
    text = localTutor(opts.mode, q, opts.selected, state === "AZ" ? context : reference, reference);
    provider = "grounded-fallback";
  }
  text = normalizeTutorText(text);

  const delivered = await deliverTutorAnswer({
    store: opts.store,
    userId: opts.userId,
    limit: opts.limit,
    text,
    day,
    onExceedFreeQuota: opts.onExceedFreeQuota,
  });
  if (!delivered.ok) return delivered;
  return { ...delivered, text, provider, fallbackReason };
}
