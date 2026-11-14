import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { testLoader } from './pack-test-utils.mjs';

const load = testLoader();
const { freeStateCatalog } = load('lib/free-state-catalog.ts');
const { freeStateContent } = load('data/free-state-content.ts');
const { stateQuestion } = load('lib/state-question.ts');
const canonicalTopics = new Set(load('data/exam-config.ts').topics.map(topic => topic.id));
const root = path.resolve('data/full-states');
fs.mkdirSync(root, { recursive: true });
const questions = {}, summaries = {}, cards = {}, guides = {}, articles = {}, sources = {}, completed = [];

function distinct(items, select, name) {
  const values = items.map(select);
  assert.equal(new Set(values).size, values.length, name);
}

function normalizeStem(value) {
  return value.toLowerCase().replace(/\d+/g, '#').replace(/[^a-z#]+/g, ' ').trim();
}

function selectFree(bank, topics) {
  const ids = new Set(bank.slice(0, 10).map(question => question.id));
  const groups = topics.map(topic => bank.filter(question => question.studyTopic === topic.id && !ids.has(question.id)));
  for (let round = 0; ids.size < 60; round++) {
    let added = false;
    for (const group of groups) {
      if (ids.size === 60) break;
      if (group[round]) { ids.add(group[round].id); added = true; }
    }
    assert.ok(added, 'Free pool fills sixty unique questions');
  }
  return ids;
}

for (const [code, name, slug] of freeStateCatalog) {
  const candidate = path.join(root, `${code}.json`);
  if (process.argv.includes('--import-authoring')) {
    const authored = `D:/webtest/state17-full-content/${code}.json`;
    if (fs.existsSync(authored)) fs.copyFileSync(authored, candidate);
    const audit = `D:/webtest/state17-full-content/${code}-audit.md`;
    if (fs.existsSync(audit)) fs.copyFileSync(audit, `docs/full-state-${code}-sources-2026-11-14.md`);
  }
  if (!fs.existsSync(candidate)) continue;
  const content = JSON.parse(fs.readFileSync(candidate, 'utf8').replace(/^\uFEFF/, ''));
  if (process.argv.includes('--allow-incomplete') && (content.questions?.length !== 193 || content.cards?.length < 50 || content.articles?.length !== 10)) continue;
  assert.ok(!JSON.stringify(content).includes('\uFFFD'), `${code} clean Unicode content`);
  const base = freeStateContent[code];
  assert.equal(content.code, code);
  assert.equal(content.questions.length, 193, `${code} additional questions`);
  const bank = [...base.questions, ...content.questions];
  const topicIds = new Set(base.topics.map(topic => topic.id));
  const referenceIds = new Set([...base.sources, ...content.sources].map(source => source.id));
  distinct(bank, question => question.id, `${code} unique question ids`);
  distinct(bank, question => normalizeStem(question.stem), `${code} unique factual scenarios`);
  for (let index = 0; index < bank.length; index++) {
    const question = bank[index];
    assert.equal(question.id, `${code.toLowerCase()}-${String(index + 1).padStart(3, '0')}`);
    assert.ok(canonicalTopics.has(question.topic), `${question.id} canonical topic`);
    assert.ok(topicIds.has(question.studyTopic), `${question.id} study topic`);
    assert.equal(question.options.length, 4);
    distinct(question.options, option => option.trim().toLowerCase(), `${question.id} choices`);
    assert.ok(['A', 'B', 'C', 'D'].includes(question.answer));
    assert.equal(question.feedback.length, 4);
    assert.ok(question.feedback.every(note => note.length > 5));
    assert.ok(question.explanation.length > 20);
    assert.ok(referenceIds.has(question.sourceId), `${question.id} registered official reference`);
    assert.ok(question.reference.trim().length > 0, `${question.id} pinpoint reference`);
  }
  assert.ok(content.cards.length >= 50, `${code} independent cards`);
  distinct(content.cards, card => card.id, `${code} card ids`);
  distinct(content.cards, card => card.front.toLowerCase().trim(), `${code} independent card fronts`);
  for (const card of content.cards) {
    assert.ok(topicIds.has(card.study));
    assert.ok(card.sourceUrl.startsWith('https://'));
    assert.ok([card.rule, card.boundary, card.mixup].every(value => value.trim().length > 0), `${code}/${card.id} rule and boundaries`);
    assert.ok(!bank.some(question => normalizeStem(question.stem) === normalizeStem(card.front)));
  }
  for (const topic of base.topics) {
    assert.ok(content.cards.filter(card => card.study === topic.id).length >= 3, `${code}/${topic.id} concepts`);
    const guide = content.guideTopics[topic.id];
    assert.ok(guide?.summary?.length > 30);
    assert.ok(guide.sections?.length >= 2 && guide.sections.every(section => section.body.length > 100));
    assert.ok(guide.example?.body?.length > 100 && guide.keyFacts?.length >= 3);
  }
  assert.equal(content.articles.length, 10, `${code} separate articles`);
  distinct(content.articles, article => article.slug, `${code} article URLs`);
  for (const article of content.articles) {
    assert.ok(article.sections.length >= 4);
    assert.ok(article.sections.reduce((sum, section) => sum + section.body.length, 0) >= 1200, `${code}/${article.slug} substantive article`);
    assert.ok(article.sources.length && article.sources.every(source => source.url.startsWith('https://')));
    assert.ok(article.faqs.length >= 2);
  }
  const freeIds = selectFree(bank, base.topics);
  const publicQuestions = bank.filter(question => freeIds.has(question.id)).map(question => stateQuestion(code, question, true));
  questions[code] = publicQuestions;
  summaries[code] = { published: bank.length, free: freeIds.size, pro: bank.length - freeIds.size, cards: content.cards.length, articles: content.articles.length, ready: true, freeQuestionIds: [...freeIds] };
  cards[code] = content.cards;
  guides[code] = content.guideTopics;
  articles[code] = content.articles.map(({ sources: articleSources, ...article }) => ({
    ...article, id: `${code.toLowerCase()}-${article.slug}`, state: code, path: `/${slug}/guides/${article.slug}/`,
    checked: '2026-11-14', updated: '2026-11-14',
    ledeCta: { href: `/${slug}/practice/?mode=quick`, label: 'Start Free Quick 10', placement: 'lede', targetMode: 'quick' },
    endCta: { href: `/${slug}/practice/?mode=full`, label: 'Start Comprehensive Practice', placement: 'end', targetMode: 'full' },
    related: [{ href: `/${slug}/study-guide/`, label: `${name} Study Guide` }, { href: `/${slug}/study-cards/`, label: 'Study Cards' }, { href: `/${slug}/pricing/`, label: '60-Day Pro' }],
    sections: [...article.sections, ...articleSources.map(source => ({ heading: source.title, body: 'Official source checked November 14, 2026.', link: { href: source.url, label: 'Open official source', placement: 'section', targetMode: 'official' } }))],
  }));
  for (const source of content.sources) {
    assert.ok(source.url.startsWith('https://') && source.checkedAt === '2026-11-14');
    sources[source.id] = { source_id: source.id, source_type: 'SOS', title: source.title, reference: source.reference, url: source.url, last_verified_at: source.checkedAt, last_checked_at: source.checkedAt };
  }
  completed.push(code);
}

function write(file, imports, declaration, data) {
  fs.writeFileSync(file, `// Generated by scripts/build-full-state-content.mjs from reviewed state files.\n${imports}\n\n${declaration} = ${JSON.stringify(data, null, 2)};\n`);
}
const codeImport = "import type { FreeStateCode } from '../lib/free-state-catalog';";
write('data/full-state-summary.ts', codeImport, 'export const fullStateSummary: Partial<Record<FreeStateCode, { published: number; free: number; pro: number; cards: number; articles: number; ready: boolean; freeQuestionIds: string[] }>>', summaries);
write('data/full-state-public-questions.ts', `${codeImport}\nimport type { Question } from '../lib/types';`, 'export const fullStatePublicQuestions: Partial<Record<FreeStateCode, Question[]>>', questions);
write('data/full-state-cards.ts', `${codeImport}\nimport type { FullStateLearning } from '../lib/full-state-learning';`, "export const fullStateCards: Partial<Record<FreeStateCode, FullStateLearning['cards']>>", cards);
write('data/full-state-guides.ts', `${codeImport}\nimport type { PrepGuideTopic } from './prep-study-guide';`, 'export const fullStateGuides: Partial<Record<FreeStateCode, Record<string, PrepGuideTopic>>>', guides);
write('data/full-state-articles.ts', `${codeImport}\nimport type { StateArticle } from '../lib/state-articles';`, 'export const fullStateArticles: Partial<Record<FreeStateCode, StateArticle[]>>', articles);
write('data/full-state-sources.ts', "import type { Source } from '../lib/types';", 'export const fullStateSources: Record<string, Source>', sources);
const imports = completed.map(code => `import ${code.toLowerCase()} from './full-states/${code}.json';`).join('\n');
fs.writeFileSync('data/full-state-server.ts', `import 'server-only';\nimport type { FreeStateCode } from '../lib/free-state-catalog';\nimport type { FullStateLearning } from '../lib/full-state-learning';\nimport { stateQuestion } from '../lib/state-question';\nimport { freeStateContent } from './free-state-content';\nimport { fullStateSummary } from './full-state-summary';\n${imports}\n\nconst content: Partial<Record<FreeStateCode, FullStateLearning>> = {${completed.map(code => `${code}: ${code.toLowerCase()} as FullStateLearning`).join(', ')}};\n\nexport function serverStateQuestions(code: FreeStateCode) {\n  const extra = content[code]?.questions || [];\n  const free = new Set(fullStateSummary[code]?.freeQuestionIds || freeStateContent[code]!.questions.map(question => question.id));\n  return [...freeStateContent[code]!.questions, ...extra].map(question => stateQuestion(code, question, free.has(question.id)));\n}\n`);
console.log(JSON.stringify({ completeStates: completed, questions: completed.length * 203, independentCards: completed.reduce((sum, code) => sum + summaries[code].cards, 0), articles: completed.length * 10 }));
