import assert from 'node:assert/strict';
import {testLoader} from './pack-test-utils.mjs';
const load=testLoader(),{presentExamQuestions}=load('lib/answer-sequence.ts');
const {pickPaFullExam}=load('data/pa-content.ts');
const {parseSitting,readSitting,sittingKey}=load('lib/sitting.ts');
const {currentQuestionVersion}=load('lib/question-revisions.ts');
const legacyDraw=pickPaFullExam(181);
const legacy=presentExamQuestions(legacyDraw.questions,181,1);
const stored=parseSitting({version:1,owner:'legacy',state:'PA',mode:'full',seed:181,questionIds:legacyDraw.questions.map(q=>q.question_id),questionVersions:Object.fromEntries(legacyDraw.questions.map(q=>[q.question_id,currentQuestionVersion(q.question_id)])),answers:{[legacy.questions[0].question_id]:'A'}},'legacy','full','PA');
assert.ok(stored);
assert.equal(stored.presentationVersion,1);
assert.deepEqual(presentExamQuestions(legacyDraw.questions,stored.seed,stored.presentationVersion).maps,legacy.maps,'Legacy sitting retains its original choice permutation');
const entries=new Map(),storage={getItem:k=>entries.get(k)??null,setItem:(k,v)=>entries.set(k,v)};
const key=sittingKey('legacy','full','PA');
entries.set(key,JSON.stringify({...stored,questionVersions:{[stored.questionIds[0]]:0}}));
assert.equal(readSitting(storage,'legacy','full','PA'),null);
assert.ok([...entries.keys()].some(k=>k.startsWith(key+':history:')),'A replaced PA sitting must be archived without deleting the original');
for(let seed=0;seed<200;seed++) {
  const draw=pickPaFullExam(seed),shown=presentExamQuestions(draw.questions,seed);
  const counts=['A','B','C'].map(l=>shown.questions.filter(q=>q.correct_option===l).length);
  assert.ok(Math.max(...counts)-Math.min(...counts)<=1,`PA three-choice correct positions must be balanced: seed${seed} ${counts}`);
  for(const q of shown.questions) {
    assert.equal(q.option_d,'');
    const original=draw.questions.find(item=>item.question_id===q.question_id);
    const letter=shown.maps[q.question_id][q.correct_option];
    assert.equal(letter,original.correct_option);
    assert.equal(q['option_'+q.correct_option.toLowerCase()],original['option_'+letter.toLowerCase()]);
  }
}
console.log('PA: 200 seeded three-choice displays balanced, correct text and canonical answer map preserved');
