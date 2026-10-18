import Link from "next/link";
import { paths } from "@/lib/paths";

export default function NotFound() {
  return (
    <main className="wrap hero">
      <p className="kicker">404</p>
      <h1>Page not found</h1>
      <p className="lede">That address is not on this site. The practice test is still available.</p>
      <p>
        <Link className="btn btn-primary" href={paths.home}>
          Back to the exam home
        </Link>
      </p>
    </main>
  );
}
