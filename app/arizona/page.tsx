import Link from "next/link";
import { officialExam } from "@/data/exam-config";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { JsonLd, quizJson } from "@/components/JsonLd";
import { AccountStatusBanner } from "@/components/AccountStatusBanner";
import { HomeEntry } from "@/components/HomeEntry";

export const metadata = pageMeta({
  title: "Arizona Notary Exam 2026",
  description: "Free Arizona notary exam practice: 45-question test, study guide, and official-source questions.",
  path: paths.home,
  keywords: "Arizona notary exam, Arizona notary test, Arizona notary 2026",
});

export default function ArizonaHub() {
  return (
    <main className="home-canvas">
      <div className="wrap home-main">
        <JsonLd data={quizJson()} />
        <AccountStatusBanner />
        <HomeEntry
          note={
            <>
              <p>
                Independent Arizona practice. The 10-question check is free and does not start a full practice exam.
                Flashcards open with a free preview. The full practice exam is a separate start.
              </p>
              <p>
                <Link href={paths.study}>Study guide</Link>
                {" · "}
                <Link href={paths.examPrep}>Exam guide</Link>
                {" · "}
                <Link href={paths.pricing}>Free and Pro access</Link>
                {" · "}
                <a href={officialExam.filingUrl}>Official notary page</a>
              </p>
            </>
          }
        />
      </div>
    </main>
  );
}
