import {PrepStudyGuide} from '@/components/PrepStudyGuide';
import {pageMeta} from '@/lib/seo';
export const metadata=pageMeta({title:'North Carolina Notary Study Guide',description:'Rules, worked examples, official references and chapter reading progress for North Carolina.',path:'/north-carolina/study-guide/',index:true});
export default function Page(){return <PrepStudyGuide code="NC"/>;}
