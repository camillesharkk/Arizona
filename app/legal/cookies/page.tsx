import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Cookie Policy", description: "Cookies used by Arizona Exam.", path: paths.cookies });

export default function Page() {
  return (
    <LegalCopy title="Cookie Policy">
      <p>We use an httpOnly session cookie to keep you signed in. Essential cookies are required for login. We do not run ads during a timed exam attempt.</p>
    </LegalCopy>
  );
}
