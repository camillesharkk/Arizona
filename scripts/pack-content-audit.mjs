import assert from 'node:assert/strict';
import fs from 'node:fs';
import { testLoader } from './pack-test-utils.mjs';
const load=testLoader(), {prepPacks}=load('lib/prep-pack.ts');
const {prepArticles,prepReferences}=load('lib/prep-articles.ts');
const {currentQuestionVersion}=load('lib/question-revisions.ts');
const requested=process.argv[process.argv.indexOf('--state')+1];
const states=['PA','LA'].includes(requested)?[requested]:['PA','LA'];
const norm=text=>text.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const reports=[];
for(const state of states) {
  const pack=prepPacks[state], bank=pack.questions(), cards=pack.cards, articles=prepArticles[state]||[], errors=[];
  const check=(condition,message)=>{if(!condition)errors.push(message);};
  const floor=Math.max(203,load('data/questions.ts').publishedQuestions().length);
  check(bank.length>=floor,`Question floor ${floor}; actual ${bank.length}`);
  check(bank.filter(q=>q.is_free).length>=10,'Free pool must fill Quick 10');
  check(bank.some(q=>!q.is_free),'Pro pool must exist');
  check(new Set(bank.map(q=>q.question_id)).size===bank.length,'Duplicate question ids');
  check(new Set(bank.map(q=>norm(q.question_text))).size===bank.length,'Duplicate question stems');
  const topics=new Set(pack.topics.map(t=>t.id));
  for(const topic of topics)check(bank.some(q=>q.study_topic===topic&&q.is_free),`${topic}: free topic entry has no questions`);
  for(const topic of topics)check(cards.some(card=>card.study===topic),`${topic}: study-card entry has no independent card`);
  for(const q of bank) {
    const choices=['A','B','C','D'].filter(l=>q['option_'+l.toLowerCase()]?.trim());
    check(q.state===state && q.question_id.startsWith(state.toLowerCase()+'-'),`${q.question_id}: wrong state`);
    check(choices.length===(state==='PA'?3:4),`${q.question_id}: wrong option count`);
    check(choices.includes(q.correct_option),`${q.question_id}: invalid correct answer`);
    check(new Set(choices.map(l=>norm(q['option_'+l.toLowerCase()]))).size===choices.length,`${q.question_id}: repeated options`);
    check(choices.every(l=>q.option_feedback[l]?.trim().length>=15),`${q.question_id}: missing option feedback`);
    check(q.explanation?.length>=30 && q.source_reference?.length>=10,`${q.question_id}: missing explanation/source`);
    check(topics.has(q.study_topic),`${q.question_id}: topic without navigation`);
    check(q.last_verified_at && q.last_verified_at<='2026-11-12',`${q.question_id}: invalid verification date`);
    check(q.version===currentQuestionVersion(q.question_id),`${q.question_id}: revision registry mismatch`);
  }
  check(cards.length>=50,`Independent card floor 50; actual ${cards.length}`);
  check(new Set(cards.map(c=>c.id)).size===cards.length,'Duplicate card ids');
  check(new Set(cards.map(c=>norm(c.front))).size===cards.length,'Duplicate card fronts');
  const stems=new Set(bank.map(q=>norm(q.question_text)));
  for(const card of cards) {
    check(!stems.has(norm(card.front)),`${card.id}: question-derived card counted as independent`);
    check(topics.has(card.study),`${card.id}: card topic missing`);
    check([card.rule,card.boundary,card.mixup,card.source,card.sourceUrl].every(Boolean),`${card.id}: incomplete card`);
    check(/^https:\/\//.test(card.sourceUrl),`${card.id}: invalid source URL`);
  }
  check(articles.length>=10,`Original article floor 10; actual ${articles.length}`);
  for(const a of articles) {
    check(a.state===state && a.path.startsWith(pack.paths.home+'guides/'),`${a.id}: article wrong state/path`);
    check(a.sections.length>=3,`${a.id}: insufficient article sections`);
    check(a.sections.some(s=>s.link?.targetMode==='official'),`${a.id}: missing official source link`);
  }
  for(const slug of ['passing-score','laws','become-a-notary']) check(Boolean(prepReferences[state]?.[slug]),`Missing ${slug} reference page`);
  for(let seed=0;seed<200;seed++) {
    const quick=pack.pickQuick(seed),full=pack.pickFull(seed);
    check(quick.length===10 && quick.every(q=>q.is_free) && new Set(quick.map(q=>q.question_id)).size===10,`Quick ${seed} cannot fill free unique quota`);
    check(full?.questions.length===pack.fullCount && new Set(full.questions.map(q=>q.question_id)).size===pack.fullCount,`Full ${seed} cannot fill unique quota`);
    if(full && state==='PA') {
      check(full.unscoredIds.length===5,`PA full ${seed} needs 5 unscored`);
      const scored=full.questions.filter(q=>!full.unscoredIds.includes(q.question_id));
      check(['obtaining','performing','compliance'].every((area,i)=>scored.filter(q=>q.exam_area===area).length===[4,18,3][i]),`PA full ${seed} scored quotas changed`);
    }
  }
  // Similarity is an editorial queue, not proof of semantic duplication.
  const candidates=[];
  for(let i=0;i<bank.length;i++)for(let j=i+1;j<bank.length;j++){
    const a=new Set(norm(bank[i].question_text).split(' ')),b=new Set(norm(bank[j].question_text).split(' '));
    const common=[...a].filter(w=>b.has(w)).length;
    if(common/(a.size+b.size-common)>.75)candidates.push([bank[i].question_id,bank[j].question_id]);
  }
  const report={state,total:bank.length,free:bank.filter(q=>q.is_free).length,pro:bank.filter(q=>!q.is_free).length,independentCards:cards.length,questionDerivedCards:0,articles:articles.length,references:Object.keys(prepReferences[state]||{}),topics:Object.fromEntries(pack.topics.map(t=>[t.id,bank.filter(q=>q.study_topic===t.id).length])),similarityCandidates:candidates,errors};
  reports.push(report);console.log(JSON.stringify(report,null,2));
}
if(process.argv.includes('--export')){fs.mkdirSync('.tools',{recursive:true});fs.writeFileSync('.tools/pack-content-audit.json',JSON.stringify(reports,null,2));}
assert.ok(reports.every(r=>r.errors.length===0),'Content gate failed; see per-state errors. Legal accuracy and semantic review remain separate.');
