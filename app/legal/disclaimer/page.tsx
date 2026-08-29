import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { site } from "@/lib/site";

export const metadata = pageMeta({ title: "Disclaimer", description: "Independent exam prep disclaimer.", path: paths.disclaimer });

export default function Page() {
  return (
    <LegalCopy title="Disclaimer">
      <p>{site.independent}</p>
      <p>Nothing on this site is legal advice. Bond amounts, fees, passing scores, and procedures can change. Verify on the Arizona Secretary of State notary pages before you act.</p>
    </LegalCopy>
  );
}
