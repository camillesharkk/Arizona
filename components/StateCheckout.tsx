import { CheckoutButton } from "@/components/CheckoutButton";
import { PRO_DURATION_NOTICE } from "@/lib/pricing/copy";
import { formatUsd } from "@/lib/pricing/money";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";

export function StateCheckout({ source }: { source: "CA" | "HI" }) {
  return (
    <div className="card">
      <h2>Pro · {formatUsd(STANDARD_PRICE_CENTS)} · 60 days</h2>
      <p>One purchase unlocks Pro across all available states for 60 days, including states added while Pro is active.</p>
      <p>{PRO_DURATION_NOTICE}</p>
      <CheckoutButton productCode="az_exam_pro_60d" sourceState={source} />
    </div>
  );
}
