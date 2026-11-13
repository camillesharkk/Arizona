import SharedPage from "@/app/preview/[state]/page";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Notary Exam Prep", description: "Indiana notary study practice with original questions and official references.", path: "/indiana/", index: true }), robots: { index: true, follow: true } };
export default function Page() { return SharedPage({ params: Promise.resolve({ state: "indiana" }) }); }
