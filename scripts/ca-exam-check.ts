import { caQuestionCounts, publishedCaQuestions } from "../data/ca-questions.ts";
import { pickCaFullExam, pickCaQuickExam } from "../lib/ca-exam.ts";
import { CA_EXAM } from "../lib/ca-site.ts";

const counts = caQuestionCounts();
const pool = publishedCaQuestions();
if (counts.published < 45) throw new Error(`published ${counts.published}`);
for (const quota of CA_EXAM.quotas) {
  if (counts.areas[quota.area] < quota.count + 1) throw new Error(`${quota.area} has ${counts.areas[quota.area]}`);
}
const full = pickCaFullExam(7, pool);
if (!full || full.questions.length !== 45 || new Set(full.questions.map((q) => q.question_id)).size !== 45) {
  throw new Error("full draw");
}
if (full.unscoredIds.length !== 5) throw new Error("unscored");
const again = pickCaFullExam(7, pool);
if (again?.questions.map((q) => q.question_id).join() !== full.questions.map((q) => q.question_id).join()) {
  throw new Error("redraw changed");
}
const quick = pickCaQuickExam(3, pool);
if (quick.length !== 10) throw new Error("quick");
const areas = new Set(quick.map((q) => q.exam_area));
if (areas.size < 5) throw new Error("quick coverage");
const stems = new Set(pool.map((q) => q.question_text));
if (stems.size !== pool.length) throw new Error("duplicate stem");
console.log(JSON.stringify({ counts, quick: quick.length, full: full.questions.length }));
