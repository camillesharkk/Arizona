import { BillingAccessClient } from "@/components/BillingAccessClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Billing & Access",
  description: "View Arizona Pro purchases, promotions used, and refund eligibility.",
  path: paths.billing,
});

export default function BillingPage() {
  return (
    <main className="wrap hero">
      <h1>Billing & Access</h1>
      <p className="lede">Purchase history, refund eligibility, and promotions used on completed orders.</p>
      <BillingAccessClient />
    </main>
  );
}
