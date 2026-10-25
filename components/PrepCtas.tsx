import Link from "next/link";
import { paths } from "@/lib/paths";

export function PrepCtas({ studyCards = false, guide = true, pro = true }: { studyCards?: boolean; guide?: boolean; pro?: boolean }) {
  return (
    <div className="row" style={{ margin: "16px 0 24px" }}>
      <Link className="btn btn-primary" href={`${paths.practice}?mode=quick`}>
        Free 10-question test
      </Link>
      <Link className="btn btn-ghost" href={`${paths.practice}?mode=full`}>
        Full 45 practice exam
      </Link>
      {guide ? (
        <Link className="btn btn-ghost" href={paths.study}>
          Study Guide
        </Link>
      ) : null}
      {pro ? (
        <Link className="btn btn-ghost" href={paths.pricing}>
          Pro question bank
        </Link>
      ) : null}
      {studyCards ? (
        <Link className="btn btn-ghost" href={paths.studyCards}>
          Study Cards
        </Link>
      ) : null}
    </div>
  );
}
