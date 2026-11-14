import type { FreeStateContent } from './free-state-content';
import type { FreeStateCode } from './free-state-catalog';
import type { Question } from './types';

export function stateQuestion(code: FreeStateCode, question: FreeStateContent['questions'][number], free: boolean): Question {
  return {
    question_id: question.id, state: code, topic: question.topic, study_topic: question.studyTopic,
    difficulty: 'medium', question_text: question.stem,
    option_a: question.options[0], option_b: question.options[1], option_c: question.options[2], option_d: question.options[3],
    correct_option: question.answer, explanation: question.explanation,
    option_feedback: { A: question.feedback[0], B: question.feedback[1], C: question.feedback[2], D: question.feedback[3] },
    source_id: question.sourceId, source_reference: question.reference,
    effective_from: '2026-11-14', effective_to: null, last_verified_at: '2026-11-14',
    version: 1, is_free: free, status: 'published',
  };
}
