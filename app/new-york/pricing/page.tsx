import { StatePricingPage } from "@/components/StatePricingPage";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Pro Access",
  description: "Unlock New York and every available state with the same 60-day account Pro purchase.",
  path: "/new-york/pricing/",
  index: true,
});

export default function Page() {
  return <StatePricingPage state="NY" />;
}
