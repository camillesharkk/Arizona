import { MemberCopy } from "@/components/MemberCopy";
import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { prepPacks } from "@/lib/prep-pack";
import { prepGuideTopics } from "@/data/prep-study-guide";
import { StudyGuide } from "@/components/StudyGuide";
import Link from "next/link";
import { NY_CHECKED } from "@/data/ny-content";
import { PA_CHECKED } from "@/data/pa-content";
import { LA_CHECKED } from "@/data/la-content";

const codes: Record<string, "CT" | "IN" | "NC" | "NY" | "PA" | "LA"> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", indiana: "IN" };
const checkedOn = { NY: NY_CHECKED, PA: PA_CHECKED, LA: LA_CHECKED, CT: "2026-11-13", NC: "2026-11-13", IN: "2026-11-13" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  if (!prepPageEnabled(state)) notFound();
  const code = codes[state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const questions = pack.questions();
  return <StudyGuide
    stateCode={code}
    title={<><MemberCopy member={null}>Free </MemberCopy>{pack.name} Notary Study Guide 2026 — Rules, Examples &amp; Topic Practice</>}
    lede={<>Learn {pack.name} notary rules through chapter explanations, worked scenarios and key facts. Follow the official sources, mark your reading progress and practice each topic. <MemberCopy member="The core guide is included in your study tools.">The core guide is free and requires no login.</MemberCopy></>}
    introduction={<>
      <p>Use this guide alongside the <Link href={pack.paths.resources}>official state resources</Link> and <Link href={pack.paths.laws}>notary laws</Link>. The <Link href={pack.paths.examGuide}>exam guide</Link> covers preparation and admission. Chapter groups are this site's study outline.</p>
      {code === "NY" ? <>
        <p className="notice">
          This site's full practice uses {pack.fullCount} questions in {pack.fullMinutes} minutes. The <a href="https://dos.ny.gov/july-december-2026-notary-written-exam-info-and-schedule">New York Department of State exam bulletin</a> describes a multiple-choice exam with one hour after the instructions and results reported as pass or fail. It gives neither a question count nor a numeric passing score.
        </p>
        <section className="card">
          <h2>Studying for a retake</h2>
          <p>Start with <Link href={pack.paths.practice + "?mode=quick"}>Quick 10</Link> to find topics that need another look. Reread the matching chapter, use the practice explanations to rule out each wrong option, and try a fresh scenario with the chapter’s <strong>Practice This Topic</strong> button.</p>
          <p>Use the <Link href={pack.paths.studyCards + "?topic=appointment"}>appointment and notarial-act cards</Link> for terms such as acknowledgments and oaths, the <Link href={pack.paths.studyCards + "?topic=fees"}>fee cards</Link> for charges that are easy to confuse, or the <Link href={pack.paths.studyCards + "?topic=electronic"}>electronic notarization cards</Link> for identity and remote-appearance rules.</p>
        </section>
      </> : <p>{pack.fullDetail}</p>}
      {pack.practiceNotice && <p className="notice">{pack.practiceNotice.body}</p>}
    </>}
    sitePaths={pack.paths}
    fullExamLabel={pack.fullTitle}
    chapters={pack.topics.map((topic) => {
      const material = prepGuideTopics[code]?.[topic.id];
      if (!material) throw new Error(`Missing guide material: ${code}/${topic.id}`);
      const concepts = pack.cards.filter((card) => card.study === topic.id);
      return {
        id: topic.id,
        title: topic.label,
        summary: material.summary,
        sections: [
          ...(material.sections || []),
          ...concepts.map((concept) => ({
            heading: concept.front,
            body: `${concept.rule} ${concept.boundary} ${concept.mixup}`,
            source: { title: concept.source, url: concept.sourceUrl },
          })),
        ],
        example: material.example,
        keyFacts: material.keyFacts,
        source: { title: concepts[0].source, url: concepts[0].sourceUrl, reference: `State source review ${checkedOn[code]} · Guide review 2026-11-13` },
        practiceHref: `${pack.paths.practice}?mode=practice&area=${encodeURIComponent(topic.id)}`,
        cardsHref: `${pack.paths.studyCards}?topic=${encodeURIComponent(topic.id)}`,
        mistakesHref: `${pack.paths.mistakes}?topic=${encodeURIComponent(topic.id)}`,
        hasFreePractice: questions.some((question) => question.is_free && question.study_topic === topic.id),
      };
    })}
  />;
}
