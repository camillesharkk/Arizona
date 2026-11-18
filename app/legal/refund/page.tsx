import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_POLICY_VERSION, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { GUARANTEE_DISCOUNT_NOTICE, ONE_TIME_DISCOUNT_NOTICE } from "@/lib/pricing/copy";

export const metadata = pageMeta({
  title: "Refund Policy",
  description: "Refund terms for 60-day Pro and the Lifetime Pro exam guarantee.",
  path: paths.refund,
});

export default function Page() {
  return (
    <LegalCopy title="Refund Policy" path={paths.refund}>
      <section id="lifetime">
        <h2>Lifetime Pro exam refund policy</h2>
        <p>Policy version {LIFETIME_POLICY_VERSION}. The standard Lifetime Pro price is {formatUsd(LIFETIME_TOTAL_CENTS)} USD.</p>
        <ul>
          <li><strong>{formatUsd(LIFETIME_ACCESS_CENTS)} · Lifetime Pro access.</strong> This portion is nonrefundable under the exam guarantee. It covers Pro access across available states with no expiration.</li>
          <li><strong>{formatUsd(EXAM_GUARANTEE_CENTS)} · Exam guarantee.</strong> If you fail an official notary exam taken after purchase, you can request a refund of this portion within 30 days of the official results. Your Lifetime Pro access remains active after this partial refund.</li>
        </ul>
        <p>Submit your order number, exam date, result date and official failure proof through <a href="/contact/?topic=lifetime-exam-refund">Contact support</a>. The guarantee fee can be refunded once per order.</p>
        <p>We review complete requests within 5–7 business days. Approved partial refunds return through Paddle to the original payment method. Settlement time depends on Paddle and your bank.</p>
        <p>This policy applies to the account holder’s purchase and official exam. Independent practice test results do not constitute official failure proof. Applicable legal and payment-provider rights continue to apply.</p>
      </section>
      <h2>Discounts and refunds</h2>
      <p>{ONE_TIME_DISCOUNT_NOTICE} The amount paid is the basis for any refund.</p>
      <p>{GUARANTEE_DISCOUNT_NOTICE}</p>
      <h2>60-day Pro unused refund policy</h2>
      <p>
        Our standard refund policy for Arizona Notary Exam Prep Pro: you may request a full refund within 72 hours
        (3 days) of a successful purchase only if you have not used any Pro-only feature.
      </p>
      <p>
        Once any Pro-only feature is accessed, the digital service is considered used and the purchase is no longer
        eligible for our standard unused refund policy.
      </p>
      <p>
        After 72 hours from the server-confirmed payment time, the standard unused refund window ends.
      </p>
      <p>
        If Referral Credit(s) were used on the purchase, an eligible unused full refund under this policy will restore
        those credits. Up to 3 Referral Credits can be applied per order, subject to the purchase amount. Referral
        Credits have no cash value and cannot be withdrawn. New Member and Referral discounts are not restored.
      </p>
      <p>
        This standard policy does not prohibit refunds, chargebacks, or other remedies required by applicable law,
        Paddle (Merchant of Record), duplicate-charge corrections, fraud reviews, or major technical
        failures. Those cases are handled separately and may not restore Referral Credits.
      </p>
      <p>
        Digital Pro purchases are processed by Paddle as Merchant of Record. Their tax invoice and provider rules
        still apply. A completed full refund returns the related Pro entitlement to refunded status.
      </p>
    </LegalCopy>
  );
}
