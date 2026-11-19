import type { Question, TopicId } from '../lib/types';
import { shuffle } from '../lib/answer-sequence';
import { ctCards as originalCards } from './ct-rules';
import { ctSeeds } from './ct-seeds';
import { ctExam, CT_CHECKED_ON } from '../lib/ct-site';
import { publishQuestionEdits } from '../lib/question-version.ts';
import { questionDrawHold } from './question-draw-holds.ts';
import { questionReviewDate } from './question-review-dates.ts';
import { ctQuestionEdits } from './question-edits-ct.ts';

export const ctCards = originalCards.map(card => {
  if (card.key === 'id-documents') return { ...card,
    rule: 'Use at least two current IDs. One is issued by a federal or state government and has a signature and photo or physical description. The second is issued by an institution, business, or federal or state government and has a signature.',
  };
  if (card.key === 'mark') return { ...card, rule: 'A competent signer who cannot write may sign by a mark. The Secretary of State recommends having two witnesses, other than the notary, sign beside the mark.' };
  if (card.key === 'application') return { ...card, boundary: 'An expired commission can be renewed within 90 days. After that, contact the Secretary for reinstatement. Wait for a current commission before acting.' };
  if (card.key === 'changes') return { ...card,
    rule: 'Report a name change within 30 days. Report changes to a resident’s Connecticut home address or a nonresident’s principal Connecticut business address within 30 days.',
    boundary: 'Use the new name and matching seal, if used, once the replacement certificate is issued. If an applicable address change moves you to a new town, record the replacement in that town within 30 days after issuance.',
  };
  if (card.key === 'custodian-statement') return { ...card, boundary: 'Use a sworn statement for an appropriate private copy. Refer requests for certified vital records to the official custodian.' };
  return card;
});
export const ctTopics = [
  { id: 'commission', label: 'First application and appointment' },
  { id: 'identity', label: 'Identity, appearance and willingness' },
  { id: 'acts', label: 'Acknowledgments, jurats and authority' },
  { id: 'certificates', label: 'Completing the certificate' },
  { id: 'copies', label: 'Copies and custodian statements' },
  { id: 'records', label: 'Journal, seal, fees and changes' },
  { id: 'conflicts', label: 'Impartiality, refusal and misconduct' },
  { id: 'remote', label: 'Connecticut remote procedure' },
];

const freeQuotas: Record<string, number> = { commission: 8, identity: 10, acts: 9, certificates: 8, copies: 7, records: 7, conflicts: 6, remote: 5 };
const topicIds: Record<string, TopicId> = { commission: 'commission', identity: 'identification', acts: 'acknowledgments', certificates: 'acknowledgments', copies: 'copy-certification', records: 'seals-fees', conflicts: 'prohibited-acts', remote: 'electronic-ron' };
const topicCounts: Record<string, number> = {};
const letters = ['A', 'B', 'C', 'D'] as const;

const questions = publishQuestionEdits(ctSeeds.map(([id, ruleKey, text, answer, reason, ...wrong]): Question => {
  const card = originalCards.find(item => item.key === ruleKey)!;
  const topic = card.study;
  topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  const ordinal = Number(id.slice(3)) - 1;
  const correctIndex = ordinal % 4;
  const choices = [...wrong];
  choices.splice(correctIndex, 0, [answer, reason]);
  const sourceId = ruleKey === 'fees' ? 'ct_fee_act' : ruleKey === 'character' || ruleKey === 'jurat-form' ? 'ct_forms' : ruleKey === 'application' || ruleKey === 'application-fee' ? 'ct_licensing' : 'ct_manual';
  return {
    question_id: id, state: 'CT', study_topic: topic,
    topic: ruleKey === 'jurat' || ruleKey === 'affirmation' || ruleKey === 'oath-ceremony' ? 'jurats' : topicIds[topic],
    difficulty: ordinal % 5 === 0 ? 'hard' : 'medium', question_text: text,
    option_a: choices[0][0], option_b: choices[1][0], option_c: choices[2][0], option_d: choices[3][0],
    correct_option: letters[correctIndex], explanation: `${reason} ${card.rule}`,
    option_feedback: { A: choices[0][1], B: choices[1][1], C: choices[2][1], D: choices[3][1] },
    source_id: sourceId, source_reference: card.source, concept_ids: [card.id],
    effective_from: ruleKey === 'fees' ? '2026-07-01' : '2026-11-13', effective_to: questionDrawHold(id),
    last_verified_at: questionReviewDate(id, CT_CHECKED_ON), version: 1, is_free: (topicCounts[topic] - 1) % 4 === 0 || ((topicCounts[topic] - 1) % 4 === 1 && Math.floor((topicCounts[topic] - 1) / 4) < freeQuotas[topic] - originalCards.filter(item => item.study === topic).length), status: 'published',
  };
}), ctQuestionEdits);

export function publishedCtQuestions() { return questions; }
export function ctQuestionCounts() {
  const free = questions.filter(q => q.is_free).length;
  return { published: questions.length, free, pro: questions.length - free };
}

export function pickCtFullExam(seed: number) {
  return { questions: shuffle(questions, seed).slice(0, ctExam.practiceQuestionCount), unscoredIds: [] };
}
