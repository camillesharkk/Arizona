import Link from "next/link";
import { NcCourseFinder } from "@/components/NcCourseFinder";
import { ncQuestionCounts } from "@/data/nc-content";
import { pageMeta } from "@/lib/seo";
import { ncPaths } from "@/lib/nc-site";

export const metadata = pageMeta({ title: "North Carolina Notary Prep", description: "Find an approved ordinary-notary course, try a free Quick 10 and review North Carolina notary rules before and after class.", path: ncPaths.home, index: false });

export default function Page() {
  const counts = ncQuestionCounts();
  return (
    <main className="wrap hero">
      <h1>North Carolina Notary Prep</h1>
      <p className="lede">Prepare before class. Review the rules after class. Find a course and plan your first traditional notary application.</p>
      <div className="row">
        <a className="btn btn-primary" href="#courses">Find an Approved Course</a>
        <Link className="btn btn-ghost" href={`${ncPaths.practice}?mode=quick&start=1`}>Try 10 Practice Questions</Link>
      </div>
      <p><Link href={ncPaths.become}>First-application checklist</Link></p>
      <p>{counts.published} original questions, including {counts.free} free questions for Quick 10 and topic practice.</p>
      <NcCourseFinder />
      <section className="card" style={{ marginTop: 20 }}>
        <h2>Review after your course</h2>
        <div className="row">
          <Link href={ncPaths.study}>Study Guide</Link>
          <Link href={ncPaths.studyCards}>Study Cards</Link>
          <Link href={ncPaths.mistakes}>Wrong Answers</Link>
          <Link href={ncPaths.daily}>Daily Study</Link>
          <Link href={ncPaths.resources}>Official resources</Link>
        </div>
      </section>
    </main>
  );
}
