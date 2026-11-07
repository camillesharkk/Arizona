"""Emit Hawaii question, card, and guide modules. Run from web/."""
from __future__ import annotations

import json
from pathlib import Path

from hi_rows import CARDS, CHAPTERS, ROWS

ROOT = Path(__file__).resolve().parents[1]
CHECKED = "2026-11-07"


def js(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)


def emit_questions() -> None:
    lines = [
        'import type { Difficulty, ExamArea, Question, TopicId } from "@/lib/types";',
        'import { hiTopicMeta } from "@/lib/hi-topics";',
        "",
        f'const VERIFIED = "{CHECKED}";',
        "",
        "type Row = {",
        "  id: string;",
        "  study: string;",
        "  difficulty: Difficulty;",
        "  text: string;",
        "  options: [string, string, string, string];",
        "  correct: 0 | 1 | 2 | 3;",
        "  why: string;",
        "  source: string;",
        "  miss: [string, string, string, string];",
        "};",
        "",
        "const rows: Row[] = [",
    ]
    for index, row in enumerate(ROWS, start=1):
        options = row["options"]
        miss = row["miss"]
        # Rotate so the keyed answer is not always A. Rotation is presentation only.
        shift = (index - 1) % 4
        turned = options[shift:] + options[:shift]
        turned_miss = miss[shift:] + miss[:shift]
        correct = (row["correct"] - shift) % 4
        lines.append("  {")
        lines.append(f'    id: "hi-{index:03d}",')
        lines.append(f'    study: {js(row["study"])},')
        lines.append(f'    difficulty: {js(row["difficulty"])},')
        lines.append(f'    text: {js(row["text"])},')
        lines.append(f"    options: [{', '.join(js(item) for item in turned)}],")
        lines.append(f"    correct: {correct},")
        lines.append(f'    why: {js(row["why"])},')
        lines.append(f'    source: {js(row["source"])},')
        lines.append(f"    miss: [{', '.join(js(item) for item in turned_miss)}],")
        lines.append("  },")
    lines += [
        "];",
        "",
        'const letters = ["A", "B", "C", "D"] as const;',
        "",
        "function publish(row: Row): Question {",
        "  const meta = hiTopicMeta(row.study);",
        "  const correct = letters[row.correct];",
        "  return {",
        "    question_id: row.id,",
        '    state: "HI",',
        "    exam_area: meta.area as ExamArea,",
        "    study_topic: row.study,",
        "    topic: meta.topic as TopicId,",
        "    difficulty: row.difficulty,",
        "    question_text: row.text,",
        "    option_a: row.options[0],",
        "    option_b: row.options[1],",
        "    option_c: row.options[2],",
        "    option_d: row.options[3],",
        "    correct_option: correct,",
        "    explanation: row.why,",
        "    option_feedback: { A: row.miss[0], B: row.miss[1], C: row.miss[2], D: row.miss[3] },",
        '    source_id: "hi-official",',
        "    source_reference: row.source,",
        '    effective_from: "2021-01-01",',
        "    effective_to: null,",
        "    last_verified_at: VERIFIED,",
        "    version: 1,",
        "    is_free: true,",
        '    status: "published",',
        "  };",
        "}",
        "",
        "const questions = rows.map(publish);",
        "",
        "export function publishedHiQuestions(): Question[] {",
        '  return questions.filter((question) => question.status === "published" && question.state === "HI" && question.effective_to == null);',
        "}",
        "",
        "export function hiQuestionCounts() {",
        "  const published = publishedHiQuestions();",
        "  const topics: Record<string, number> = {};",
        "  for (const question of published) {",
        '    const key = question.study_topic || "unknown";',
        "    topics[key] = (topics[key] || 0) + 1;",
        "  }",
        "  return {",
        "    published: published.length,",
        "    free: published.filter((question) => question.is_free).length,",
        "    topics,",
        "  };",
        "}",
        "",
    ]
    (ROOT / "data" / "hi-questions.ts").write_text("\n".join(lines), encoding="utf-8")


def emit_cards() -> None:
    lines = [
        "export type HiCard = {",
        "  id: string; study: string; title: string; front: string; rule: string; boundary: string; mixup: string; source: string; sourceUrl: string;",
        "};",
        "",
        "export const hiCards: HiCard[] = [",
    ]
    for index, card in enumerate(CARDS, start=1):
        lines.append("  {")
        lines.append(f'    id: "hi-card-{index:03d}", study: {js(card["study"])}, title: {js(card["title"])},')
        lines.append(f'    front: {js(card["front"])}, rule: {js(card["rule"])}, boundary: {js(card["boundary"])},')
        lines.append(f'    mixup: {js(card["mixup"])}, source: {js(card["source"])}, sourceUrl: {js(card["sourceUrl"])},')
        lines.append("  },")
    lines.append("];")
    lines.append("")
    (ROOT / "data" / "hi-cards.ts").write_text("\n".join(lines), encoding="utf-8")


def emit_guide() -> None:
    lines = [
        'export const hiGuideCheckedOn = "2026-11-07";',
        "",
        "export type HiGuideChapter = {",
        "  id: string;",
        "  title: string;",
        "  summary: string;",
        "  rule: string;",
        "  exception: string;",
        "  exampleTitle: string;",
        "  example: string;",
        "  sourceLabel: string;",
        "  sourceUrl: string;",
        "};",
        "",
        "export const hiGuideChapters: HiGuideChapter[] = [",
    ]
    for chapter in CHAPTERS:
        lines.append("  {")
        for key in ("id", "title", "summary", "rule", "exception", "exampleTitle", "example", "sourceLabel", "sourceUrl"):
            lines.append(f"    {key}: {js(chapter[key])},")
        lines.append("  },")
    lines.append("];")
    lines.append("")
    (ROOT / "data" / "hi-study-guide.ts").write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    emit_questions()
    emit_cards()
    emit_guide()
    print(f"questions {len(ROWS)} cards {len(CARDS)} chapters {len(CHAPTERS)}")
