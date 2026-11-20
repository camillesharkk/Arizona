import { StatePricingPage } from "@/components/StatePricingPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Pro Access",
  description: "Unlock Pennsylvania and every available state with the same 60-day account Pro purchase.",
  path: "/pennsylvania/pricing/",
  index: true,
});

export default function Page() {
  return <StatePricingPage state="PA" />;
}
