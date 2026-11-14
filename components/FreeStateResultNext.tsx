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
    </div>
  </>;
}
