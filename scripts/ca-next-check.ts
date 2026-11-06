import { applyMistakeImport, applyReviewImport, quickNextBand, rankMissedTopics } from "../lib/ca-next.ts";
import { caGuideChapters } from "../data/ca-study-guide.ts";
import { caStudyTopics } from "../lib/ca-topics.ts";

const misses = [
  { id: "identification", missed: 2 },
  { id: "fees", missed: 1 },
];
const top = rankMissedTopics(misses);
if (top?.id !== "identification" || top.missed !== 2) throw new Error("rank");
if (quickNextBand(6, 10) !== "review") throw new Error("band review");
if (quickNextBand(8, 10) !== "ready") throw new Error("band ready");
if (quickNextBand(10, 10) !== "perfect") throw new Error("band perfect");
if (rankMissedTopics([])) throw new Error("skips are not misses");

const first = applyReviewImport([], "attempt-1", misses);
const again = applyReviewImport(first.next, "attempt-1", misses);
if (first.added !== 2 || again.added !== 0 || again.next.length !== 2) throw new Error("topic import");
if (again.next.find((item) => item.id === "identification")?.missed !== 2) throw new Error("missed count");
const other = applyReviewImport(again.next, "attempt-2", [{ id: "identification", missed: 1 }]);
if (other.next.filter((item) => item.id === "identification").length !== 1) throw new Error("one topic row");
const back = applyReviewImport(other.next, "attempt-1", misses);
if (back.next.find((item) => item.id === "identification")?.missed !== 2) throw new Error("first attempt restored");
if (back.next.find((item) => item.id === "identification")?.attemptId !== "attempt-1") throw new Error("attempt id");

const local = applyMistakeImport(["ca-001"], ["ca-001", "ca-002"]);
const repeat = applyMistakeImport(local.next, ["ca-001", "ca-002"]);
if (local.added !== 1 || local.already !== 1 || repeat.added !== 0 || repeat.next.length !== 2) throw new Error("mistake import");

const ids = new Set(caGuideChapters.map((chapter) => chapter.id));
for (const topic of caStudyTopics) {
  if (!ids.has(topic.id)) throw new Error(`missing chapter ${topic.id}`);
}
if (caGuideChapters.length !== caStudyTopics.length) throw new Error("chapter count");

console.log("ca-next-check ok");
