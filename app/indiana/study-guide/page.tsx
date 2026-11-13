import {PrepStudyGuide} from '@/components/PrepStudyGuide';
import {pageMeta} from '@/lib/seo';
export const metadata=pageMeta({title:'Indiana Notary Study Guide',description:'Rules, worked examples, official references and chapter reading progress for Indiana.',path:'/indiana/study-guide/',index:false});
export default function Page(){return <PrepStudyGuide code="IN"/>;}
