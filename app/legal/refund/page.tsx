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
    <LegalCopy title="Refund Policy">
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
        the payment provider (Merchant of Record), duplicate-charge corrections, fraud reviews, or major technical
        failures. Those cases are handled separately and may not restore Referral Credits.
      </p>
      <p>
        Digital Pro purchases are processed by the configured Merchant of Record. Their tax invoice and provider rules
        still apply. A completed refund returns the related Pro entitlement to refunded status.
      </p>
    </LegalCopy>
  );
}
