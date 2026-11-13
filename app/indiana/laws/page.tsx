import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Notary Laws and Official Sources", description: "Indiana official notary references and 30-question exam guidance.", path: "/indiana/laws/", index: true }), robots: { index: true, follow: true } };
export default function Page() { return <IndianaGuide resources />; }
