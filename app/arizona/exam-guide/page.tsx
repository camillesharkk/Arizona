import Link from "next/link";
import { examConfig } from "@/data/exam-config";
import { getSource } from "@/data/sources";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import { PrepCtas } from "@/components/PrepCtas";

export const metadata = pageMeta({
  title: "Arizona Notary Exam Prep 2026 | 7-Step Study Plan",
  description: "Prepare for the Arizona notary exam step by step: diagnose weak topics, study the free guide, practice scenarios and complete a timed 45-question test.",
  path: paths.examPrep,
});

const steps = [
  { title: "Day 1: establish your starting point", time: "20–30 minutes", body: "Take Quick 10 before studying. Write down the topics you missed and whether each mistake came from an unfamiliar rule or a misread scenario. Use that list to decide where to spend extra time.", href: `${paths.practice}?mode=quick`, label: "Start the free Quick 10", goal: "A short list of weak topics, not just a score." },
  { title: "Day 2: learn identification and appearance", time: "30–45 minutes", body: "Read the identification chapter, then work through its damaged-ID scenario. Explain which lawful identification route you would use and when you would stop. Follow the chapter’s practice link and read the source behind each missed answer.", href: `${paths.study}#identification`, label: "Study identification", goal: "Explain why an ID or credible witness does or does not satisfy the rule." },
  { title: "Day 3: distinguish the notarial acts", time: "30–45 minutes", body: "Study acknowledgments, jurats and copy certification. Compare what the signer declares, whether an oath or affirmation is needed, and what you certify. Practice each topic until you can explain the choice instead of recognizing an answer letter.", href: `${paths.study}#acknowledgments`, label: "Study acknowledgments and continue to jurats", goal: "Recognize the requested act and its required steps." },
  { title: "Day 4: work through journal, seal and conflict scenarios", time: "30–45 minutes", body: "Read the journal, seal and prohibited-acts chapters. Use their scenarios to decide what to record, where to place the stamp and when to decline. Include the current law-update page so an older manual does not become your only source.", href: `${paths.study}#journals`, label: "Study journals, then seals and prohibited acts", goal: "Describe a compliant response to each scenario and cite the rule." },
  { title: "Day 5: finish the remaining topics and repair mistakes", time: "30–45 minutes", body: "Review commission requirements, electronic notarization and RON. Revisit your weakest chapters. For every missed question, write one sentence explaining the rule and one explaining why your first answer was wrong. Topic practice offers free items; some bank items are Pro.", href: `${paths.study}#electronic-ron`, label: "Study electronic notarization and RON", goal: "A corrected explanation for each recurring mistake." },
  { title: "Day 6: take one timed practice exam", time: "60 minutes plus review", body: "Use Full 45 in one sitting. Work with the official manual on screen to practice finding rules. After submitting, inspect the score, topic accuracy and all explanations. One free Full 45 in this browser; another full exam in that same browser is Pro. Repeated questions can inflate a score, so explain the reasoning too.", href: `${paths.practice}?mode=full`, label: "Take Full 45", goal: "Finish within the time limit and identify what still needs review." },
  { title: "Day 7: review and verify your booking instructions", time: "30 minutes, or longer if needed", body: "Use the result’s weakest topics to choose a final chapter review. If you still guess at identification, oaths or conflicts, extend your study schedule. Check the official booking page for accepted ID, delivery options, fees and retake rules before paying or attending.", href: examConfig.officialExamUrl, label: "Check official SOS exam instructions", goal: "Know the remaining weak rules and the current instructions for your appointment." },
];

export default function ExamGuidePage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Exam Prep · Plan your study</p>
      <h1>Arizona Notary Exam Prep 2026 — A Seven-Step Study Plan</h1>
      <p className="lede">Start with a short diagnostic, learn the rules, then use a timed test to find what still needs work. Follow one step per day or spread the steps over a longer period.</p>
      <p>This is a suggested study schedule, not an official course or a guarantee of passing. The <Link href={paths.study}>core Study Guide is free</Link>; <Link href={paths.practice}>Practice Test</Link> handles the questions and results.</p>
      <PrepCtas />
      {steps.map((step, index) => <section key={step.title} className="card" style={{ marginTop: 18 }} id={`step-${index + 1}`}>
        <h2>{step.title}</h2>
        <p className="notice">Suggested time: {step.time}</p>
        <p>{step.body}</p>
        <p><strong>Before moving on:</strong> {step.goal}</p>
        <Link className="btn btn-primary" href={step.href}>{step.label}</Link>
      </section>)}
      <section className="card" style={{ marginTop: 18 }}>
        <h2>Use the official format to plan your time</h2>
        <p>The SOS publishes {examConfig.questionCount} questions in {examConfig.timeLimitMinutes} minutes with an {examConfig.passingScorePercent}% passing score. That leaves about 80 seconds per question on average. Practice locating rules efficiently, then return to difficult questions.</p>
        <p>The official exam’s manual is provided on screen. A physical manual is not allowed at the test. Read the <a href={getSource("sos_manual_2026_08").url}>official Reference Manual</a> while studying.</p>
        <p>Booking details can change. The <a href={examConfig.officialExamUrl}>SOS notary page</a> currently contains both newer and older provider notices; follow its live registration link and confirm fees, remote availability and retake instructions with the provider. Checked September 28, 2026.</p>
      </section>
      <section className="card" style={{ marginTop: 18 }}>
        <h2>What to do after a practice pass</h2>
        <p>Check that you can explain why the alternatives are wrong, especially on repeated questions. If you cannot, return to the matching guide chapter. A practice score cannot predict an official result.</p>
        <p>Passing the official exam is one part of commissioning. Follow the <Link href={paths.become}>commission application checklist</Link> for the bond, oath and filing process; do not start notarizing on the strength of a practice score.</p>
        <p>More answers: <Link href={paths.howHard}>how hard is the exam</Link>, <Link href={paths.passingScore}>passing score</Link>, <Link href={paths.examFaq}>FAQ</Link>, <Link href={paths.cram}>cram sheet</Link>.</p>
      </section>
    </main>
  );
}
