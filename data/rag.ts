import { chapters } from "./study-guide.ts";
import { getSource } from "./sources.ts";

const RELATED_SOURCE_LIMIT = 2;

export function retrieveContext(topic: string, question: string, sourceId?: string) {
  const chapter = chapters.find((c) => c.topic === topic);
  const bits = chapter
    ? [chapter.title, chapter.summary, ...chapter.sections.map((s) => `${s.heading}: ${s.body}`), ...chapter.keyFacts]
    : [];
  const q = question.toLowerCase();
  const ranked = bits.filter((b) => q.split(" ").some((w) => w.length > 4 && b.toLowerCase().includes(w))).slice(0, 4);
  const pick = ranked.length ? ranked : bits.slice(0, 3);

  const ids: string[] = [];
  if (sourceId) ids.push(sourceId);
  if (chapter?.source_id && !ids.includes(chapter.source_id) && ids.length < RELATED_SOURCE_LIMIT) {
    ids.push(chapter.source_id);
  }
  const srcLines = ids.map((id) => {
    const s = getSource(id);
    return `${s.reference} — ${s.title}`;
  });

  return `${pick.join("\n")}${srcLines.length ? `\nOfficial pin-cite:\n${srcLines.join("\n")}` : ""}`;
}
