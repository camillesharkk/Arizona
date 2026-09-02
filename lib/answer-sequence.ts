import type { Question } from "./types.ts";

export type Letter = "A" | "B" | "C" | "D";
export const LETTERS: Letter[] = ["A", "B", "C", "D"];

function mixSeed(seed: number): number {
  let s = seed >>> 0;
  if (s === 0) s = 1;
  return s;
}

/** Seeded Fisher–Yates. Seed 0 is treated as 1 so the permutation is not the identity. */
export function shuffle<T>(items: T[], seed?: number): T[] {
  const copy = [...items];
  let s = mixSeed(seed ?? Date.now());
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function nextSeed(seed: number): number {
  return (mixSeed(seed) * 16807) % 2147483647;
}

export function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function letterCounts(seq: readonly Letter[]): Record<Letter, number> {
  const c: Record<Letter, number> = { A: 0, B: 0, C: 0, D: 0 };
  for (const l of seq) c[l] += 1;
  return c;
}

export function countsAreBalanced(seq: readonly Letter[]): boolean {
  if (seq.length === 0) return true;
  const c = letterCounts(seq);
  const vals = LETTERS.map((l) => c[l]);
  return Math.max(...vals) - Math.min(...vals) <= 1;
}

export function longestRun(seq: readonly Letter[]): number {
  if (seq.length === 0) return 0;
  let best = 1;
  let cur = 1;
  for (let i = 1; i < seq.length; i++) {
    if (seq[i] === seq[i - 1]) cur += 1;
    else cur = 1;
    if (cur > best) best = cur;
  }
  return best;
}

/** Consecutive length-4 block repeating twice or more (ABCDABCD, BCADBCAD, …). */
export function hasRepeatedFourCycle(seq: readonly Letter[]): boolean {
  for (let i = 0; i + 8 <= seq.length; i++) {
    let same = true;
    for (let k = 0; k < 4; k++) {
      if (seq[i + k] !== seq[i + 4 + k]) {
        same = false;
        break;
      }
    }
    if (same) return true;
  }
  return false;
}

/** Period-2 streak of 3+ repeats (ABABAB, CDCDCD). AA pairs of length 2 are allowed. */
export function hasRepeatedTwoPeriod(seq: readonly Letter[]): boolean {
  for (let i = 0; i + 6 <= seq.length; i++) {
    if (seq[i] === seq[i + 1]) continue;
    if (
      seq[i] === seq[i + 2] &&
      seq[i + 2] === seq[i + 4] &&
      seq[i + 1] === seq[i + 3] &&
      seq[i + 3] === seq[i + 5]
    ) {
      return true;
    }
  }
  return false;
}

export function sequenceViolations(seq: readonly Letter[]): string[] {
  const v: string[] = [];
  if (longestRun(seq) >= 3) v.push("run>=3");
  if (hasRepeatedFourCycle(seq)) v.push("period-4");
  if (hasRepeatedTwoPeriod(seq)) v.push("period-2");
  if (!countsAreBalanced(seq)) v.push("unbalanced");
  return v;
}

export function isAcceptableSequence(seq: readonly Letter[]): boolean {
  return sequenceViolations(seq).length === 0;
}

function makeBag(n: number, seed: number): Letter[] {
  const base = Math.floor(n / 4);
  const remainder = n % 4;
  const extras = shuffle([...LETTERS], seed) as Letter[];
  const counts: Record<Letter, number> = { A: base, B: base, C: base, D: base };
  for (let i = 0; i < remainder; i++) counts[extras[i]] += 1;
  const bag: Letter[] = [];
  for (const l of LETTERS) {
    for (let i = 0; i < counts[l]; i++) bag.push(l);
  }
  return bag;
}

function repairSequence(seq: Letter[], seed: number): Letter[] {
  const out = [...seq];
  let s = mixSeed(seed);
  for (let round = 0; round < 400; round++) {
    if (isAcceptableSequence(out)) return out;
    let swapped = false;
    for (let i = 2; i < out.length; i++) {
      if (out[i] === out[i - 1] && out[i - 1] === out[i - 2]) {
        for (let j = 0; j < out.length; j++) {
          if (j === i || out[j] === out[i]) continue;
          const trial = [...out];
          [trial[i], trial[j]] = [trial[j], trial[i]];
          if (longestRun(trial) < longestRun(out) || isAcceptableSequence(trial)) {
            out[i] = trial[i];
            out[j] = trial[j];
            swapped = true;
            break;
          }
        }
        break;
      }
    }
    if (!swapped && (hasRepeatedFourCycle(out) || hasRepeatedTwoPeriod(out))) {
      s = nextSeed(s);
      const j = s % out.length;
      s = nextSeed(s);
      const k = s % out.length;
      if (j !== k) [out[j], out[k]] = [out[k], out[j]];
    }
  }
  return out;
}

/**
 * Session-level display letters for n questions.
 * Global A/B/C/D counts differ by at most 1. No index%4 / id%4 cycle.
 */
export function buildBalancedAnswerSequence(questionCount: number, sessionSeed: number): Letter[] {
  if (questionCount <= 0) return [];
  const bag = makeBag(questionCount, sessionSeed);
  let s = nextSeed(sessionSeed);
  for (let attempt = 0; attempt < 4000; attempt++) {
    s = nextSeed(s);
    const seq = shuffle(bag, s) as Letter[];
    if (isAcceptableSequence(seq)) return seq;
  }
  return repairSequence(shuffle(bag, nextSeed(sessionSeed + 99)) as Letter[], sessionSeed + 101);
}

function rewriteOptionLetters(text: string, origToDisplay: Record<Letter, Letter>): string {
  let out = text;
  for (const orig of LETTERS) {
    const token = `__OPT_${orig}__`;
    out = out.replace(new RegExp(`\\boption ${orig}\\b`, "gi"), `option ${token}`);
    out = out.replace(new RegExp(`\\bOption ${orig}\\b`, "g"), `Option ${token}`);
  }
  for (const orig of LETTERS) {
    const display = origToDisplay[orig];
    out = out.replaceAll(`option __OPT_${orig}__`, `option ${display}`);
    out = out.replaceAll(`Option __OPT_${orig}__`, `Option ${display}`);
  }
  return out;
}

/**
 * Session-stable option order. If targetLetter is set, the canonical correct
 * text is placed at that display letter; the other three options are shuffled.
 */
export function shuffleQuestionOptions(
  q: Question,
  seed: number,
  targetLetter?: Letter
): { question: Question; toOriginal: Record<Letter, Letter> } {
  const texts: Record<Letter, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const fbs = q.option_feedback;
  const origCorrect = q.correct_option;
  const localSeed = mixSeed(seed + hashId(q.question_id));

  let origForDisplay: Record<Letter, Letter>;
  if (targetLetter) {
    const others = LETTERS.filter((l) => l !== origCorrect);
    const destOthers = LETTERS.filter((l) => l !== targetLetter);
    const shuffledOthers = shuffle(others, localSeed + targetLetter.charCodeAt(0)) as Letter[];
    origForDisplay = { A: "A", B: "B", C: "C", D: "D" };
    origForDisplay[targetLetter] = origCorrect;
    destOthers.forEach((d, i) => {
      origForDisplay[d] = shuffledOthers[i];
    });
  } else {
    const order = shuffle([...LETTERS], localSeed) as Letter[];
    origForDisplay = { A: order[0], B: order[1], C: order[2], D: order[3] };
  }

  const toOriginal = origForDisplay;
  const origToDisplay = Object.fromEntries(LETTERS.map((d) => [toOriginal[d], d])) as Record<Letter, Letter>;
  return {
    toOriginal,
    question: {
      ...q,
      option_a: texts[toOriginal.A],
      option_b: texts[toOriginal.B],
      option_c: texts[toOriginal.C],
      option_d: texts[toOriginal.D],
      option_feedback: {
        A: fbs[toOriginal.A],
        B: fbs[toOriginal.B],
        C: fbs[toOriginal.C],
        D: fbs[toOriginal.D],
      },
      correct_option: origToDisplay[origCorrect],
      explanation: rewriteOptionLetters(q.explanation, origToDisplay),
    },
  };
}

export function presentExamQuestions(
  list: Question[],
  sessionSeed: number
): {
  questions: Question[];
  maps: Record<string, Record<Letter, Letter>>;
  targets: Letter[];
} {
  const targets = buildBalancedAnswerSequence(list.length, sessionSeed);
  const maps: Record<string, Record<Letter, Letter>> = {};
  const questions = list.map((item, i) => {
    const { question, toOriginal } = shuffleQuestionOptions(item, sessionSeed, targets[i]);
    maps[item.question_id] = toOriginal;
    return question;
  });
  return { questions, maps, targets };
}

export function optionText(q: Question, letter: Letter): string {
  const key = `option_${letter.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d";
  return q[key];
}
