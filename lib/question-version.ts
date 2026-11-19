import type { Question } from "./types.ts";

export type QuestionEditFields = Pick<Question, "question_text" | "option_a" | "option_b" | "option_c" |
  "option_d" | "correct_option" | "explanation" | "option_feedback"> &
  Partial<Pick<Question, "source_id" | "source_reference" | "last_verified_at" | "scenario_text">>;
export type QuestionEdit = { version: number; fields: QuestionEditFields; replacementId?: string; previousReviewedDate?: string };

export function publishQuestionEdit(original: Question, edit?: QuestionEdit): Question {
  if (!edit) return original;
  if (edit.version === original.version) return { ...original, ...edit.fields };
  if (edit.version !== original.version + 1) throw new Error(`Unexpected editorial version for ${original.question_id}`);
  const { previous_versions = [], ...snapshot } = original;
  return {
    ...snapshot, ...edit.fields, version: edit.version, effective_to: null,
    previous_versions: [...previous_versions, { ...snapshot, last_verified_at: edit.previousReviewedDate ?? snapshot.last_verified_at }],
  };
}

export function resolveQuestionVersion(question: Question | null | undefined, version: number): Question | null {
  if (!question) return null;
  return question.version === version ? question : question.previous_versions?.find(item => item.version === version) ?? null;
}

export function publishQuestionEdits(originals: Question[], edits: Readonly<Partial<Record<string, QuestionEdit>>>): Question[] {
  return originals.flatMap(original => {
    const edit = edits[original.question_id];
    if (!edit?.replacementId) return [publishQuestionEdit(original, edit)];
    if (!original.effective_to) throw new Error(`Replaced item still active: ${original.question_id}`);
    const { previous_versions: _archive, ...base } = original;
    return [original, { ...base, ...edit.fields, question_id: edit.replacementId, version: 1,
      replaces_question_id: original.question_id, effective_to: null }];
  });
}

export function savedQuestionVersion(versions: Record<string, number> | undefined, id: string) {
  return versions?.[id] ?? 1;
}
