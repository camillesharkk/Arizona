const base = process.env.BOUNDARY_BASE || "http://127.0.0.1:3456";
const origin = base;

function assert(cond, message) {
  if (!cond) throw new Error(message);
}

async function post(path, body, cookie) {
  const started = performance.now();
  const response = await fetch(base + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: origin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  const setCookie = response.headers.get("set-cookie") || "";
  return { status: response.status, text, setCookie, ms: performance.now() - started, cache: response.headers.get("cache-control") };
}

const states = ["AZ", "AR", "CA", "CO", "CT", "HI", "IL", "IN", "LA", "ME", "MD", "MO", "MT", "NE", "NV", "NJ", "NM", "NY", "NC", "OH", "OR", "PA", "RI", "TX", "UT", "VT", "WI", "WY"];
const times = [];
for (const state of states) {
  const result = await post("/api/practice/batch/", { state, mode: "quick", practice: true });
  assert(result.status === 200, `${state} batch ${result.status} ${result.text.slice(0, 180)}`);
  const body = JSON.parse(result.text);
  assert(body.questions.length > 0 && body.questions.length <= 80, `${state} count`);
  assert(body.questions.every((q) => q.correct_option === "" && !q.explanation && !("previous_versions" in q)), `${state} leaked answer or editorial history`);
  times.push(Math.round(result.ms));
}
assert(/HttpOnly/i.test((await post("/api/practice/batch/", { state: "AZ", mode: "quick", practice: true })).setCookie), "anon cookie flags");
const minted = await post("/api/practice/batch/", { state: "AZ", mode: "quick", practice: true });
assert(/HttpOnly/i.test(minted.setCookie) && /SameSite=Lax/i.test(minted.setCookie) && /Secure/i.test(minted.setCookie), minted.setCookie);
const session = minted.setCookie.split(";")[0];
const sitting = JSON.parse(minted.text);
assert(!JSON.stringify(JSON.parse(Buffer.from(sitting.token.split(".")[1], "base64url"))).includes(session.split("=")[1]), "token contains the anonymous cookie");
const incomplete = await post("/api/practice/feedback/", {
  token: sitting.token,
  action: "grade",
  answers: [{ questionId: sitting.questionIds[0], display: "A" }],
}, session);
assert(incomplete.status === 400, `incomplete grade ${incomplete.status}`);
const duplicate = await post("/api/practice/feedback/", {
  token: sitting.token,
  action: "grade",
  answers: sitting.questionIds.map(() => ({ questionId: sitting.questionIds[0], display: "A" })),
}, session);
assert(duplicate.status === 400, `duplicate grade ${duplicate.status}`);
const wrong = await post("/api/practice/feedback/", { token: sitting.token, action: "one", questionId: "az-does-not-exist", display: "A" }, session);
assert(wrong.status === 400, `wrong id ${wrong.status}`);
const stolen = await post("/api/practice/feedback/", { token: sitting.token, action: "one", questionId: sitting.questionIds[0], display: "A" });
assert(stolen.status === 403, `stolen token ${stolen.status}`);
const graded = await post("/api/practice/feedback/", {
  token: sitting.token,
  action: "grade",
  correct: true,
  score: 100,
  answers: sitting.questionIds.map((questionId) => ({ questionId, display: "A" })),
}, session);
assert(graded.status === 200, `grade ${graded.status} ${graded.text.slice(0, 160)}`);
const gradeBody = JSON.parse(graded.text);
assert(gradeBody.results.every((row) => typeof row.correct === "boolean" && row.correctOption), "grade omitted server key");
const archived = await post("/api/practice/archive/", { practiceToken: sitting.token, examId: "guest", questionIds: sitting.questionIds });
assert(archived.status === 403, `archive ${archived.status}`);
const oldBank = await fetch(base + "/api/state/questions/");
assert(oldBank.status === 404, `old bank ${oldBank.status}`);
const topic = await post("/api/practice/batch/", { kind: "topic", state: "AZ", topic: "identification", seed: 7, offset: 0 }, session);
const topicBody = JSON.parse(topic.text);
assert(topic.status === 200 && topicBody.questions.length <= 15 && topicBody.questions.every((q) => q.correct_option === ""), "topic page");
const cards = await fetch(base + "/arizona/flashcards/");
const cardHtml = await cards.text();
assert(cards.status === 200, "flashcards");
assert(!cardHtml.includes("correct_option"), "flashcard html has answer field");
for (const [type, report, status] of [
  ["application/csp-report", { "csp-report": { "effective-directive": "connect-src", "blocked-uri": "https://example.com/path?fixture=redact" } }, 204],
  ["application/reports+json", [{ type: "csp-violation", body: { effectiveDirective: "script-src-elem", blockedURL: "inline" } }], 204],
  ["application/csp-report", { fixture: "x".repeat(8100) }, 413],
  ["application/json", {}, 415],
]) {
  const response = await fetch(base + "/api/security/csp-report/", {
    method: "POST", headers: { "Content-Type": type }, body: JSON.stringify(report),
  });
  assert(response.status === status, `CSP report ${type} ${response.status}, expected ${status}`);
}
const fullStates = ["AZ", "CA", "CT", "HI", "LA", "NC", "NY", "PA"];
for (const state of fullStates) {
  const batch = await post("/api/practice/batch/", { state, mode: "full", practice: false });
  assert(batch.status === 200, `${state} full batch ${batch.status}`);
  const guest = batch.setCookie.split(";")[0];
  const full = JSON.parse(batch.text);
  assert(full.questionIds.length > 10, `${state} full count`);
  const resumed = await post("/api/practice/batch/", { state, mode: "full", practice: true, token: full.token }, guest);
  const resumedFull = JSON.parse(resumed.text);
  assert(resumed.status === 200 && resumedFull.examId === full.examId && resumedFull.questionIds.join() === full.questionIds.join() && resumedFull.unscoredIds.join() === full.unscoredIds.join(), `${state} full restore`);
  const previewAnswer = await post("/api/practice/feedback/", {
    token: resumedFull.token, action: "one", questionId: full.questionIds[0], display: "A",
  }, guest);
  assert(previewAnswer.status >= 400, `${state} full answer before submission`);
  const submission = { token: resumedFull.token, action: "grade", answers: full.questionIds.map((questionId, i) => ({ questionId, display: i ? "A" : undefined })) };
  const finish = await post("/api/practice/feedback/", submission, guest);
  assert(finish.status === 200 && JSON.parse(finish.text).results[0].skipped, `${state} full grade ${finish.status}`);
  const retry = await post("/api/practice/feedback/", submission, guest);
  assert(retry.status === 200, `${state} grade retry ${retry.status}`);
  const again = await post("/api/practice/batch/", { state, mode: "full", practice: false }, guest);
  assert(again.status === 402, `${state} free trial reuse ${again.status}`);
}
console.log(JSON.stringify({
  states,
  fullStates,
  batchMs: times,
  topicCount: topicBody.questions.length,
  nextOffset: topicBody.nextOffset,
  gradeCount: gradeBody.results.length,
  cache: minted.cache,
}));
