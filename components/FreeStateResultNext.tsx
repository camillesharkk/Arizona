import { fullStateReady } from '@/data/full-state-ready';
import { packFor } from '@/lib/client-pack';
import Link from 'next/link';
import type { FreeStateCode } from '@/lib/free-state-catalog';

export function FreeStateResultNext({ code, attemptId }: { code: FreeStateCode; attemptId: string }) {
  const pack = packFor(code);
  if (!pack) return null;
  const site = pack.paths;
  return <>
    <p className="lede">Your {pack.name} practice result.</p>
    <div className="result-next">
      <Link className="btn btn-primary" href={`${site.mistakes}?attempt=${encodeURIComponent(attemptId)}`}>Review wrong answers</Link>
      <Link className="btn btn-ghost" href={site.study}>Review Study Guide</Link>
      {pack.officialNext && <a className="btn btn-ghost" href={pack.officialNext.url}>{pack.officialNext.label}</a>}
      {fullStateReady[code] ? <><Link className="btn btn-ghost" href={site.studyCards}>Review Study Cards</Link>
        <Link className="btn btn-ghost" href={site.daily}>Daily Study</Link>        {pack?.fullReady ? <Link className="btn btn-ghost" href={`${site.practice}?mode=full`}>{pack.fullTitle}</Link> : null}
        {pack?.purchaseEnabled !== false ? <Link className="btn btn-ghost" href={site.pricing}>60-Day Pro</Link> : null}</> : null}
    </div>
  </>;
}
