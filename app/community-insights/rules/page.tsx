import Link from "next/link";
import { communityLimits } from "@/lib/community-config";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Community rules",
  description: "Ground rules for posting in Notary Exam Prep Community Insights.",
  path: "/community-insights/rules/",
});

export default function CommunityRulesPage() {
  return (
    <main className="wrap hero">
      <p><Link href={paths.community + "#community-discussions"}>Back to Community Insights</Link></p>
      <h1>Community rules</h1>
      <div className="card">
        <section>
          <h2>Choose a nickname</h2>
          <p>Your public nickname can be {communityLimits.nicknameMin}–{communityLimits.nicknameMax} characters. Use letters, numbers, spaces, dots, underscores or hyphens. You can change it from Community Insights. Keep email addresses, real names and exam-identifying details private.</p>
        </section>
        <section>
          <h2>Discuss respectfully</h2>
          <p>Questions, disagreements and criticism are welcome. Harassment, threats, impersonation, scams and spam are prohibited. You can publish up to {communityLimits.postsPerMinute} posts or replies per rolling minute. Identical submissions to the same discussion target within {communityLimits.duplicateSeconds} seconds are saved once.</p>
        </section>
        <section>
          <h2>Use trustworthy links</h2>
          <p>Ordinary HTTP and HTTPS links are welcome. Dangerous URL schemes and links with embedded credentials are blocked.</p>
        </section>
        <section>
          <h2>Report a concern</h2>
          <p>Use Report on a post or reply to send a private report. Moderators review reports and may hide or restore messages, send a warning or restrict community access. A community restriction only affects posting, replying and reporting.</p>
        </section>
      </div>
    </main>
  );
}
