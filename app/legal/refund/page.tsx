import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Refund Policy",
  description: "3-day unused refund policy for Arizona Notary Exam Prep Pro.",
  path: paths.refund,
});

export default function Page() {
  return (
    <LegalCopy title="Refund Policy" path={paths.refund}>
      <section id="lifetime">
        <h2>Lifetime Pro exam refund policy</h2>
        <p>Policy version 2026-11-lifetime-v1. Lifetime Pro costs $29.99 USD once and covers Pro features across all available states with no expiration.</p>
        <p>If you fail an official notary exam taken after your Lifetime Pro purchase, you may request a refund within 30 days of the official results. Submit your order number and official failure proof through <a href="/contact/?topic=lifetime-exam-refund">Contact support</a>. Include the exam date and result date so we can verify eligibility.</p>
        <p>We review complete requests within 5–7 business days. Approved refunds are processed through Paddle to the original payment method. Settlement time depends on the payment provider and your bank. A completed refund revokes access granted by the related order. Other valid purchases remain available.</p>
        <p>This policy applies to the account holder’s purchase and official exam. Independent practice test results do not constitute official failure proof. Applicable legal and payment-provider rights continue to apply.</p>
      </section>
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
        One-time New Member and Referral discounts are redeemed once payment is successfully completed. If this
        purchase is later refunded, those one-time discounts will not be reissued or restored.
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
        still apply. A completed refund returns the related Pro entitlement to refunded status.
      </p>
    </LegalCopy>
  );
}
