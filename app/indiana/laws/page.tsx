import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Notary Laws and Official Sources", description: "Indiana official notary references and 30-question exam guidance.", path: "/indiana/laws/", index: false }), robots: { index: false, follow: false } };
export default function Page() { return <IndianaGuide resources />; }
