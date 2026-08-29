import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Refund Policy", description: "Refunds are handled by the Merchant of Record.", path: paths.refund });

export default function Page() {
  return (
    <LegalCopy title="Refund Policy">
      <p>Digital Pro purchases are processed by the configured Merchant of Record (Paddle, Lemon Squeezy, or FastSpring). Their checkout, tax invoice, and refund rules apply. A refunded payment returns the account to Free on webhook.</p>
    </LegalCopy>
  );
}
