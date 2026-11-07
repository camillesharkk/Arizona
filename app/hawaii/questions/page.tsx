import type { Metadata } from "next";
import { hiQuestionCounts } from "@/data/hi-questions";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { hiStudyLabel } from "@/lib/hi-topics";
import { siteUrl } from "@/lib/site";

const counts = hiQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Exam Questions" },
  description: `${counts.published} published Hawaii notary practice questions. All published questions are free while Hawaii Pro is closed.`,
  alternates: { canonical: `${siteUrl()}/hawaii/questions/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii notary exam questions</h1>
      <div className="card">
        <p>{counts.published} published questions. {counts.free} are free. Comprehensive Practice draws {HI_EXAM.practiceQuestionCount} unique questions. That count is this site's practice setting, not an official form.</p>
        <ul>
          {Object.entries(counts.topics).map(([id, count]) => (
            <li key={id}>{hiStudyLabel(id)}: {count} published</li>
          ))}
        </ul>
        <a className="btn btn-primary" href={`${hiPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
    </main>
  );
}
