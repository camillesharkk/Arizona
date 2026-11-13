import type { Question, TopicId } from "../lib/types";
import { ncIdentityRows } from "./nc-identity";
import { ncActRows } from "./nc-acts";
import { ncCertificateRows } from "./nc-certificates";
import { ncConflictRows } from "./nc-conflicts";
import { ncFeeSealRows } from "./nc-fees-seals";
import { ncRecordRows } from "./nc-records";
export { ncCards } from "./nc-cards";
import { ncConceptCardIds } from "./nc-cards";

export const NC_CHECKED = "2026-11-13";
export const ncTopics = [
  { id: "identity", label: "Identity and personal appearance" },
  { id: "acts", label: "Acknowledgments, oaths and proofs" },
  { id: "certificates", label: "Certificates and signatures" },
  { id: "conflicts", label: "Conflicts, refusal and authority" },
  { id: "fees", label: "Fees and travel" },
  { id: "seals", label: "Seals and security" },
  { id: "records", label: "Journals and confidentiality" },
  { id: "commission", label: "Traditional commission foundations" },
];

export type NcRow = {
  id: string;
  study: (typeof ncTopics)[number]["id"];
  reference: string;
  concept: string;
  text: string;
  answer: string;
  explanation: string;
  wrong: [string, string][];
};

export { ncSources } from "./nc-sources";

const topicMap: Record<string, TopicId> = {
  identity: "identification", acts: "acknowledgments", certificates: "jurats", conflicts: "prohibited-acts",
  fees: "seals-fees", seals: "seals-fees", records: "journals", commission: "commission",
};
const rows = [...ncIdentityRows, ...ncActRows, ...ncCertificateRows, ...ncConflictRows, ...ncFeeSealRows, ...ncRecordRows]
  .sort((a, b) => a.id.localeCompare(b.id));
const letters = ["A", "B", "C", "D"] as const;
// Curated free foundations cover all eight topics, with sixty stable ids in total.
const freeIds = new Set([
  "001","003","005","008","013","019","025","031",
  "033","037","038","040","043","049","052","060",
  "069","071","074","075","077","079","082","085",
  "105","108","112","118","121","126","130","134",
  "140","142","143","145","146","147","150","153",
  "158","160","162","163","165","166","169","171",
  "174","175","178","180","183","187","190",
  "194","196","199","200","201",
].map(id => `nc-${id}`));

const advancedConcepts = new Set([
  "nc-card-proof-signature", "nc-card-nonsubscribing-certificate", "nc-card-designee-notation",
  "nc-card-designee-witness-signatures", "nc-card-designee-notarization", "nc-card-special-certificate",
  "nc-card-trustee-exception", "nc-card-drafter-exception", "nc-card-attorney-party-exception",
  "nc-card-exception-limits", "nc-card-professional-fees", "nc-card-technical-cure",
  "nc-card-expiration-cure", "nc-card-blank-cure", "nc-card-poa-recording-blank",
  "nc-card-journal-addresses", "nc-card-travel-consent-content",
]);
const foundationConcepts = new Set([
  "nc-card-id-document", "nc-card-current-id", "nc-card-photo-required", "nc-card-personal-knowledge",
  "nc-card-oath", "nc-card-affirmation", "nc-card-jurat", "nc-card-authorized-acts",
  "nc-card-certificate-required", "nc-card-english-certificate", "nc-card-official-signature",
  "nc-card-ten-dollar-signature", "nc-card-fee-waiver", "nc-card-absentee-fee",
  "nc-card-seal-ownership", "nc-card-seal-security", "nc-card-no-seal-sharing",
  "nc-card-traditional-journal", "nc-card-five-year-term", "nc-card-application-fee",
]);
export function publishedNcQuestions(): Question[] {
  return rows.map((row, index) => {
    const choices = [[row.answer, row.explanation], ...row.wrong];
    const offset = index % 4;
    const ordered = [...choices.slice(4 - offset), ...choices.slice(0, 4 - offset)];
    const statute = row.reference.match(/G\.S\. 10B-(\d+)/);
    return {
      question_id: row.id, state: "NC", study_topic: row.study, topic: topicMap[row.study],
      difficulty: advancedConcepts.has(row.concept) ? "hard" : foundationConcepts.has(row.concept) ? "easy" : "medium",
      question_text: row.text, option_a: ordered[0][0], option_b: ordered[1][0], option_c: ordered[2][0], option_d: ordered[3][0],
      correct_option: letters[offset], explanation: row.explanation,
      option_feedback: { A: ordered[0][1], B: ordered[1][1], C: ordered[2][1], D: ordered[3][1] },
      source_id: row.reference.startsWith("SOS") ? "nc-sos-manual" : statute ? `nc-10b-${statute[1]}` : "nc-rules",
      source_reference: row.reference, concept_ids: [ncConceptCardIds[row.concept]],
      effective_from: "2026-11-13", effective_to: null, last_verified_at: NC_CHECKED,
      version: 1, is_free: freeIds.has(row.id), status: "published",
    };
  });
}

export function ncQuestionCounts() {
  const questions = publishedNcQuestions();
  return { published: questions.length, free: questions.filter(question => question.is_free).length, pro: questions.filter(question => !question.is_free).length };
}
