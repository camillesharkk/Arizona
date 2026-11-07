import type { ExamArea, TopicId } from "./types.ts";

export type HiStudyTopic = {
  id: string;
  area: ExamArea;
  topic: TopicId;
  label: string;
};

/** Site study outline. Hawaii has not published exam weights. */
export const hiStudyTopics: HiStudyTopic[] = [
  { id: "qualification", area: "administration", topic: "commission", label: "Qualifications" },
  { id: "application-exam", area: "administration", topic: "commission", label: "Application and exam" },
  { id: "term-renewal", area: "administration", topic: "commission", label: "Term and renewal" },
  { id: "authority", area: "acts", topic: "prohibited-acts", label: "Authority and conflicts" },
  { id: "identity", area: "identity", topic: "identification", label: "Identity" },
  { id: "acknowledgment", area: "acts", topic: "acknowledgments", label: "Acknowledgments" },
  { id: "jurat-oath", area: "acts", topic: "jurats", label: "Jurats and oaths" },
  { id: "certificate-seal", area: "acts", topic: "seals-fees", label: "Certificate and seal" },
  { id: "journal", area: "violations", topic: "journals", label: "Journal" },
  { id: "documents", area: "acts", topic: "copy-certification", label: "Document problems" },
  { id: "fees-bond", area: "administration", topic: "seals-fees", label: "Fees and bond" },
  { id: "refusal-misconduct", area: "violations", topic: "prohibited-acts", label: "Refusal and penalties" },
  { id: "authentication", area: "violations", topic: "new-laws", label: "Authentication and apostille" },
  { id: "remote-online", area: "acts", topic: "electronic-ron", label: "Remote online notarization" },
];

export function hiStudyLabel(id: string) {
  return hiStudyTopics.find((topic) => topic.id === id)?.label || id;
}

export function hiTopicMeta(id: string) {
  return hiStudyTopics.find((topic) => topic.id === id) || hiStudyTopics[0];
}
