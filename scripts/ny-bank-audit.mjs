import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

// Load the actual TypeScript bank without modifying application imports.
const cache = new Map();
function load(file) {
  file = fs.realpathSync(file);
  if (cache.has(file)) return cache.get(file);
  const module = { exports: {} };
  cache.set(file, module.exports);
  const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const require = (name) => {
    if (!name.startsWith('.')) throw new Error(`Unexpected dependency: ${name}`);
    const path = new URL(name.endsWith('.ts') ? name : `${name}.ts`, `file:///${file.replaceAll('\\', '/')}`);
    return load(path);
  };
  vm.runInNewContext(js, { module, exports: module.exports, require, console, Math });
  return module.exports;
}
const content = load('data/ny-content.ts');
const bank = content.publishedNyQuestions();
const cards = content.nyCards;
const articles = load('data/ny-articles.ts').nyArticles;
if (process.argv.includes('--export')) fs.writeFileSync('.tools/ny-bank-review.json', JSON.stringify(bank, null, 2));
const errors = [];
if (bank.filter(q => q.is_free).length !== 29 || bank.filter(q => !q.is_free).length !== 174) errors.push('NY allocation must remain 29 free and 174 Pro');
if (cards.length < 50 || new Set(cards.map(card => card.id)).size !== cards.length || new Set(cards.map(card => card.front)).size !== cards.length) errors.push('Independent card count or uniqueness failed');
const questionStems = new Set(bank.map(question => question.question_text.trim().toLowerCase()));
const derivedCards = cards.filter(card => card.id.startsWith('qc-') || questionStems.has(card.front.trim().toLowerCase()));
if (derivedCards.length) errors.push('Question-derived cards must not count toward the independent card gate');
if (articles.length < 10 || new Set(articles.map(article => article.slug)).size !== articles.length) errors.push('Ten distinct original article records required');
const ids = new Set();
const stems = new Set();
const topics = {};
for (const q of bank) {
  if (ids.has(q.question_id)) errors.push(`Duplicate ID: ${q.question_id}`);
  ids.add(q.question_id);
  const stem = q.question_text.trim().toLowerCase().replace(/\s+/g, ' ');
  if (stems.has(stem)) errors.push(`Duplicate stem: ${q.question_id}`);
  stems.add(stem);
  if (new Set([q.option_a, q.option_b, q.option_c, q.option_d]).size !== 4) errors.push(`${q.question_id}: duplicate choices`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(q.last_verified_at) || q.last_verified_at > new Date().toISOString().slice(0, 10)) errors.push(`${q.question_id}: invalid verification date`);
  if (!/https:\/\/(dos\.ny\.gov|www\.nysenate\.gov)\//.test(q.source_reference)) errors.push(`${q.question_id}: missing official source URL`);
  for (const field of ['question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'explanation', 'source_reference', 'last_verified_at']) {
    if (!q[field]?.trim()) errors.push(`${q.question_id}: missing ${field}`);
  }
  if (!['A', 'B', 'C', 'D'].includes(q.correct_option)) errors.push(`${q.question_id}: invalid answer`);
  for (const letter of ['A', 'B', 'C', 'D']) {
    if (!q.option_feedback?.[letter]?.trim()) errors.push(`${q.question_id}: missing feedback ${letter}`);
  }
  topics[q.study_topic] = (topics[q.study_topic] || 0) + 1;
}
for (let n = 1; n <= bank.length; n++) {
  const id = `ny-${String(n).padStart(3, '0')}`;
  if (!ids.has(id)) errors.push(`Missing consecutive ID: ${id}`);
}
if (bank.length !== 203) errors.push(`Launch target: expected 203, got ${bank.length}`);
console.log(JSON.stringify({ total: bank.length, free: bank.filter(q => q.is_free).length,
  pro: bank.filter(q => !q.is_free).length, independentCards: cards.length - derivedCards.length, questionDerivedCards: derivedCards.length, articles: articles.length, topics, errors,
  limitation: 'Structural checks only. Semantic duplication and legal accuracy require separate review.' }, null, 2));
process.exitCode = errors.length ? 1 : 0;
