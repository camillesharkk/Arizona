import SharedPage from "@/app/preview/[state]/page";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Notary Exam Prep", description: "Indiana notary study practice with original questions and official references.", path: "/indiana/", index: false }), robots: { index: false, follow: false } };
export default function Page() { return SharedPage({ params: Promise.resolve({ state: "indiana" }) }); }
