import type { ExamArea } from "./types.ts";

export type CaStudyTopic = {
  id: string;
  area: ExamArea;
  label: string;
};

/** Study topics under the five official exam areas. This is a site outline, not an official question distribution. */
export const caStudyTopics: CaStudyTopic[] = [
  { id: "qualification", area: "administration", label: "Qualifications and appointment" },
  { id: "education-exam", area: "administration", label: "Training and exam" },
  { id: "bond-oath", area: "administration", label: "Bond and oath" },
  { id: "address-records", area: "administration", label: "Address and commission records" },
  { id: "authority-conflict", area: "acts", label: "Authority and conflicts" },
  { id: "acknowledgment", area: "acts", label: "Acknowledgments" },
  { id: "jurat", area: "acts", label: "Jurats and oaths" },
  { id: "certificates", area: "acts", label: "Certificates" },
  { id: "subscribing-witness", area: "acts", label: "Subscribing witnesses" },
  { id: "copy-cert", area: "acts", label: "Copy certification" },
  { id: "electronic-ron", area: "acts", label: "Electronic and remote notarization" },
  { id: "identification", area: "identity", label: "Identification" },
  { id: "credible-witness", area: "identity", label: "Credible witnesses" },
  { id: "advertising-immigration", area: "immigration", label: "Advertising and immigration limits" },
  { id: "foreign-language", area: "immigration", label: "Foreign-language documents" },
  { id: "journal-thumbprint", area: "violations", label: "Journal and thumbprint" },
  { id: "seal", area: "violations", label: "Seal" },
  { id: "fees", area: "violations", label: "Fees" },
  { id: "misconduct", area: "violations", label: "Misconduct and penalties" },
];

export function caStudyLabel(id: string) {
  return caStudyTopics.find((topic) => topic.id === id)?.label || id;
}
