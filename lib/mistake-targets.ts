import { topics } from "@/data/exam-config";
import { caPaths } from "@/lib/ca-site";
import { caStudyTopics } from "@/lib/ca-topics";
import { hiPaths } from "@/lib/hi-site";
import { hiStudyTopics } from "@/lib/hi-topics";
import { paths } from "@/lib/paths";
import { packFor } from "@/lib/prep-pack";
import type { StateCode } from "@/lib/types";

export type MistakeTarget = { href: string } | { reason: string };

const azTopics = new Set<string>(topics.map((item) => item.id));
const caTopics = new Set(caStudyTopics.map((item) => item.id));
const hiTopics = new Set(hiStudyTopics.map((item) => item.id));

export function mistakeTargets(stateCode: StateCode, question: { topic: string; study_topic?: string; concept_ids?: string[] }): { study: MistakeTarget; practice: MistakeTarget } {
  const pack = packFor(stateCode);
  if (pack) {
    const topic = question.study_topic || "";
    const known = pack.topics.some((item) => item.id === topic);
    if (!known) {
      return { study: { reason: "No study chapter for this question." }, practice: { reason: "No topic practice for this question." } };
    }
    return {
      study: { href: stateCode === "NC" ? `${pack.paths.studyCards}?topic=${topic}` : stateCode === "CT" && question.concept_ids?.[0] ? `${pack.paths.studyCards}?topic=${topic}&card=${question.concept_ids[0]}` : `${pack.paths.study}?chapter=${topic}#${topic}` },
      practice: { href: `${pack.paths.practice}?mode=practice&area=${topic}` },
    };
  }
  if (stateCode === "AZ") {
    const topic = question.topic;
    if (!azTopics.has(topic)) {
      return { study: { reason: "No Arizona chapter for this question." }, practice: { reason: "No Arizona topic practice for this question." } };
    }
    return { study: { href: `${paths.study}#${topic}` }, practice: { href: paths.topic(topic) } };
  }
  const topic = question.study_topic || "";
  const known = (stateCode === "HI" ? hiTopics : caTopics).has(topic);
  const site = stateCode === "HI" ? hiPaths : caPaths;
  if (!known) {
    return { study: { reason: "No study chapter for this question." }, practice: { reason: "No topic practice for this question." } };
  }
  return {
    study: { href: `${site.study}?chapter=${topic}#${topic}` },
    practice: { href: `${site.practice}?mode=practice&area=${topic}` },
  };
}
