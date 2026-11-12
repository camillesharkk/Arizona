import type { Difficulty, Question, TopicId } from "@/lib/types";

export const LA_CHECKED = "2026-11-08";
export const laTopics = [
  { id: "qualify", label: "Qualification" },
  { id: "preassessment", label: "Pre-assessment and the exam" },
  { id: "bond", label: "Bond and commission" },
  { id: "parish", label: "Parish authority" },
];

type Row = {
  id: string; study: string; topic: TopicId; difficulty: Difficulty; free: boolean;
  text: string; options: [string, string, string, string]; correct: 0 | 1 | 2 | 3;
  why: string; miss: [string, string, string, string]; source: string;
  scenario_id?: string; scenario_text?: string;
};

const FAQ = "Louisiana Secretary of State, Notary FAQ, checked 2026-11-08";
const EXAM = "Louisiana Secretary of State, Get Exam Information page, checked 2026-11-08";
const APPLY = "Louisiana Secretary of State, Application Process page, checked 2026-11-08";

const scene = "A Baton Rouge applicant has an approved Application to Qualify. The applicant is not a Louisiana lawyer.";

const rows: Row[] = [
  { id: "la-001", study: "preassessment", topic: "commission", difficulty: "medium", free: true, scenario_id: "la-scene-qualify", scenario_text: scene,
    text: "The applicant wants to skip the online pre-assessment and register for the state exam. What does the Secretary of State say?",
    options: ["A nonlawyer may skip it", "The pre-assessment is mandatory for a nonlawyer and only needs to be taken once", "The pre-assessment is the state exam", "A passing pre-assessment score is the commission"],
    correct: 1, why: "The application-process page says a nonlawyer must complete the pre-assessment before registering for the state exam. It is mandatory and needs to be taken once. It does not require a passing score.",
    miss: ["A nonlawyer applicant is the person who must take it.", "Correct. It is mandatory once for a nonlawyer.", "The Secretary of State describes it as an evaluation, not the state exam.", "A pre-assessment score is not a commission."], source: APPLY },
  { id: "la-002", study: "preassessment", topic: "commission", difficulty: "medium", free: true, scenario_id: "la-scene-qualify", scenario_text: scene,
    text: "The pre-assessment report places the applicant at the lower reading level. May the applicant still register for the state exam?",
    options: ["No. Only Level A may register", "Yes. The score does not prohibit the applicant from taking the exam", "No, until the applicant repeats the pre-assessment and improves", "Yes, but only with a lawyer's signature"],
    correct: 1, why: "The exam-information page says that regardless of the score or indicated reading level, the applicant is not prohibited from taking the state exam.",
    miss: ["Level A is not an eligibility gate.", "Correct. The score does not bar registration.", "The page says the pre-assessment is taken once and the score does not bar the exam.", "A lawyer's signature is not the condition stated there."], source: EXAM },
  { id: "la-003", study: "preassessment", topic: "commission", difficulty: "hard", free: false, scenario_id: "la-scene-qualify", scenario_text: scene,
    text: "The applicant passes the state exam. Which description matches the Secretary of State's exam page, and which detail is not stated there?",
    options: ["It is a four-hour computer exam, a scaled score of 70 out of 100 is required, and only the 2026 official study guide may be brought in. The page does not state how many items are on the exam", "It is a 45-question, one-hour closed-book exam", "It is graded pass or fail with no scale", "Any prior edition of the study guide may be used"],
    correct: 0, why: "The exam page says the exam is a four-hour computer sitting, the passing result is a scaled score of 70 out of 100, and only the 2026 official study guide may be used in the room. It does not publish an item count. An earlier edition is not an allowed reference.",
    miss: ["Correct. Those three facts are stated, and the item count is not.", "That is not the Louisiana format on the Secretary of State's page.", "The page states a scaled score of 70 out of 100.", "Using a reference other than the 2026 guide is described as cheating."], source: EXAM },
  { id: "la-004", study: "qualify", topic: "commission", difficulty: "easy", free: true,
    text: "Who does the Secretary of State say is exempt from the statewide notary exam?",
    options: ["Anyone who was a notary in another state", "A person licensed to practice law in Louisiana", "A college graduate", "A notary whose bond is already on file"],
    correct: 1, why: "The FAQ says anyone licensed to practice law in the state is exempt from the test. A commission from another state cannot be transferred.",
    miss: ["Another state's commission does not transfer.", "Correct. A Louisiana law license is the stated exemption.", "A degree is not the stated exemption.", "A bond is a commissioning step, not an exam exemption."], source: FAQ },
  { id: "la-005", study: "bond", topic: "seals-fees", difficulty: "easy", free: true,
    text: "What bond amount does the Secretary of State FAQ state?",
    options: ["$10,000", "$15,000", "$50,000, either a surety bond or a personal surety", "No bond is required"],
    correct: 2, why: "The FAQ says notary surety bonds and personal surety bonds are required in the amount of $50,000. A surety bond is renewed every five years. A personal surety ends on cancellation or the surety's death.",
    miss: ["$10,000 is not the amount on the FAQ.", "$15,000 is not the amount on the FAQ.", "Correct. The stated amount is $50,000.", "The FAQ requires a bond."], source: FAQ },
  { id: "la-006", study: "bond", topic: "seals-fees", difficulty: "medium", free: false,
    text: "Does the Secretary of State FAQ set a statutory fee schedule for notarial work?",
    options: ["Yes. The maximum is $5 per act", "Yes. The maximum is $2 per act", "No. The FAQ says Louisiana does not have a statutory fee schedule that sets or limits the charge", "Yes. The fee is $35 per act"],
    correct: 2, why: "The FAQ says Louisiana does not have a statutory fee schedule that determines or limits what a notary can charge. The $35 figures on that page are filing fees, not a per-act fee.",
    miss: ["The FAQ does not set a $5 act fee.", "The FAQ does not set a $2 act fee.", "Correct. No statutory act-fee schedule is stated.", "$35 is described as a commission filing fee, not the fee for each notarization."], source: FAQ },
  { id: "la-007", study: "parish", topic: "commission", difficulty: "medium", free: true,
    text: "A notary is commissioned in the parish of residence and regularly notarizes in a reciprocal parish. The notary then moves into that reciprocal parish. What does the FAQ say?",
    options: ["No transfer is needed because the parishes are reciprocal", "The commission must still be changed to the new parish of residence", "The notary must take the exam again", "The bond is cancelled automatically"],
    correct: 1, why: "The FAQ says a reciprocal arrangement allows practice in the listed parishes without another bond or exam, but a notary who changes the parish of residence must still move the commission to that parish.",
    miss: ["Reciprocity does not remove the residence-parish commission.", "Correct. The commission follows the parish of residence.", "The FAQ does not require another exam for this move.", "The FAQ does not say the bond cancels itself."], source: FAQ },
  { id: "la-008", study: "bond", topic: "seals-fees", difficulty: "easy", free: false,
    text: "Are Louisiana notaries required to use a seal, according to the FAQ?",
    options: ["Yes. A rubber stamp in a required layout", "Yes. An embosser", "No. The FAQ says a Louisiana notary's signature is the seal", "Yes, but only for property records"],
    correct: 2, why: "The FAQ answers the seal question by saying a Louisiana notary's signature is the seal.",
    miss: ["The FAQ does not require that stamp.", "The FAQ does not require an embosser.", "Correct. The signature is described as the seal.", "The answer is not limited to property records."], source: FAQ },
];

const letters = ["A", "B", "C", "D"] as const;
export function publishedLaQuestions(): Question[] {
  return rows.map((row) => ({
    question_id: row.id, state: "LA" as const, study_topic: row.study, topic: row.topic, difficulty: row.difficulty,
    question_text: row.text, option_a: row.options[0], option_b: row.options[1], option_c: row.options[2], option_d: row.options[3],
    correct_option: letters[row.correct], explanation: row.why,
    option_feedback: { A: row.miss[0], B: row.miss[1], C: row.miss[2], D: row.miss[3] },
    source_id: "la-official", source_reference: row.source, scenario_id: row.scenario_id, scenario_text: row.scenario_text,
    effective_from: "2026-01-01", effective_to: null, last_verified_at: LA_CHECKED, version: 1, is_free: row.free, status: "published" as const,
  }));
}
export function laQuestionCounts() {
  const published = publishedLaQuestions();
  return { published: published.length, free: published.filter((q) => q.is_free).length, pro: published.filter((q) => !q.is_free).length };
}
