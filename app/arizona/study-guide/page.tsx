import Link from "next/link";
import { chapters } from "@/data/study-guide";
import { getSource } from "@/data/sources";
import { StudyGuide } from "@/components/StudyGuide";
import { paths } from "@/lib/paths";
import { eligibleExamPool } from "@/lib/quiz";
import { pageMeta } from "@/lib/seo";

const chapterReferences: Record<string, string[]> = {
  identification: ["ars_41_253", "ars_41_254", "ars_41_256"],
  acknowledgments: ["ars_41_254", "ars_41_264"],
  jurats: ["ars_41_253", "ars_41_264"],
  journals: ["az_sb_1479_2026"],
  "seals-fees": ["ars_41_267", "ars_41_316"],
  "prohibited-acts": ["ars_41_252", "ars_41_256"],
  "copy-certification": ["ars_41_252", "ars_41_319"],
  "electronic-ron": ["sos_remote_enotary", "az_sb_1479_2026"],
  "after-exam": ["ars_41_269"],
};

export const metadata = pageMeta({
  title: "Free Arizona Notary Study Guide 2026 | Rules & Examples",
  description: "Learn Arizona notary identification, notarial acts, journals, seals and prohibited acts with worked examples, official sources and topic practice. Free, no login.",
  path: paths.study,
});

export default function StudyGuidePage() {
  return <StudyGuide
    stateCode="AZ"
    title="Free Arizona Notary Study Guide 2026 — Rules, Examples & Topic Practice"
    lede="Learn what to do when an ID is damaged, a signer refuses an oath, or a document involves a conflict of interest. Every chapter includes a worked scenario, an official source and topic practice. The core guide is free and requires no login."
    introduction={<p>
      Use this guide alongside the <a href={getSource("sos_manual_2026_08").url}>official SOS Reference Manual</a>.
      The current SOS download is named “Notary-Manual-Aug-2026.pdf”; its cover says January 2025.
      For later changes, use the <Link href={paths.laws}>verified Arizona law updates</Link> and chaptered statutes.
    </p>}
    sitePaths={paths}
    fullExamLabel="Full 45 practice exam"
    chapters={chapters.map((chapter) => ({
      ...chapter,
      source: getSource(chapter.source_id),
      references: chapterReferences[chapter.id]?.map(getSource),
      practiceHref: paths.topic(chapter.topic),
      cardsHref: `${paths.studyCards}?topic=${chapter.topic}`,
      mistakesHref: `${paths.mistakes}?topic=${chapter.topic}`,
      hasFreePractice: eligibleExamPool({ topic: chapter.topic, freeOnly: true }).length > 0,
      afterSource: chapter.id === "new-laws" ? <p><Link href={paths.laws}>Read the verified change and its effective date</Link></p> : undefined,
    }))}
  />;
}
