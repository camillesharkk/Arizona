import ar from './seo-articles/ar.json';
import az from './seo-articles/az.json';
import ca from './seo-articles/ca.json';
import co from './seo-articles/co.json';
import ct from './seo-articles/ct.json';
import hi from './seo-articles/hi.json';
import il from './seo-articles/il.json';
import indiana from './seo-articles/in.json';
import la from './seo-articles/la.json';
import md from './seo-articles/md.json';
import me from './seo-articles/me.json';
import mo from './seo-articles/mo.json';
import mt from './seo-articles/mt.json';
import nc from './seo-articles/nc.json';
import ne from './seo-articles/ne.json';
import nj from './seo-articles/nj.json';
import nm from './seo-articles/nm.json';
import nv from './seo-articles/nv.json';
import ny from './seo-articles/ny.json';
import oh from './seo-articles/oh.json';
import or from './seo-articles/or.json';
import pa from './seo-articles/pa.json';
import ri from './seo-articles/ri.json';
import tx from './seo-articles/tx.json';
import ut from './seo-articles/ut.json';
import vt from './seo-articles/vt.json';
import wi from './seo-articles/wi.json';
import wy from './seo-articles/wy.json';
import { articlePaths, articleStudyActions } from '@/lib/article-study-actions';
import { prepStates } from '@/lib/states';
import type { StateArticle } from '@/lib/state-articles';
import type { StateCode } from '@/lib/types';

const drafts = { AR: ar, AZ: az, CA: ca, CO: co, CT: ct, HI: hi, IL: il, IN: indiana, LA: la, MD: md, ME: me, MO: mo, MT: mt, NC: nc, NE: ne, NJ: nj, NM: nm, NV: nv, NY: ny, OH: oh, OR: or, PA: pa, RI: ri, TX: tx, UT: ut, VT: vt, WI: wi, WY: wy };

export const supplementalArticles = Object.fromEntries(Object.entries(drafts).map(([code, draft]) => {
  const state = code as StateCode;
  const site = articlePaths(state);
  const catalog = prepStates.find(item => item.code === state)!;
  const articlePath = (slug: string) => state === 'CA' || state === 'HI' ? `${site.home}${slug}/` : `/${catalog.slug}/guides/${slug}/`;
  const actions = articleStudyActions(state);
  const endAction = actions.find(action => action.targetMode === 'full') || actions[0];
  const articles: StateArticle[] = draft.articles.map(article => ({
    id: `${code.toLowerCase()}-${article.slug}`,
    state,
    slug: article.slug,
    path: articlePath(article.slug),
    keyword: article.title,
    intent: article.description,
    title: article.title,
    description: article.description,
    h1: article.title,
    kicker: 'Preparation',
    lede: article.lede,
    updated: '2026-11-17',
    checked: 'Official source review dates are listed with the references below.',
    ledeCta: { ...actions[0], placement: 'lede' },
    sections: [
      ...article.sections.map(section => ({
        heading: section.heading,
        body: section.body,
        ...('study' in section && section.study ? { link: actions.find(action => action.targetMode === 'guide')! } : {}),
      })),
      ...draft.sources.map(source => ({
        heading: source.label,
        body: `Official source last reviewed ${source.checked}. Use the linked instructions for the current requirements and the application route that applies to you.`,
        link: { href: source.url, label: source.label, placement: 'section' as const, targetMode: 'official' as const },
      })),
    ],
    endCta: { ...endAction, placement: 'end' },
    related: [
      ...draft.articles.filter(other => other.slug !== article.slug).map(other => ({ href: articlePath(other.slug), label: other.title })),
      { href: state === 'AZ' ? '/arizona-notary-exam-guides/' : site.resources, label: `More ${catalog.name} study articles` },
      { href: site.become, label: `${catalog.name} application guide` },
    ],
  }));
  return [state, articles];
})) as Record<StateCode, StateArticle[]>;
