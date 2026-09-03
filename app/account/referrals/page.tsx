import { ReferralsClient } from "@/components/ReferralsClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Invite & Credits",
  description: "Share your Arizona Exam referral code and track $3 Referral Credits.",
  path: paths.referrals,
});

export default function ReferralsPage() {
  return (
    <main className="wrap hero">
      <h1>Invite & Credits</h1>
      <p className="lede">Share your code. Earn one $3 Referral Credit for each referred friend&apos;s first qualifying purchase.</p>
      <ReferralsClient />
    </main>
  );
}
