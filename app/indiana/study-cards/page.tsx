import SharedPage from "@/app/preview/[state]/study-cards/page";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Notary Study Cards", description: "Indiana notary study practice with original questions and official references.", path: "/indiana/study-cards/", index: true }), robots: { index: true, follow: true } };
export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) { return SharedPage({ params: Promise.resolve({ state: "indiana" }), searchParams }); }
