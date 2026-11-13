import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Apply for an Indiana Notary Commission", description: "First-time Indiana notary application steps with direct official links.", path: "/indiana/become-a-notary/", index: true }), robots: { index: true, follow: true } };
export default function Page() { return <IndianaGuide resources={false} />; }
