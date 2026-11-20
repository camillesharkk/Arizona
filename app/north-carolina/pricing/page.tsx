import { StatePricingPage } from "@/components/StatePricingPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "North Carolina Notary Pro Access",
  description: "One purchase covers North Carolina and every available state for 60 days.",
  path: "/north-carolina/pricing/",
});

export default function Page() {
  return <StatePricingPage state="NC" />;
}
