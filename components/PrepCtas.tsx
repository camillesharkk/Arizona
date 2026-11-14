import Link from "next/link";
import { paths } from "@/lib/paths";

export function PrepCtas({ studyCards = false, guide = true, pro = true, fullPractice = true, sitePaths = paths, fullExamLabel = "Full 45 practice exam" }: {
  studyCards?: boolean;
  guide?: boolean;
  pro?: boolean;
  fullPractice?: boolean;
  sitePaths?: { practice: string; study: string; pricing: string; studyCards: string };
  fullExamLabel?: string;
}) {
  return (
    <div className="row" style={{ margin: "16px 0 24px" }}>
      <Link className="btn btn-primary" href={`${sitePaths.practice}?mode=quick`}>
        Free 10-question test
      </Link>
      {fullPractice ? <Link className="btn btn-ghost" href={`${sitePaths.practice}?mode=full`}>
        {fullExamLabel}
      </Link> : null}
      {guide ? (
        <Link className="btn btn-ghost" href={sitePaths.study}>
          Study Guide
        </Link>
      ) : null}
      {pro ? (
        <Link className="btn btn-ghost" href={sitePaths.pricing}>
          Pro question bank
        </Link>
      ) : null}
      {studyCards ? (
        <Link className="btn btn-ghost" href={sitePaths.studyCards}>
          Study Cards
        </Link>
      ) : null}
    </div>
  );
}
