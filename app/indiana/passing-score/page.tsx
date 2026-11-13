import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Notary Exam Passing Reference", description: "Indiana official notary references and 30-question exam guidance.", path: "/indiana/passing-score/", index: false }), robots: { index: false, follow: false } };
export default function Page() { return <IndianaGuide resources />; }
