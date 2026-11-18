import Link from "next/link";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_POLICY_VERSION } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { GUARANTEE_DISCOUNT_NOTICE } from "@/lib/pricing/copy";

export function LifetimeGuaranteeTerms() {
  return (
    <>
      <p><strong>{formatUsd(LIFETIME_ACCESS_CENTS)} Lifetime Pro access.</strong> This portion is nonrefundable under the exam guarantee.</p>
      <p><strong>{formatUsd(EXAM_GUARANTEE_CENTS)} exam guarantee.</strong> A qualifying refund returns this fee and keeps your lifetime access active.</p>
      <p>{GUARANTEE_DISCOUNT_NOTICE}</p>
      <ol>
        <li>Take the official notary exam after purchase.</li>
        <li>If you fail, <Link href="/contact/?topic=lifetime-exam-refund">contact support</Link> within 30 days of the official results with your order number, exam and result dates, and official proof.</li>
      </ol>
      <p>Complete requests are reviewed within 5–7 business days. Paddle returns approved refunds to the original payment method. Settlement time depends on Paddle and your bank.</p>
      <p><Link href="/legal/refund/#lifetime">Read the full Lifetime refund policy</Link> · Policy {LIFETIME_POLICY_VERSION}</p>
    </>
  );
}
