import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { isTopicSlug, publicStudyCards } from "@/lib/study-cards";
import { hasArizonaPro } from "@/lib/entitlements";
import { getSession } from "@/lib/session";
import { StudyCardsClient } from "@/components/StudyCardsClient";

export const metadata = pageMeta({
  title: "Arizona Notary Study Cards",
  description: "Arizona notary study cards for every current exam topic, with the rule, a workplace example, and the official source.",
  path: paths.studyCards,
});

export default async function StudyCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  const session = await getSession();
  const pro = await hasArizonaPro(session?.id);
  const cards = publicStudyCards(pro);
  const freeCards = publicStudyCards(false).filter((card) => !card.locked && !card.pending).length;
  const allCards = publicStudyCards(true).filter((card) => !card.pending).length;
  return (
    <main className="wrap hero">
      <h1>Arizona Notary Study Cards</h1>
      <p className="lede">Flip a card for the rule. Use Previous and Next when you want the next one. Cards do not advance on their own.</p>
      {pro ? (
        <p className="notice">Pro is active. This deck includes the full set of {allCards} study cards.</p>
      ) : (
        <p className="notice">
          {freeCards} study cards are free. Pro opens the rest of the {allCards}-card deck. <Link href={paths.pricing}>View Pro</Link>
        </p>
      )}
      <StudyCardsClient cards={cards} initialTopic={isTopicSlug(topic) ? topic : "all"} />
    </main>
  );
}
