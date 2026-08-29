import { chapters } from "@/data/study-guide";
import { sources } from "@/data/sources";

export function retrieveContext(topic: string, question: string) {
  const chapter = chapters.find((c) => c.topic === topic);
  const bits = chapter
    ? [chapter.title, chapter.summary, ...chapter.sections.map((s) => `${s.heading}: ${s.body}`), ...chapter.keyFacts]
    : [];
  const src = Object.values(sources)
    .map((s) => `${s.title} ${s.reference} ${s.url}`)
    .join("\n");
  const q = question.toLowerCase();
  const ranked = bits.filter((b) => q.split(" ").some((w) => w.length > 4 && b.toLowerCase().includes(w))).slice(0, 4);
  const pick = ranked.length ? ranked : bits.slice(0, 3);
  return `${pick.join("\n")}\nOfficial sources:\n${src}`;
}
