import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { examConfig } from "@/data/exam-config";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { searchMatrix } from "@/lib/seo-guides";

export const metadata = pageMeta({
  title: `Arizona Notary Exam Guides ${examConfig.year}`,
  description:
    "Arizona notary exam guides that answer one question each: practice test, passing score, fees, bond, remote notarization, a cram sheet, and mistakes to avoid.",
  path: paths.guidesIndex,
});

export default function GuidesIndexPage() {
  return (
    <main className="wrap hero">
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Exam guides", path: paths.guidesIndex }]} />
      <p className="kicker">Search guides</p>
      <h1>Arizona Notary Exam Guides</h1>
      <p className="lede">
        Start with the page that matches the question you searched. Free Quick 10 and one free Full 45 in this browser are on the practice test. There is no separate free-practice article.
      </p>
      <p>
        <Link className="btn btn-primary" href={`${paths.practice}?mode=quick`}>
          Try 10 free questions
        </Link>
      </p>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        {searchMatrix.map((item) => (
          <Link key={item.title} href={item.href} className="card">
            <h3>{item.title}</h3>
            <p>{item.blurb}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
