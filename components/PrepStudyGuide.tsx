import { fullStateGuides } from '@/data/full-state-guides';
import { isFreeState } from '@/lib/free-state-catalog';
import Link from 'next/link';
import {StudyGuide} from '@/components/StudyGuide';
import {prepPacks, type PrepCode} from '@/lib/prep-pack';
import {prepGuideTopics} from '@/data/prep-study-guide';

export function PrepStudyGuide({code}:{code:PrepCode}) {
 const pack=prepPacks[code];
 const questions=pack.questions();
 return <StudyGuide stateCode={code} title={`${pack.name} Notary Study Guide`}
 lede={`Learn ${pack.name} rules, compare their limits, and apply them to practical situations. Mark chapters as you read and revisit missed topics.`}
 introduction={<><p>Read the <Link href={pack.paths.resources}>official resources</Link> alongside the <Link href={pack.paths.laws}>applicable laws</Link>. Follow the <Link href={pack.paths.become}>first-application checklist</Link> and <Link href={pack.paths.examGuide}>exam guide</Link> for the official next steps.</p><p>{pack.fullDetail}</p>{pack.practiceNotice && <p className="notice">{pack.practiceNotice.body}</p>}</>}
 sitePaths={pack.paths} fullExamLabel={pack.fullTitle}
 chapters={pack.topics.map(topic=>{
  const cards=pack.cards.filter(card=>card.study===topic.id);
  if(!cards.length)throw new Error(`Missing chapter cards: ${code}/${topic.id}`);
  const material=isFreeState(code) ? fullStateGuides[code]?.[topic.id] : prepGuideTopics[code]?.[topic.id];
  const example=questions.filter(q=>q.study_topic===topic.id).sort((a,b)=>b.question_text.length-a.question_text.length)[0];
  return {id:topic.id,title:topic.label,
   summary:material?.summary || `${cards[0].rule} Review the distinctions below before choosing how to proceed.`,
   sections:[...(material?.sections||[]),...cards.map(card=>({heading:card.title,body:`${card.rule} ${card.boundary} ${card.mixup}`,source:{title:card.source,url:card.sourceUrl}}))],
   example:material?.example || {heading:'Worked example — apply the rule',body:example ? `${example.question_text} The appropriate response is: ${example[`option_${example.correct_option.toLowerCase()}` as 'option_a'|'option_b'|'option_c'|'option_d']}. ${example.explanation} Compare the facts with the rule and its limits before completing the requested act.` : `${cards[0].front} ${cards[0].rule} ${cards[0].boundary}`},
   keyFacts:material?.keyFacts || cards.slice(0,3).map(card=>card.rule),
   source:{title:cards[0].source,url:cards[0].sourceUrl,reference:isFreeState(code) ? 'Source review and guide review November 14, 2026' : 'Source review and guide review November 13, 2026'},
   practiceHref:`${pack.paths.practice}?mode=practice&area=${encodeURIComponent(topic.id)}`,
   cardsHref:`${pack.paths.studyCards}?topic=${encodeURIComponent(topic.id)}`,
   mistakesHref:`${pack.paths.mistakes}?topic=${encodeURIComponent(topic.id)}`,
   hasFreePractice:questions.some(q=>q.is_free&&q.study_topic===topic.id)
  };
 })}/>;
}
