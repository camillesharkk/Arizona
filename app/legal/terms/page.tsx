import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Terms of Service", description: "Terms for using Arizona Exam practice tools.", path: paths.terms });

export default function Page() {
  return (
    <LegalCopy title="Terms of Service" path={paths.terms}>
      <p>Practice scores are not official SOS results. You must verify fees, eligibility, and procedures on azsos.gov before applying or notarizing.</p>
      <p>Paddle is the Merchant of Record. Pro access starts after Paddle confirms payment.</p>
      <p>
        60-Day Pro is a one-time purchase. Your access lasts for 60 days from activation without automatic renewal. If you purchase additional
        60-day access while Pro is still active, the additional time is added after your current expiration date.
      </p>
      <p>
        The Lifetime Pro offer includes lifetime access and a separate $10 exam guarantee fee.
        For the eligibility, price breakdown and refund terms, see the <a href={`${paths.refund}#lifetime`}>Lifetime Pro exam refund policy</a>.
      </p>
      <p>
        Pro access is for the personal use of the account holder. Account sharing, resale, credential sharing, or
        commercial redistribution is not permitted.
      </p>
      <p>
        The standard 60-Day Pro refund policy is a full refund within 72 hours of purchase only if you have not used any Pro-only
        feature. Once any Pro-only feature is accessed, or after 72 hours, the purchase is no longer eligible for that
        standard unused refund. See the <a href={paths.refund}>Refund Policy</a>.
      </p>
      <p>
        One-time New Member and Referral discounts are redeemed when payment succeeds and are not restored after a
        refund. Referral Credit(s) used on an order are restored only after an eligible unused full refund under that
        policy. Up to 3 Referral Credits can be applied per order, subject to the purchase amount.
      </p>
      <p>
        Referral rewards associated with refunded, reversed, fraudulent, or charged-back purchases may be reversed.
        Referral Credits have no cash value and are not a collectible dollar debt.
      </p>
      <p>{site.independent}</p>
    </LegalCopy>
  );
}
