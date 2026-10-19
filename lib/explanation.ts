/** Display copy for answer explanations. Drops notes about the question item itself. */

const SENTENCE_END = /(?<=[a-z0-9)%"”])\.(?=\s+[A-Z])/g;

function sentences(text: string): string[] {
  const out: string[] = [];
  let start = 0;
  const re = new RegExp(SENTENCE_END.source, "g");
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    out.push(text.slice(start, match.index + 1).trim());
    start = match.index + 1;
  }
  const tail = text.slice(start).trim();
  if (tail) out.push(tail);
  return out;
}

function keepSentence(sentence: string): string | null {
  let s = sentence.trim().replace(/,?\s*which is outside this item's main pin-cite\.?$/i, ".").trim();
  if (!s) return null;
  if (/\bpin-cite\b/i.test(s)) return null;
  if (
    /\b(question bank|the app expects|not tested by this item|not tested here|are not this question|not this question|used to write the answer|does not invent|page is cited|manual page number|it is not the question)\b/i.test(
      s
    )
  ) {
    return null;
  }
  if (/^This item does not (create|claim|forbid|expand|add)\b/i.test(s)) {
    return s.replace(/^This item does not/i, "The statute does not");
  }
  if (/^This (item|question)\b/i.test(s)) return null;
  return s;
}

export function cleanExplanation(text: string): string {
  return sentences(text)
    .map(keepSentence)
    .filter((s): s is string => Boolean(s))
    .join(" ");
}

export function presentExplanation(text: string): { short: string; why: string } {
  const kept = sentences(text)
    .map(keepSentence)
    .filter((s): s is string => Boolean(s));
  if (kept.length <= 3) return { short: kept.join(" "), why: "" };
  return { short: kept.slice(0, 3).join(" "), why: kept.slice(3).join(" ") };
}
