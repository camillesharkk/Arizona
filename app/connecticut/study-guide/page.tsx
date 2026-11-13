import { ctTopics, ctCards } from '@/data/ct-content';
import { ctPaths } from '@/lib/ct-site';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ title: 'Connecticut Notary Study Guide', description: 'Connecticut rules, limits and official references for handbook practice.', path: ctPaths.study, index: false });
export default function Page() {
  return <main className="wrap hero"><h1>Connecticut Study Guide</h1><p>Use a rule’s scope and boundary to reason through the scenario.</p>
    {ctTopics.map(topic => <section className="card" id={topic.id} key={topic.id} style={{ marginTop: 24 }}><h2>{topic.label}</h2>
      {ctCards.filter(card => card.study === topic.id).map(card => <article id={card.id} key={card.id}><h3>{card.title}</h3><p>{card.rule}</p><p>{card.boundary}</p><p><a href={card.sourceUrl}>{card.source}</a>{' · '}<a href={`${ctPaths.studyCards}?topic=${topic.id}&card=${card.id}`}>Open Rule Card</a></p></article>)}
      <a className="btn btn-ghost" href={`${ctPaths.practice}?mode=practice&area=${topic.id}`}>Practice {topic.label}</a>
    </section>)}
  </main>;
}
