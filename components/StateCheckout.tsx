import type { StateCode } from "@/lib/types";

import { MembershipCheckouts } from "@/components/MembershipCheckouts";
import { MembershipPlans } from "@/components/MembershipPlans";
import { laPaths } from "@/lib/la-site";
import { PRO_DURATION_NOTICE } from "@/lib/pricing/copy";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";

export async function StateCheckout({ source, preview = false }: { source: StateCode; preview?: boolean }) {
  const lifetimeAvailable = !preview && await getLifetimeCheckoutAvailability();
  if (source === "LA") {
    const practicePath = preview ? `/preview${laPaths.practice}` : laPaths.practice;
    return (
      <>
        <h1>Louisiana practice access</h1>
        <MembershipPlans lifetimeAvailable={lifetimeAvailable} />
        <MembershipCheckouts source={source} lifetimeAvailable={lifetimeAvailable} timedNotes={
          <p className="notice">
            <a href={`${practicePath}#about-this-practice`}>About Louisiana’s 203 questions and comprehensive practice</a>
          </p>
        } />
      </>
    );
  }
  return (
    <>
      <MembershipPlans lifetimeAvailable={lifetimeAvailable} />
      <MembershipCheckouts source={source} lifetimeAvailable={lifetimeAvailable} timedNotes={<p className="notice">{PRO_DURATION_NOTICE}</p>} />
    </>
  );
}
