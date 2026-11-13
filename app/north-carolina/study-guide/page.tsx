import Link from "next/link";
import { ncCards, ncTopics } from "@/data/nc-content";
import { ncPaths } from "@/lib/nc-site";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina Notary Study Guide", description: "Topic review for your North Carolina traditional notary course and first application.", path: ncPaths.study, index: false });
export default function Page() {
  return (
    <main className="wrap hero">
      <h1>North Carolina notary study guide</h1>
      <p>Use Quick 10 before class to choose what to review. After class, revisit the rule cards and practice each topic. Daily Study schedules review at 1, 7, 14 and 30 days.</p>
      <p><Link href={ncPaths.become}>First-application checklist</Link>{" · "}<Link href={`${ncPaths.home}#courses`}>Find an Approved Course</Link></p>
      {ncTopics.map(topic => (
        <section id={topic.id} className="card" key={topic.id} style={{ marginBottom: 18, scrollMarginTop: 100 }}>
          <h2>{topic.label}</h2>
          <p>{ncCards.find(card => card.study === topic.id)?.rule}</p>
          <div className="row"><Link href={`${ncPaths.studyCards}?topic=${topic.id}`}>Study This Rule</Link><Link href={`${ncPaths.practice}?mode=practice&area=${topic.id}`}>Practice This Topic</Link></div>
        </section>
      ))}
    </main>
  );
}
