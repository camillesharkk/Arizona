import Link from "next/link";
import { paths } from "@/lib/paths";

export function PrepCtas() {
  return (
    <div className="row" style={{ margin: "20px 0" }}>
      <Link className="btn btn-primary" href={`${paths.practice}?mode=quick`}>
        Free 10-question test
      </Link>
      <Link className="btn btn-ghost" href={`${paths.practice}?mode=full`}>
        Full 45 practice exam
      </Link>
      <Link className="btn btn-ghost" href={paths.study}>
        Study Guide
      </Link>
      <Link className="btn btn-ghost" href={paths.pricing}>
        Pro question bank
      </Link>
    </div>
  );
}
