import { LegalCopy } from "@/components/LegalCopy";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({ title: "Affiliate Disclosure", description: "How Arizona Exam is compensated for comparison links.", path: paths.affiliate });

export default function Page() {
  return (
    <LegalCopy title="Affiliate Disclosure">
      <p>Some comparison links may be affiliate links. We may earn a commission if you buy through them, at no extra cost to you. Rankings are based on how well a product complements Arizona SOS requirements, not on commission size alone.</p>
    </LegalCopy>
  );
}
