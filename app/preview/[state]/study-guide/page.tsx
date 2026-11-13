import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";
import { prepGuideTopics } from "@/data/prep-study-guide";
import { StudyGuide } from "@/components/StudyGuide";
import Link from "next/link";
import { NY_CHECKED } from "@/data/ny-content";
import { PA_CHECKED } from "@/data/pa-content";
import { LA_CHECKED } from "@/data/la-content";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };
const checkedOn = { NY: NY_CHECKED, PA: PA_CHECKED, LA: LA_CHECKED };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  if (!prepPageEnabled(state)) notFound();
  const code = codes[state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const questions = pack.questions();
  return <StudyGuide
    stateCode={code}
    title={`Free ${pack.name} Notary Study Guide 2026 — Rules, Examples & Topic Practice`}
    lede={`Learn ${pack.name} notary rules through chapter explanations, worked scenarios and key facts. Follow the official sources, mark your reading progress and practice each topic. The core guide is free and requires no login.`}
    introduction={<>
      <p>Use this guide alongside the <Link href={pack.paths.resources}>official state resources</Link> and <Link href={pack.paths.laws}>notary laws</Link>. The <Link href={pack.paths.examGuide}>exam guide</Link> covers preparation and admission. Chapter groups are this site's study outline.</p>
      <p>{pack.fullDetail}</p>
      {pack.practiceNotice && <p className="notice">{pack.practiceNotice.body}</p>}
    </>}
    sitePaths={pack.paths}
    fullExamLabel={pack.fullTitle}
    chapters={pack.topics.map((topic) => {
      const material = prepGuideTopics[code][topic.id];
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
