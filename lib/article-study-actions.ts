import { paths } from './paths';
import { caPaths } from './ca-site';
import { hiPaths } from './hi-site';
import { packNavigationFor } from './prep-navigation';
import { freeStateFeatures, isFreeState } from './free-state-catalog';
import type { ArticleLink } from './state-articles';
import type { StateCode } from './types';

export function articlePaths(state: StateCode) {
  const navigation = packNavigationFor(state);
  if (navigation) return navigation.paths;
  if (state === 'CA') return caPaths;
  if (state === 'HI') return hiPaths;
  return paths;
}

export function articleStudyActions(state: StateCode): ArticleLink[] {
  const site = articlePaths(state);
  const features = isFreeState(state) ? freeStateFeatures[state] : undefined;
  return [
    { href: `${site.practice}?mode=quick`, label: 'Try 10 free questions', placement: 'section', targetMode: 'quick' },
    { href: site.study, label: 'Review the Study Guide', placement: 'section', targetMode: 'guide' },
    ...(features?.fullPractice === false ? [] : [{ href: `${site.practice}?mode=full`, label: 'Start full practice', placement: 'end', targetMode: 'full' } as const]),
    ...(features?.purchase === false ? [{ href: site.questions, label: 'Review practice questions', placement: 'end', targetMode: 'topic' } as const] : [{ href: site.pricing, label: 'Compare Pro plans', placement: 'end', targetMode: 'pricing' } as const]),
  ];
}
