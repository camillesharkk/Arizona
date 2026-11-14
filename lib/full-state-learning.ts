import type { FreeStateContent } from './free-state-content';
import type { PrepGuideTopic } from '../data/prep-study-guide';

export type FullStateLearning = {
  code: FreeStateContent['code'];
  questions: FreeStateContent['questions'];
  cards: {
    id: string; study: string; title: string; front: string; rule: string;
    boundary: string; mixup: string; source: string; sourceUrl: string;
  }[];
  guideTopics: Record<string, PrepGuideTopic>;
  articles: {
    slug: string; keyword: string; intent: string; title: string; description: string;
    h1: string; kicker: string; lede: string;
    sections: { heading: string; body: string; points?: string[] }[];
    sources: { title: string; url: string }[];
    faqs: { q: string; a: string }[];
  }[];
  sources: FreeStateContent['sources'];
};
