import Link from "next/link";
import { IndianaGuide } from "@/components/IndianaGuide";
import { inPaths } from "@/lib/in-site";
import { prepPacks } from "@/lib/prep-pack";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "Indiana Notary Study Guide", description: "Learn Indiana notary rules by topic and follow the official application steps.", path: "/indiana/study-guide/", index: false });
export default function Page() {
 const pack=prepPacks.IN;
 return <IndianaGuide study><h2>Study the rules by topic</h2><p>{pack.cards.length} independent published cards connect these rules to topic practice.</p>{pack.topics.map(topic => <section className="card" key={topic.id} id={topic.id}><h3>{topic.label}</h3><p>{pack.cards.filter(c=>c.study===topic.id).map(c=>c.title).join(" · ")}</p><div className="row"><Link className="btn btn-ghost" href={`${inPaths.studyCards}?topic=${topic.id}`}>Study This Rule</Link><Link className="btn btn-primary" href={`${inPaths.practice}?mode=practice&area=${topic.id}`}>Practice This Topic</Link></div></section>)}</IndianaGuide>;
}
