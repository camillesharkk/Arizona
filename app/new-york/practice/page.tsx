import Link from "next/link";
import { Suspense } from "react";
import { PracticeAfterword } from "@/components/PracticeAfterword";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { prepPacks } from "@/lib/prep-pack";
import { publicPracticeSamples } from "@/lib/public-practice-samples";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Free New York Notary Practice Test | Questions & Explanations",
  description: "Start with a free New York notary practice test. Try original NYS questions, read the explanations and official references, and review what you missed.",
  path: "/new-york/practice/",
  index: true,
});

export default function Page() {
  const pack = prepPacks.NY;
  const counts = pack.counts();
  const { practice, study, studyCards, mistakes } = pack.paths;
  return <main className="wrap hero" data-public-practice>
    <h1>New York Notary Practice Test</h1>
    <p>Start with Quick 10 for free and see the explanation after each answer. The New York bank has {counts.free} free questions out of {counts.published}. This site’s full practice uses {pack.fullCount} questions in {pack.fullMinutes} minutes.</p>
    <p>These original questions help you study for the NYS notary exam. <Link href={study}>Read the New York study guide</Link> or <a href="#sample-questions">see the free samples</a>.</p>
    <Suspense fallback={<p role="status" data-practice-loading>Loading practice…</p>}><PracticeLaunch stateCode="NY" /></Suspense>
    <PracticeAfterword
      publicLanding
      during="Quick 10 gives immediate feedback. The full practice shows explanations after you submit. The New York Department of State publishes a one-hour, multiple-choice exam and reports pass or fail. It doesn’t give a question count or numeric passing score in its public exam instructions."
      samples={publicPracticeSamples("NY")}
      links={[{ href: practice, label: "Choose a New York practice mode" }, { href: study, label: "New York study guide" }, { href: studyCards, label: "New York study cards" }, { href: mistakes, label: "Review wrong answers" }]}
    />
  </main>;
}
