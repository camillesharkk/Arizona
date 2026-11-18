"use client";

import type { StateCode } from "@/lib/types";

import { usePathname } from "next/navigation";
import { CheckoutButton } from "@/components/CheckoutButton";
import { MembershipPlans } from "@/components/MembershipPlans";
import { laPaths } from "@/lib/la-site";
import { PRO_DURATION_NOTICE } from "@/lib/pricing/copy";
import { formatUsd } from "@/lib/pricing/money";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";

export function StateCheckout({ source }: { source: StateCode }) {
  const pathname = usePathname();
  if (source === "LA") {
    const practicePath = pathname.startsWith("/preview/") ? `/preview${laPaths.practice}` : laPaths.practice;
    return (
      <>
        <h1>Louisiana practice access</h1>
        <MembershipPlans />
        <section className="card" id="pro-checkout">
          <h2>Unlock the full Louisiana question bank</h2>
          <p>Practice more questions, understand your mistakes, and focus on what to review next.</p>
          <ul>
            <li>All 203 Louisiana practice questions with answer explanations</li>
            <li>40-question comprehensive practice</li>
            <li>60-day Pro access across supported states</li>
          </ul>
          <CheckoutButton
            productCode="az_exam_pro_60d"
            sourceState={source}
            ctaLabel="Get 60-Day Pro"
            belowCta={<p className="notice"><a href={`${practicePath}#about-this-practice`}>Independent practice for the Louisiana notary exam.</a></p>}
          />
          <p className="notice">{PRO_DURATION_NOTICE}</p>
        </section>
      </>
    );
  }
  return (
    <>
      <MembershipPlans />
      <section className="card" id="pro-checkout">
        <h2>60-Day Pro Checkout · {formatUsd(STANDARD_PRICE_CENTS)}</h2>
        <p>{PRO_DURATION_NOTICE}</p>
        <CheckoutButton productCode="az_exam_pro_60d" sourceState={source} />
      </section>
    </>
  );
}
