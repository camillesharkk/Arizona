import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { getIndianaEntitlement } from "@/lib/entitlements";
import { productionStateBlocked } from "@/lib/state-release";
import { ensureIndianaGuest, readIndianaGuest, indianaGuestSitting } from "@/lib/indiana-guest";
import { indianaSittingQuestions, readIndianaSitting, startIndianaSitting, validateIndianaAnswers, type IndianaSitting } from "@/lib/indiana-sitting";
import { savePackFullSubmission } from "@/lib/ny-full-submission";
import { recordProUsage } from "@/lib/commerce/usage";

const headers = { "Cache-Control": "private, no-store" };
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), examId: z.string().uuid().optional(), accountId: z.string().min(1).optional() }),
  z.object({ action: z.enum(["submit", "import"]), examId: z.string().uuid(), accountId: z.string().min(1).optional(), timeZone: z.string().max(80).optional(),
    questions: z.array(z.object({ questionId: z.string().max(80), questionVersion: z.number().int().positive(), selected: z.enum(["A", "B", "C", "D"]).optional() })).length(30) }),
]);
function blocked() {
  return productionStateBlocked("IN") ? NextResponse.json({ error: "State not available" }, { status: 404 }) : null;
}
function view(sitting: IndianaSitting) {
  return { ...sitting, questions: indianaSittingQuestions(sitting) };
}
function failed(error: unknown) {
  const code = error instanceof Error ? error.message : "";
  if (code === "full_trial_used") return NextResponse.json({ error: "The free Indiana full practice is already used", code }, { status: 402 });
  if (code === "pro_required") return NextResponse.json({ error: "Indiana Pro is required for this sitting", code }, { status: 402 });
  if (code === "question_updated") return NextResponse.json({ error: "Question updated; reload this sitting", code }, { status: 409 });
  if (code === "invalid_exam") return NextResponse.json({ error: "Invalid exam", code }, { status: 400 });
  throw error;
}
export async function GET() {
  const unavailable = blocked();
  if (unavailable) return unavailable;
  try {
    const session = await getSession();
    if (session) {
      const store = await getStore();
      const sitting = await readIndianaSitting(store, session.id);
      if (sitting?.pro && !await getIndianaEntitlement(session.id)) throw new Error("pro_required");
      const exam = sitting ? (await store.listExams(session.id)).find(exam => exam.id === sitting.examId) : undefined;
      return NextResponse.json(sitting ? { ...view(sitting), ...(exam ? { done: true, exam } : {}) } : { sitting: null }, { headers });
    }
    const guest = await ensureIndianaGuest();
    const saved = await (await getStore()).getGuestExam(guest.owner, "IN");
    return NextResponse.json(saved ? { ...view(saved.sitting as IndianaSitting), ...(saved.result ? { done: true, exam: saved.result } : {}) } : { sitting: null }, { headers });
  } catch (error) { return failed(error); }
}
export async function POST(request: Request) {
  const unavailable = blocked();
  if (unavailable) return unavailable;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
  const input = parsed.data;
  try {
    const session = await getSession();
    if (input.accountId && input.accountId !== session?.id) return NextResponse.json({ error: "Account changed" }, { status: 409 });
    const store = await getStore();
    if (session) {
      if (input.action === "start") {
        const guest = await readIndianaGuest();
        const saved = guest && input.examId ? await store.getGuestExam(guest.owner, "IN") : null;
        const adopt = saved && !saved.result && saved.examId === input.examId ? saved.sitting as IndianaSitting : undefined;
        return NextResponse.json(view(await startIndianaSitting(store, session.id, input.examId, adopt)), { headers });
      }
      let guestSitting: IndianaSitting | undefined;
      if (input.action === "import") {
        const guest = await readIndianaGuest();
        const saved = guest ? await store.getGuestExam(guest.owner, "IN") : null;
        const original = (saved?.result as { answers?: typeof input.questions } | null)?.answers;
        const clean = (answers: typeof input.questions) => answers.map(({ questionId, questionVersion, selected }) => ({ questionId, questionVersion, selected }));
        if (!saved || saved.examId !== input.examId || !saved.result || !original || JSON.stringify(clean(original)) !== JSON.stringify(clean(input.questions))) throw new Error("invalid_exam");
        guestSitting = saved.sitting as IndianaSitting;
        validateIndianaAnswers(guestSitting, input.questions);
      }
      const { proUsage, ...result } = await savePackFullSubmission(store, session.id, { ...input, state: "IN", guestSitting });
      if (proUsage) await recordProUsage(session.id, proUsage.featureCode, proUsage, "IN");
      return NextResponse.json(result, { headers });
    }
    if (input.action === "import") throw new Error("invalid_exam");
    const guest = await ensureIndianaGuest();
    if (input.action === "start") {
      const sitting = indianaGuestSitting(guest);
      // The primary key reserves one immutable sitting per signed browser identity.
      // Cookie/localStorage replay resumes this row; a new browser is a new visitor.
      const saved = await store.reserveGuestExam({ owner: guest.owner, state: "IN", examId: sitting.examId, sitting });
      if (saved.result) throw new Error("full_trial_used");
      return NextResponse.json(view(saved.sitting as IndianaSitting), { headers });
    }
    const saved = await store.getGuestExam(guest.owner, "IN");
    if (!saved || input.examId !== saved.examId) throw new Error("invalid_exam");
    if (saved.result) return NextResponse.json({ ok: true, duplicate: true, exam: saved.result }, { headers });
    const sitting = saved.sitting as IndianaSitting;
    const questions = validateIndianaAnswers(sitting, input.questions);
    const correctCount = questions.filter((question, index) => input.questions[index].selected === question.correct_option).length;
    const exam = { id: input.examId, mode: "in-full", score: Math.round(correctCount / 30 * 100), correctCount, total: 30, at: sitting.startedAt, answers: input.questions };
    const result = await store.finishGuestExam(guest.owner, "IN", input.examId, exam);
    return NextResponse.json({ ok: true, duplicate: result.duplicate, exam: result.row.result }, { headers });
  } catch (error) { return failed(error); }
}
