import { ctPaths, ctSources, CT_CHECKED_ON } from '@/lib/ct-site';
import { ctArticles } from '@/data/ct-articles';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ title: 'Connecticut Official Notary Resources', description: 'Current licensing, manual, forms and statutory sources for Connecticut notaries.', path: ctPaths.resources, index: true });
export default function Page() {
  return <main className="wrap hero"><h1>Connecticut Official Resources</h1><p>Sources checked {CT_CHECKED_ON}. The currently linked manual is Rev. 2026-1, although its URL retains “rev2023”.</p>
    <ul>{Object.entries({ licensing: 'Secretary’s Licensing Instructions', manual: 'Official Manual, Rev. 2026-1', forms: 'Current Required Forms', statutes: 'Connecticut General Statutes, Chapter 33', feeAct: 'P.A. 26-81, Current Fee Amendment', application: 'eLicense Official Application' }).map(([key, label]) => <li key={key}><a href={ctSources[key as keyof typeof ctSources]} target="_blank" rel="noopener noreferrer">{label}</a></li>)}</ul>
    <section className="card"><h2>Current fee amendment</h2><p>Effective July 1, 2026, the notarial-act fee ceiling is $10, plus mileage capped at the IRS business standard mileage rate. P.A. 26-81 §13 and the current manual replace the older fee figures.</p><a href={ctSources.feeAct}>Read P.A. 26-81 §13</a></section>
    <section className="card"><h2>Read the rule for the specific act</h2><p>Manual §4.2 specifically permits an earlier signature for an acknowledgment when the signer appears and acknowledges it. A jurat requires signing in the notary’s presence and an oath or affirmation. Use the act-specific rule together with C.G.S. §3-94a. Remote acts follow the separate requirements and exclusions of §3-95b.</p><a href={ctSources.manual}>Open the Current Manual</a></section>
    <section className="card"><h2>Connecticut Reading Guides</h2>{ctArticles.map(article => <p key={article.id}><a href={article.path}>{article.title}</a></p>)}</section>
    <p><a href={ctPaths.become}>First Application Checklist</a></p>
  </main>;
}
