import { StatePricingPage } from "@/components/StatePricingPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Connecticut Notary Pro Access",
  description: "One purchase covers Connecticut and every available state for 60 days.",
  path: "/connecticut/pricing/",
});

export default function Page() {
  return <StatePricingPage state="CT" />;
}
