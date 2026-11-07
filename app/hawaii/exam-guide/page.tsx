import type { Metadata } from "next";
import { StateSectionCrumb } from "@/components/Breadcrumb";
import { HI_EXAM, HI_PRACTICE_QUOTAS } from "@/lib/hi-site";
import { hiStudyLabel } from "@/lib/hi-topics";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Exam Guide" },
  description: "The Hawaii notary written exam is closed book and requires at least 80 percent. Official question count and time limit are not published.",
  alternates: { canonical: canonicalUrl("/hawaii/exam-guide/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <StateSectionCrumb state="HI" name="Exam guide" path="/hawaii/exam-guide/" />
      <h1>Hawaii notary exam</h1>
      <div className="card">
        <p>The Attorney General page says an approved first-time applicant takes a written closed-book exam on the notary laws, rules, and practices. HAR §5-11-32 requires a minimum of 80 percent. Checked {HI_EXAM.checkedOn}.</p>
        <p>The official materials do not state the number of questions, the time limit, the item type, whether any items are unscored, or how topics are weighted. Those fields stay unknown here. They are not copied from another state.</p>
        <p>{HI_EXAM.practiceName} on this site is {HI_EXAM.practiceQuestionCount} unique questions with no countdown. {HI_EXAM.practiceNote} The topic counts below are this site's draw, not an official blueprint.</p>
        <ul>
          {HI_PRACTICE_QUOTAS.map((quota) => (
            <li key={quota.id}>{hiStudyLabel(quota.id)}: {quota.count} on Comprehensive Practice</li>
          ))}
        </ul>
        <p>HAR §5-11-33 lists the written-exam subjects as general principles and practices, HRS Chapter 456, HRS §§502-41 to 502-74, and HAR Chapter 5-11. The Attorney General page also points readers to related sections, including parts of HRS Chapters 502, 603, and 621. Those are two official lists, not one weighted outline.</p>
        <p>Free Quick 10 shows the explanation after each question. One Comprehensive Practice is free. All published Hawaii questions are free. Pro does not add a hidden Hawaii bank. It removes the one-practice limit for 60 days in every available state.</p>
        <p>A first failure can be retaken without a new application only inside 14 days of the notice. A second failure requires a 90-day wait. Remote online notarization has its own application and its own exam under HAR §5-11-64. It is not a requirement of the ordinary first commission.</p>
        <p><a href="/hawaii/open-book/">Closed-book rule</a>{" · "}<a href="/hawaii/exam-retake/">Retake rules</a>{" · "}<a href="/hawaii/exam-scheduling/">Scheduling</a></p>
        <p>
          <a href={HI_EXAM.sources.ag}>Attorney General notary page</a>
          {" · "}
          <a href={HI_EXAM.sources.scheduler}>Exam scheduler</a>
        </p>
      </div>
    </main>
  );
}
