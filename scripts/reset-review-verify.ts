import { createMemoryStore } from "../lib/store/memory-store.ts";
import { completePasswordReset, verificationAfterPasswordReset } from "../lib/auth/password-reset.ts";
import { savedReviewStat } from "../lib/review-save.ts";
import { applyReviewAnswer, REVIEW_INTERVAL_DAYS } from "../lib/review-schedule.ts";
import { publishedQuestions } from "../data/questions.ts";
import type { QuestionStat } from "../lib/store/types.ts";

let failed = 0;
function check(name: string, ok: boolean) {
  if (ok) console.log("ok", name);
  else {
    failed += 1;
    console.error("fail", name);
  }
}

const now = "2026-10-24T12:00:00.000Z";
const verified = verificationAfterPasswordReset(
  { email: "a@example.com", emailVerified: true, emailVerifiedAt: "2026-01-01T00:00:00.000Z" },
  "a@example.com",
  now
);
check("verified account keeps verifiedAt", verified.ok && verified.emailVerified && verified.emailVerifiedAt === "2026-01-01T00:00:00.000Z");

const fresh = verificationAfterPasswordReset(
  { email: "a@example.com", emailVerified: false, emailVerifiedAt: null },
  "A@Example.com",
  now
);
check("matching reset marks unverified email", fresh.ok && fresh.emailVerified && fresh.emailVerifiedAt === now);

const legacy = verificationAfterPasswordReset(
  { email: "a@example.com", emailVerified: false, emailVerifiedAt: null },
  null,
  now
);
check("legacy token does not verify", legacy.ok && !legacy.emailVerified);

const mismatch = verificationAfterPasswordReset(
  { email: "new@example.com", emailVerified: false, emailVerifiedAt: null },
  "old@example.com",
  now
);
check("mismatched email is rejected", !mismatch.ok);

const store = createMemoryStore();
const user = await store.createUser({ email: "a@example.com", passwordHash: "old", name: null });
await store.updateUser(user.id, { emailVerified: true, emailVerifiedAt: "2026-01-01T00:00:00.000Z" });
await store.putToken({ token: "reset-ok", type: "reset", userId: user.id, expiresAt: "2026-10-24T12:30:00.000Z", sentToEmail: "a@example.com" });
const done = await completePasswordReset(store, "reset-ok", "new-hash", now);
const after = await store.getUserById(user.id);
check("valid token resets and keeps verification", Boolean(done.ok && done.emailVerified && after?.passwordHash === "new-hash" && after.emailVerified && after.emailVerifiedAt === "2026-01-01T00:00:00.000Z"));
check("token cannot be reused", !(await completePasswordReset(store, "reset-ok", "other", now)).ok && (await store.getUserById(user.id))?.passwordHash === "new-hash");

await store.putToken({ token: "reset-old", type: "reset", userId: user.id, expiresAt: "2020-01-01T00:00:00.000Z", sentToEmail: "a@example.com" });
check("expired token does nothing", !(await completePasswordReset(store, "reset-old", "nope", now)).ok && (await store.getUserById(user.id))?.passwordHash === "new-hash");
check("wrong token does nothing", !(await completePasswordReset(store, "missing", "nope", now)).ok);

const unverified = await store.createUser({ email: "b@example.com", passwordHash: "old", name: null });
await store.putToken({ token: "reset-new", type: "reset", userId: unverified.id, expiresAt: "2026-10-24T12:30:00.000Z", sentToEmail: "b@example.com" });
const marked = await completePasswordReset(store, "reset-new", "hashed", now);
const markedUser = await store.getUserById(unverified.id);
check("unverified inbox is verified by its reset token", Boolean(marked.ok && marked.emailVerified && markedUser?.emailVerified && markedUser.emailVerifiedAt === now));

await store.putToken({ token: "reset-move", type: "reset", userId: unverified.id, expiresAt: "2026-10-24T12:30:00.000Z", sentToEmail: "before@example.com" });
const moved = await completePasswordReset(store, "reset-move", "should-not", now);
check("token for a previous email does not reset", !moved.ok && (await store.getUserById(unverified.id))?.passwordHash === "hashed");

const question = publishedQuestions()[0];
const saved = savedReviewStat(null, question, { userId: "u", save: true, now });
check("manual save is not a miss", Boolean(saved && saved.savedForReview && saved.wrongCount === 0 && saved.rightCount === 0 && saved.nextReviewAt));
const again = saved ? savedReviewStat(saved, question, { userId: "u", save: true, now }) : null;
check("manual save is idempotent", Boolean(again && again.nextReviewAt === saved?.nextReviewAt && again.wrongCount === 0));
const answered = applyReviewAnswer(again, { correct: true, review: false, now, timeZone: "America/Phoenix" });
check("later correct does not add a miss", answered.wrongCount === 0 && answered.rightCount === 1);
const kept: QuestionStat = { ...saved!, ...answered, savedForReview: true };
check("correct answer can keep the manual flag", Boolean(kept.savedForReview) && kept.wrongCount === 0);
const missed = savedReviewStat({ ...kept, wrongCount: 2 }, question, { userId: "u", save: false, now });
check("unsave keeps a real miss", Boolean(missed && !missed.savedForReview && missed.wrongCount === 2 && missed.nextReviewAt));
const onlyManual = savedReviewStat(saved, question, { userId: "u", save: false, now });
check("unsave drops a manual-only plan", Boolean(onlyManual && !onlyManual.savedForReview && onlyManual.nextReviewAt == null && onlyManual.wrongCount === 0));
check("review spacing stays 1, 7, 14, 30", REVIEW_INTERVAL_DAYS.join(",") === "1,7,14,30");

const exams = createMemoryStore();
const examUser = await exams.createUser({ email: "c@example.com", passwordHash: "x", name: null });
await exams.addExam({ id: "exam-1", userId: examUser.id, mode: "full", score: 80, correctCount: 36, total: 45, at: now });
check("duplicate exam id is not inserted twice", (await exams.addExam({ id: "exam-1", userId: examUser.id, mode: "full", score: 80, correctCount: 36, total: 45, at: now })) === false);
check("one exam remains", (await exams.listExams(examUser.id)).length === 1);

if (failed) {
  console.error(failed, "failed");
  process.exit(1);
}
console.log("reset-review-verify passed");
