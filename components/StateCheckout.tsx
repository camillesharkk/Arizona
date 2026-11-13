"use client";

import { usePathname } from "next/navigation";
import { CheckoutButton } from "@/components/CheckoutButton";
import { laPaths } from "@/lib/la-site";
import { PRO_DURATION_NOTICE } from "@/lib/pricing/copy";
import { formatUsd } from "@/lib/pricing/money";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";

export function StateCheckout({ source }: { source: "CA" | "HI" | "NY" | "PA" | "LA" | "CT" | "NC" | "IN" }) {
  const pathname = usePathname();
  if (source === "LA") {
    const practicePath = pathname.startsWith("/preview/") ? `/preview${laPaths.practice}` : laPaths.practice;
    return (
      <div className="card">
        <h1>Unlock the full Louisiana question bank</h1>
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
      </div>
    );
  }
  return (
    <div className="card">
      <h2>Pro · {formatUsd(STANDARD_PRICE_CENTS)} · 60 days</h2>
      <p>{PRO_DURATION_NOTICE}</p>
      <CheckoutButton productCode="az_exam_pro_60d" sourceState={source} />
    </div>
  );
}
