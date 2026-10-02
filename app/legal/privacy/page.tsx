import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Privacy Policy", description: "How Arizona Exam handles account and study data.", path: paths.privacy });

export default function Page() {
  return (
    <LegalCopy title="Privacy Policy" path={paths.privacy}>
      <p>{site.independent}</p>
      <p>We store email, hashed passwords, study attempts, and optional reminder preferences. We do not sell notarial records. Email (Resend) and Paddle (Merchant of Record) process payment and service data only to run the service.</p>
      <p>
        When configured, we use Google Analytics 4 for acquisition (source, landing page, and organic search), PostHog for product events such as practice, signup, and checkout steps, and Microsoft Clarity for heatmaps, clicks, scrolls, and session recordings. These tools are off unless their environment variables are set. We do not send question text, answer text, passwords, or payment customer details to them. Analytics identifies a signed-in visitor by an internal account id, not by email, name, or phone. Clarity masks form fields and does not record login, account, dashboard, or checkout screens. Paddle Checkout content is not recorded.
      </p>
      <p>You may request deletion of your account data through the site contact form.</p>
    </LegalCopy>
  );
}
