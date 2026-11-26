import { MemberCopy } from "@/components/MemberCopy";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";
import { FREE_FULL_EXAMS } from "@/lib/product";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", indiana: "IN", "north-carolina": "NC" };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const counts = pack.counts();
  return (
    <main className="wrap hero">
      {!pack.available ? <p className="kicker">Practice preview</p> : null}
      <h1>{code === "NC" ? "North Carolina Notary Practice Test" : `${pack.name} practice`}</h1>
      <p>
        <strong>{counts.published} published questions. {counts.free}<MemberCopy member={<> are in the starter set and </>}> are free and </MemberCopy>{counts.pro} are Pro.</strong> {code === "NC" ? "Use Quick 10 before class to check the basics. After class, review the rule behind each miss and practice that topic again." : pack.fullDetail}
      </p>
      {code === "NC" && <p>The approved course and official written exam are separate from this independent practice. <Link href={pack.paths.home + "#courses"}>Find an approved North Carolina course</Link> or <Link href={pack.paths.study}>review the rules in the study guide</Link>.</p>}
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch stateCode={code} />
      </Suspense>
      {code === "PA" && <section className="card">
        <h2>Review your Pennsylvania practice</h2>
        <p>Start with Quick 10. Read the explanation after each answer and revisit the rules you missed. {FREE_FULL_EXAMS} full practice {FREE_FULL_EXAMS === 1 ? "sitting is" : "sittings are"} included per browser or account.</p>
        <div className="tool-row">
          <Link href={pack.paths.mistakes}>Review wrong answers</Link>
          <Link href={pack.paths.study}>Pennsylvania study guide</Link>
          <Link href={pack.paths.resources}>Official Pennsylvania sources</Link>
        </div>
      </section>}
    </main>
  );
}
