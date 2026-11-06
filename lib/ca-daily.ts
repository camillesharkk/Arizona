import type { CaCheck } from "@/lib/ca-daily-shape";
import { dailyStudyView } from "@/lib/daily-study";
import { getStore } from "@/lib/store";

function checksFrom(raw: unknown): Record<string, CaCheck> {
  if (!raw || typeof raw !== "object" || !("checks" in raw)) return {};
  const checks = (raw as { checks?: unknown }).checks;
  if (!checks || typeof checks !== "object") return {};
  const out: Record<string, CaCheck> = {};
  for (const [id, value] of Object.entries(checks)) {
    if (!value || typeof value !== "object") continue;
    const row = value as Partial<CaCheck>;
    const wrongIds = Array.isArray(row.wrongIds) ? row.wrongIds.filter((item) => typeof item === "string") : [];
    out[id] = {
      wrong: typeof row.wrong === "number" ? row.wrong : wrongIds.length,
      skipped: typeof row.skipped === "number" ? row.skipped : 0,
      wrongIds,
    };
  }
  return out;
}

export async function saveCaExamCheck(userId: string, examId: string, input: { wrongIds: string[]; skipped: number }) {
  const store = await getStore();
  const row = await store.getStudyPlan(userId, "CA");
  const raw = row?.document && typeof row.document === "object" ? { ...(row.document as Record<string, unknown>) } : {};
  const checks = checksFrom(raw);
  const prev = checks[examId];
  if (prev?.wrongIds.length && input.wrongIds.length === 0) return;
  checks[examId] = { wrong: input.wrongIds.length, skipped: input.skipped, wrongIds: input.wrongIds };
  await store.saveStudyPlan({ userId, state: "CA", document: { ...raw, checks } });
}

export async function caDailyView(userId: string, timeZoneHint?: string, now = new Date().toISOString()) {
  return dailyStudyView(userId, timeZoneHint, now, "CA");
}
