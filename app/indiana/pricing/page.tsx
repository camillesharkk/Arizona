import Link from "next/link";
import { inPaths } from "@/lib/in-site";
export const metadata = { title: "Indiana Access", robots: { index: false, follow: false } };
export default function Page() { return <main className="wrap hero"><h1>Indiana access</h1><p>Indiana purchases are not open in this candidate. Free Quick 10, topic practice, independent study cards and one 30-question mock remain available. Existing Indiana Pro test access lasts 60 days and is checked for this state.</p><Link className="btn btn-primary" href={`${inPaths.practice}?mode=quick`}>Start Free Practice</Link></main>; }
