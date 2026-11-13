import SharedPage from "@/app/preview/[state]/daily-study/page";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Daily Study", description: "Indiana notary study practice with original questions and official references.", path: "/indiana/daily-study/", index: false }), robots: { index: false, follow: false } };
export default function Page() { return SharedPage({ params: Promise.resolve({ state: "indiana" }) }); }
