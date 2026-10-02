import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Cookie Policy", description: "Cookies used by Arizona Exam.", path: paths.cookies });

export default function Page() {
  return (
    <LegalCopy title="Cookie Policy" path={paths.cookies}>
      <p>We use an httpOnly session cookie to keep you signed in. Essential cookies are required for login. We do not run ads during a timed exam attempt.</p>
      <p>
        If analytics is enabled, Google Analytics, PostHog, and Microsoft Clarity may set their own cookies to measure traffic and product usage. They are not loaded when the corresponding project id or key is unset. Clarity is configured to mask inputs and to stop recording on login, account, dashboard, and checkout pages.
      </p>
    </LegalCopy>
  );
}
