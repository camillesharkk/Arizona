import Link from "next/link";
import { chapters } from "@/data/study-guide";
import { getSource } from "@/data/sources";
import { ChapterProgress, Readiness } from "@/components/StudyProgress";
import { paths } from "@/lib/paths";
import { eligibleExamPool } from "@/lib/quiz";
import { pageMeta } from "@/lib/seo";
import { PrepCtas } from "@/components/PrepCtas";
import { HomeProCta } from "@/components/HomeProCta";

const chapterReferences: Record<string, string[]> = {
  identification: ["ars_41_253", "ars_41_254", "ars_41_256"],
  acknowledgments: ["ars_41_254", "ars_41_264"],
  jurats: ["ars_41_253", "ars_41_264"],
  journals: ["az_sb_1479_2026"],
  "seals-fees": ["ars_41_267", "ars_41_316"],
  "prohibited-acts": ["ars_41_252", "ars_41_256"],
  "copy-certification": ["ars_41_252", "ars_41_319"],
  "electronic-ron": ["sos_remote_enotary", "az_sb_1479_2026"],
  "after-exam": ["ars_41_269"],
};

export const metadata = pageMeta({
  title: "Free Arizona Notary Study Guide 2026 | Rules & Examples",
  description: "Learn Arizona notary identification, notarial acts, journals, seals and prohibited acts with worked examples, official sources and topic practice. Free, no login.",
  path: paths.study,
});

export default async function StudyGuidePage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Study Guide</p>
      <h1>Free Arizona Notary Study Guide 2026 — Rules, Examples & Topic Practice</h1>
      <p className="lede">
        Learn what to do when an ID is damaged, a signer refuses an oath, or a document involves a conflict of interest.
        Every chapter includes a worked scenario, an official source and topic practice. The core guide is free and requires no login.
      </p>
      <p>
        Use this independently written guide alongside the <a href={getSource("sos_manual_2026_08").url}>official SOS Reference Manual</a>.
        The current SOS download is named “Notary-Manual-Aug-2026.pdf”; its cover says January 2025.
        For later changes, use the <Link href={paths.laws}>verified Arizona law updates</Link> and chaptered statutes.
      </p>
      <PrepCtas />
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <nav className="card toc">
          <h2>Chapters</h2>
          {chapters.map((c) => (
            <a key={c.id} href={`#${c.id}`}>
              {c.title}
            </a>
          ))}
        </nav>
        <Readiness />
      </div>
      {chapters.map((c) => {
        const src = getSource(c.source_id);
        return (
          <article key={c.id} id={c.id} className="card" style={{ marginTop: 18 }}>
            <div className="row space">
              <h2>{c.title}</h2>
              <ChapterProgress id={c.id} />
            </div>
            <p className="lede">{c.summary}</p>
            {c.sections.map((s) => (
              <div key={s.heading}>
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
              </div>
            ))}
            {c.example && <section className="explain"><h3>{c.example.heading}</h3><p>{c.example.body}</p></section>}
            <h3>Key facts</h3>
            <div className="grid grid-3">
              {c.keyFacts.map((k) => (
                <div className="stat" key={k}>
                  <span>{k}</span>
                </div>
              ))}
            </div>
            <p className="notice">
              Official source: <a href={src.url}>{src.title}</a> · {src.reference}
            </p>
            {chapterReferences[c.id]?.length > 0 && <p className="notice">Also consult: {chapterReferences[c.id].map((id, i) => <span key={id}>{i > 0 ? " · " : ""}<a href={getSource(id).url}>{getSource(id).title}</a></span>)}</p>}
            {c.id === "new-laws" && <p><Link href={paths.laws}>Read the verified change and its effective date</Link></p>}
            {eligibleExamPool({ topic: c.topic, freeOnly: true }).length > 0 ? (
              <Link className="btn btn-primary" href={paths.topic(c.topic)}>
                Practice this topic free
              </Link>
            ) : (
              <p>
                This topic’s practice questions are Pro-only.{" "}
                <Link href={paths.topic(c.topic)}>See the Pro explanation</Link>
                {" · "}
                <Link href={`${paths.practice}?mode=quick`}>Start free Quick 10</Link>
              </p>
            )}
          </article>
        );
      })}
      <HomeProCta />
    </main>
  );
}
