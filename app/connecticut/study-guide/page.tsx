import {PrepStudyGuide} from '@/components/PrepStudyGuide';
import {pageMeta} from '@/lib/seo';
export const metadata=pageMeta({title:'Connecticut Notary Study Guide',description:'Rules, worked examples, official references and chapter reading progress for Connecticut.',path:'/connecticut/study-guide/',index:false});
export default function Page(){return <PrepStudyGuide code="CT"/>;}
