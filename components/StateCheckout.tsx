"use client";

import type { StateCode } from "@/lib/types";

import { usePathname } from "next/navigation";
import { MembershipCheckouts } from "@/components/MembershipCheckouts";
import { MembershipPlans } from "@/components/MembershipPlans";
import { laPaths } from "@/lib/la-site";
import { PRO_DURATION_NOTICE } from "@/lib/pricing/copy";

export function StateCheckout({ source }: { source: StateCode }) {
  const pathname = usePathname();
  if (source === "LA") {
    const practicePath = pathname.startsWith("/preview/") ? `/preview${laPaths.practice}` : laPaths.practice;
    return (
      <>
        <h1>Louisiana practice access</h1>
        <MembershipPlans />
        <MembershipCheckouts source={source} timedNotes={
          <p className="notice">
            <a href={`${practicePath}#about-this-practice`}>About Louisiana’s 203 questions and comprehensive practice</a>
          </p>
        } />
      </>
    );
  }
  return (
    <>
      <MembershipPlans />
      <MembershipCheckouts source={source} timedNotes={<p className="notice">{PRO_DURATION_NOTICE}</p>} />
    </>
  );
}
