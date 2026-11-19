import { caCards } from "../data/ca-cards.ts";
import { caQuestionCounts, publishedCaQuestions } from "../data/ca-questions.ts";
import { pickCaFullExam, pickCaQuickExam } from "../lib/ca-exam.ts";
import { CA_EXAM } from "../lib/ca-site.ts";
import { caStudyTopics } from "../lib/ca-topics.ts";

const counts = caQuestionCounts();
const pool = publishedCaQuestions();
// A retired item still resolves in an existing sitting but is absent from fresh draws.
if (!pool.some((q) => q.question_id === "ca-079" && q.version === 1 && q.correct_option === "B")) {
  throw new Error("retired California question lost its original answer snapshot");
}
if (!pool.some((q) => q.question_id === "ca-054" && q.version === 1 && q.correct_option === "C")) {
  throw new Error("Held California conviction item lost its historical version or key");
}
for (let seed = 0; seed < 100; seed++) {
  if ([...pickCaQuickExam(seed), ...(pickCaFullExam(seed)?.questions ?? [])].some((q) => ["ca-054", "ca-079"].includes(q.question_id))) {
    throw new Error("retired California question entered a fresh draw");
  }
}
if (counts.published < 45) throw new Error(`published ${counts.published}`);
for (const quota of CA_EXAM.quotas) {
  if (counts.areas[quota.area] < quota.count + 1) throw new Error(`${quota.area} has ${counts.areas[quota.area]}`);
}
const full = pickCaFullExam(7);
if (!full || full.questions.length !== 45 || new Set(full.questions.map((q) => q.question_id)).size !== 45) {
  throw new Error("full draw");
}
if (full.unscoredIds.length !== 5) throw new Error("unscored");
const again = pickCaFullExam(7);
if (again?.questions.map((q) => q.question_id).join() !== full.questions.map((q) => q.question_id).join()) {
  throw new Error("redraw changed");
}
const quick = pickCaQuickExam(3);
if (quick.length !== 10) throw new Error("quick");
const areas = new Set(quick.map((q) => q.exam_area));
if (areas.size < 5) throw new Error("quick coverage");
const stems = new Set(pool.map((q) => q.question_text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()));
if (stems.size !== pool.length) throw new Error("duplicate stem");
const optionSets = new Set(pool.map((q) => [q.option_a, q.option_b, q.option_c, q.option_d].map((item) => item.toLowerCase()).sort().join("|")));
if (optionSets.size !== pool.length) throw new Error(`duplicate option set ${pool.length - optionSets.size}`);
if (pool.length !== 203 || counts.published !== 201) throw new Error(`historical ${pool.length}, active ${counts.published}`);
if (pool.some((q) => !q.is_free)) throw new Error("CA paywall");
const byStudy = new Map<string, number>();
for (const question of pool) byStudy.set(question.study_topic || "", (byStudy.get(question.study_topic || "") || 0) + 1);
for (const topic of caStudyTopics) {
  const count = byStudy.get(topic.id) || 0;
  if (count < 5) throw new Error(`${topic.id} ${count}`);
}
const cardStudies = new Set(caCards.map((card) => card.study));
for (const topic of caStudyTopics) {
  if (!cardStudies.has(topic.id)) throw new Error(`card missing ${topic.id}`);
}
if (caCards.length < 50) throw new Error(`cards ${caCards.length}`);
console.log(JSON.stringify({ counts, cards: caCards.length, quick: quick.length, full: full.questions.length }));
