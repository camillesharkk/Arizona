import { QuestionsClient } from "@/components/QuestionsClient";
import { getSession } from "@/lib/session";
import { hasStatePro } from "@/lib/entitlements";
import { publishedInQuestions } from "@/data/in-questions";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "Indiana Notary Questions", description: "Practice published original Indiana notary questions by topic.", path: "/indiana/questions/", index: true });
export default async function Page() {
 const session = await getSession(); const pro = await hasStatePro(session?.id,"IN");
 const questions = publishedInQuestions().filter(q => q.is_free || pro);
 return <main className="wrap hero"><h1>Indiana questions</h1><p>{questions.length} questions available to your plan.</p><QuestionsClient stateCode="IN" questions={questions} /></main>;
}
