import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Official Notary Resources", description: "First-time Indiana notary application steps with direct official links.", path: "/indiana/resources/", index: false }), robots: { index: false, follow: false } };
export default function Page() { return <IndianaGuide resources={true} />; }
