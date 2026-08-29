import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Terms of Service", description: "Terms for using Arizona Exam practice tools.", path: paths.terms });

export default function Page() {
  return (
    <LegalCopy title="Terms of Service">
      <p>Practice scores are not official SOS results. You must verify fees, eligibility, and procedures on azsos.gov before applying or notarizing.</p>
      <p>Pro access depends on MoR payment status stored on the server, not on hidden buttons in the browser.</p>
      <p>{site.independent}</p>
    </LegalCopy>
  );
}
