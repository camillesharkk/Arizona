import { flashcards } from "@/data/flashcards";
import { examConfig } from "@/data/exam-config";
import { getSource } from "@/data/sources";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { HOME_STUDY_CARD_IDS } from "@/lib/study-cards";
import { JsonLd, quizJson } from "@/components/JsonLd";
import { AccountStatusBanner } from "@/components/AccountStatusBanner";
import { HomeStudy } from "@/components/HomeStudy";
import { eligibleExamPool } from "@/lib/quiz";
import { FREE_FULL_EXAMS, FREE_FLASHCARD_PREVIEW, PRO_DURATION_DAYS } from "@/lib/product";
import Link from "next/link";

const cardsById = new Map(flashcards.map((card) => [card.id, card]));
const previewCards = HOME_STUDY_CARD_IDS.flatMap((id) => {
  const card = cardsById.get(id);
  if (!card) return [];
  const source = getSource(card.source_id);
  return [{
    id: card.id,
    category: card.category,
    front: card.front,
    back: card.back,
    title: card.title,
    rule: card.rule,
    boundary: card.boundary,
    example: card.example,
    mixup: card.mixup,
    memory: card.memory,
    kind: card.kind,
    compare: card.compare,
    practiceHref: card.topic ? paths.topic(card.topic) : undefined,
    source: source.reference,
    sourceUrl: source.url,
  }];
});

const practicePool = eligibleExamPool();
const freeQuestionCount = practicePool.filter((question) => question.is_free).length;

export const metadata = pageMeta({
  title: "Arizona Notary Exam Prep",
  description: "Learn Arizona notary rules with study cards, practice questions, and mistake review. Independent exam preparation.",
  path: paths.home,
});

export default function ArizonaHub() {
  return (
    <main className="home-canvas">
      <div className="wrap home-main">
        <JsonLd data={quizJson()} />
        <AccountStatusBanner />
        <h1>Arizona Notary Exam Prep</h1>
        <p className="home-lead">Learn the rules. Practice with scenarios. Review your mistakes. Start free. Pro opens the rest of the practice bank, study cards, and full exams.</p>
        <HomeStudy cards={previewCards} />

        <section className="home-block" aria-labelledby="free-pro-heading">
          <h2 id="free-pro-heading">Free and Pro</h2>
          <div className="home-split">
            <div>
              <h3>Free</h3>
              <ul className="home-plain">
                <li>{freeQuestionCount} practice questions</li>
                <li>{FREE_FLASHCARD_PREVIEW} study cards to start</li>
                <li>{FREE_FULL_EXAMS} full practice exam on a free account. Before sign-in, this browser can start {FREE_FULL_EXAMS}. That limit is not one exam per person.</li>
              </ul>
            </div>
            <div>
              <h3>Pro</h3>
              <ul className="home-plain">
                <li>All {practicePool.length} practice questions</li>
                <li>The full study-card deck</li>
                <li>{PRO_DURATION_DAYS}-day access</li>
              </ul>
            </div>
          </div>
          <p><Link href={paths.pricing}>View Pro</Link></p>
        </section>

        <section className="home-block" aria-labelledby="resources-heading">
          <h2 id="resources-heading">Study Resources</h2>
          <ul className="home-links home-split">
            <li><Link href={paths.study}>Study Guide</Link></li>
            <li><Link href={paths.guidesIndex}>Exam Information</Link></li>
            <li><Link href={paths.become}>How to Become a Notary</Link></li>
            <li><Link href={paths.laws}>New laws</Link></li>
          </ul>
        </section>

        <section className="home-block home-about" aria-labelledby="trust-heading">
          <h2 id="trust-heading">About this prep</h2>
          <p className="home-about-copy">Items cite an official source and the date it was checked.</p>
          <div className="home-about-sources">
            <a href={examConfig.officialFilingUrl}>Secretary of State</a>
            <a href={examConfig.officialManualUrl}>Notary manual</a>
          </div>
          <div className="home-about-links">
            <Link href={paths.disclaimer}>Disclaimer</Link>
            <Link href={paths.contact}>Contact us about a correction</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
