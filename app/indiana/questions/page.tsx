import { QuestionsClient } from "@/components/QuestionsClient";
import { inQuestionCounts } from "@/data/in-questions";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "Indiana Notary Questions", description: "Practice published original Indiana notary questions by topic.", path: "/indiana/questions/", index: true });
export default function Page() {
 const counts = inQuestionCounts();
 return <main className="wrap hero"><h1>Indiana questions</h1><p>{counts.published} published questions. The practice view loads one page at a time.</p><QuestionsClient stateCode="IN" /></main>;
}
