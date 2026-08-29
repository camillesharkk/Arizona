import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Privacy Policy", description: "How Arizona Exam handles account and study data.", path: paths.privacy });

export default function Page() {
  return (
    <LegalCopy title="Privacy Policy">
      <p>{site.independent}</p>
      <p>We store email, hashed passwords, study attempts, and optional reminder preferences. We do not sell notarial records. Analytics, email (Resend), and MoR payment providers process data only to run the service.</p>
      <p>Contact: use the contact page. You may request deletion of your account data.</p>
    </LegalCopy>
  );
}
