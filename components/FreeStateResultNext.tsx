import { fullStateSummary } from '@/data/full-state-summary';
import Link from 'next/link';
import { freeStateContent } from '@/data/free-state-content';
import { freeStatePaths, type FreeStateCode } from '@/lib/free-state-catalog';

export function FreeStateResultNext({ code, attemptId }: { code: FreeStateCode; attemptId: string }) {
  const content = freeStateContent[code]!;
  const site = freeStatePaths(content.slug);
  return <>
    <p className="lede">Your {content.name} practice result.</p>
    <div className="result-next">
      <Link className="btn btn-primary" href={`${site.mistakes}?attempt=${encodeURIComponent(attemptId)}`}>Review wrong answers</Link>
      <Link className="btn btn-ghost" href={site.study}>Review Study Guide</Link>
      <a className="btn btn-ghost" href={content.officialNext.url}>{content.officialNext.label}</a>
      {fullStateSummary[code]?.ready ? <><Link className="btn btn-ghost" href={site.studyCards}>Review Study Cards</Link>
        <Link className="btn btn-ghost" href={site.daily}>Daily Study</Link><Link className="btn btn-ghost" href={`${site.practice}?mode=full`}>Comprehensive Practice</Link>
        <Link className="btn btn-ghost" href={site.pricing}>60-Day Pro</Link></> : null}
    </div>
  </>;
}
