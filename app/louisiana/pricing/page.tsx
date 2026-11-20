import { StatePricingPage } from "@/components/StatePricingPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Pro Access",
  description: "Unlock Louisiana and every available state with the same 60-day account Pro purchase.",
  path: "/louisiana/pricing/",
  index: true,
});

export default function Page() {
  return <StatePricingPage state="LA" />;
}
