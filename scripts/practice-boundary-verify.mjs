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

const states = ["AZ", "CA", "PA", "NC", "RI", "TX"];
const times = [];
let cookie = "";
for (const state of states) {
  const result = await post("/api/practice/batch/", { state, mode: "quick", practice: true }, cookie);
  assert(result.status === 200, `${state} batch ${result.status} ${result.text.slice(0, 180)}`);
  const body = JSON.parse(result.text);
  assert(body.questions.length > 0 && body.questions.length <= 80, `${state} count`);
  assert(body.questions.every((q) => q.correct_option === "" && !q.explanation), `${state} leaked answer`);
  times.push(Math.round(result.ms));
  if (!cookie && result.setCookie.includes("np_actor=")) cookie = result.setCookie.split(";")[0];
}
assert(/HttpOnly/i.test((await post("/api/practice/batch/", { state: "AZ", mode: "quick", practice: true })).setCookie), "anon cookie flags");
const minted = await post("/api/practice/batch/", { state: "AZ", mode: "quick", practice: true });
assert(/HttpOnly/i.test(minted.setCookie) && /SameSite=Lax/i.test(minted.setCookie) && /Secure/i.test(minted.setCookie), minted.setCookie);
const session = minted.setCookie.split(";")[0];
const sitting = JSON.parse(minted.text);
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
console.log(JSON.stringify({
  states,
  batchMs: times,
  topicCount: topicBody.questions.length,
  nextOffset: topicBody.nextOffset,
  gradeCount: gradeBody.results.length,
  cache: minted.cache,
}));
